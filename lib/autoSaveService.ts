import { exportWorkspaceJSON, importWorkspaceJSON } from './exportImport';
import { getAllFromStore, putToStore, deleteFromStore, clearStore, getByIdFromStore } from './db';
import { AutoSaveConfig, AutoSaveInterval, AutoSaveRecord } from './types';

export const AUTOSAVE_INTERVAL_OPTIONS: Array<{ value: AutoSaveInterval; label: string; ms: number }> = [
  { value: '30m', label: 'Every 30 Minutes', ms: 30 * 60 * 1000 },
  { value: '1h', label: 'Every 1 Hour', ms: 60 * 60 * 1000 },
  { value: '6h', label: 'Every 6 Hours', ms: 6 * 60 * 60 * 1000 },
  { value: '12h', label: 'Every 12 Hours', ms: 12 * 60 * 60 * 1000 },
  { value: '24h', label: 'Every 24 Hours (Daily)', ms: 24 * 60 * 60 * 1000 },
  { value: '7d', label: 'Every 7 Days (Weekly)', ms: 7 * 24 * 60 * 60 * 1000 },
  { value: '30d', label: 'Every 30 Days (Monthly)', ms: 30 * 24 * 60 * 60 * 1000 },
];

export function getIntervalMs(interval: AutoSaveInterval): number {
  const match = AUTOSAVE_INTERVAL_OPTIONS.find((opt) => opt.value === interval);
  return match ? match.ms : 24 * 60 * 60 * 1000;
}

/**
 * Checks if the browser supports modern local Directory Picker (File System Access API)
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/**
 * Prompts user to pick a local folder/directory on their computer for automated backups
 */
export async function pickLocalDirectory(): Promise<{
  success: boolean;
  folderName?: string;
  pathDisplay?: string;
  error?: string;
}> {
  if (!isFileSystemAccessSupported()) {
    return {
      success: false,
      error: 'File System Access API is not supported on this browser. You can enter a custom directory path or storage snapshots will be preserved.',
    };
  }

  try {
    const dirHandle = await (window as any).showDirectoryPicker({
      id: 'inventory360_backups',
      mode: 'readwrite',
      startIn: 'documents',
    });

    if (!dirHandle) {
      return { success: false, error: 'No directory was chosen.' };
    }

    // Save directory handle in IndexedDB for subsequent silent auto-saves
    await putToStore('autosave_handles', {
      id: 'primary_backup_dir',
      handle: dirHandle,
      name: dirHandle.name,
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      folderName: dirHandle.name,
      pathDisplay: dirHandle.name,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'Directory selection cancelled by user.' };
    }
    console.error('Error picking local directory:', err);
    return { success: false, error: err.message || 'Failed to select directory.' };
  }
}

/**
 * Retrieves stored FileSystemDirectoryHandle from IndexedDB
 */
export async function getStoredDirectoryHandle(): Promise<any | null> {
  try {
    const stored = await getByIdFromStore<{ id: string; handle: any; name: string }>('autosave_handles', 'primary_backup_dir');
    if (!stored || !stored.handle) return null;

    const handle = stored.handle;
    // Verify permissions
    if (typeof handle.queryPermission === 'function') {
      const perm = await handle.queryPermission({ mode: 'readwrite' });
      if (perm === 'granted') return handle;
      if (perm === 'prompt') {
        const req = await handle.requestPermission({ mode: 'readwrite' });
        if (req === 'granted') return handle;
      }
    }
    return handle;
  } catch (err) {
    console.warn('Could not retrieve stored directory handle:', err);
    return null;
  }
}

/**
 * Performs an automated backup:
 * - Generates full JSON snapshot
 * - Silently writes to local folder (without prompting) if configured
 * - Logs snapshot record in history
 */
export async function performAutoSave(
  config: AutoSaveConfig,
  triggerReason = 'Scheduled Auto-Save'
): Promise<{
  record: AutoSaveRecord;
  updatedConfig: AutoSaveConfig;
}> {
  const jsonString = await exportWorkspaceJSON();
  const blob = new Blob([jsonString], { type: 'application/json' });
  const sizeBytes = blob.size;

  let parsed: any = {};
  try {
    parsed = JSON.parse(jsonString);
  } catch {}

  const recordCount = Object.values(parsed.data || {}).reduce(
    (acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const filename = `inventory360_autosave_${dateStamp}.json`;

  let status: AutoSaveRecord['status'] = 'Saved to Storage Snapshot';
  let targetFolder = config.folderName || 'Browser Secure Storage';

  // Attempt silent write to local folder handle
  try {
    const dirHandle = await getStoredDirectoryHandle();
    if (dirHandle) {
      const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(jsonString);
      await writable.close();
      status = 'Saved to Local Folder';
      targetFolder = dirHandle.name || config.folderName || 'Selected Local Folder';
    }
  } catch (err) {
    console.warn('Silent local folder write fallback to storage snapshot:', err);
    status = 'Saved to Storage Snapshot';
  }

  const recordId = `as_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: AutoSaveRecord = {
    id: recordId,
    timestamp: now.toISOString(),
    filename,
    sizeBytes,
    recordCount,
    status,
    folderName: targetFolder,
    jsonData: jsonString,
  };

  // Persist record to IndexedDB
  await putToStore('autosave_history', record);

  // Prune history to keep latest 50 records
  try {
    const allRecords = await getAllFromStore<AutoSaveRecord>('autosave_history');
    if (allRecords.length > 50) {
      allRecords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const excess = allRecords.slice(0, allRecords.length - 50);
      for (const rec of excess) {
        await deleteFromStore('autosave_history', rec.id);
      }
    }
  } catch {}

  const intervalMs = getIntervalMs(config.interval);
  const nextDue = new Date(now.getTime() + intervalMs).toISOString();

  const updatedConfig: AutoSaveConfig = {
    ...config,
    lastAutoSavedAt: now.toISOString(),
    nextAutoSaveDueAt: nextDue,
  };

  return { record, updatedConfig };
}

/**
 * Retrieves all autosave history entries sorted newest first
 */
export async function getAutoSaveHistory(): Promise<AutoSaveRecord[]> {
  const records = await getAllFromStore<AutoSaveRecord>('autosave_history');
  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Deletes a single autosave record
 */
export async function deleteAutoSaveRecord(id: string): Promise<void> {
  await deleteFromStore('autosave_history', id);
}

/**
 * Clears all autosave history entries
 */
export async function clearAllAutoSaveHistory(): Promise<void> {
  await clearStore('autosave_history');
}

/**
 * Downloads the JSON file for an autosave record directly
 */
export function downloadAutoSaveRecordFile(record: AutoSaveRecord): void {
  if (!record.jsonData) return;
  const blob = new Blob([record.jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = record.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restores entire database from an autosaved snapshot
 */
export async function restoreFromAutoSaveRecord(record: AutoSaveRecord): Promise<boolean> {
  if (!record.jsonData) return false;
  return importWorkspaceJSON(record.jsonData);
}
