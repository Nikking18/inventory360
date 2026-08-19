import { openDB, IDBPDatabase } from 'idb';
import {
  Product,
  Category,
  Supplier,
  Customer,
  Location,
  Sale,
  PurchaseOrder,
  StockMovement,
  StockTransfer,
  StockAudit,
  Expense,
  BusinessSettings,
  FulfillmentOrder,
  SalesChannel,
} from './types';

const DB_NAME = 'inventory360_db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('suppliers')) {
          db.createObjectStore('suppliers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('locations')) {
          db.createObjectStore('locations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sales')) {
          db.createObjectStore('sales', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('purchaseOrders')) {
          db.createObjectStore('purchaseOrders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stockMovements')) {
          db.createObjectStore('stockMovements', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stockTransfers')) {
          db.createObjectStore('stockTransfers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stockAudits')) {
          db.createObjectStore('stockAudits', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('expenses')) {
          db.createObjectStore('expenses', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('fulfillmentOrders')) {
          db.createObjectStore('fulfillmentOrders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('salesChannels')) {
          db.createObjectStore('salesChannels', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// Generic CRUD helpers
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await getDB();
  if (!db) return [];
  return db.getAll(storeName);
}

export async function getByIdFromStore<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await getDB();
  if (!db) return undefined;
  return db.get(storeName, id);
}

export async function putToStore<T>(storeName: string, item: T): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.put(storeName, item);
}

export async function putManyToStore<T>(storeName: string, items: T[]): Promise<void> {
  const db = await getDB();
  if (!db) return;
  const tx = db.transaction(storeName, 'readwrite');
  for (const item of items) {
    await tx.store.put(item);
  }
  await tx.done;
}

export async function deleteFromStore(storeName: string, id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.delete(storeName, id);
}

export async function deleteManyFromStore(storeName: string, ids: string[]): Promise<void> {
  const db = await getDB();
  if (!db) return;
  const tx = db.transaction(storeName, 'readwrite');
  for (const id of ids) {
    await tx.store.delete(id);
  }
  await tx.done;
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.clear(storeName);
}

export async function clearAllStores(): Promise<void> {
  const db = await getDB();
  if (!db) return;
  const storeNames = [
    'products',
    'categories',
    'suppliers',
    'customers',
    'locations',
    'sales',
    'purchaseOrders',
    'stockMovements',
    'stockTransfers',
    'stockAudits',
    'expenses',
    'settings',
    'fulfillmentOrders',
    'salesChannels',
  ];
  const tx = db.transaction(storeNames, 'readwrite');
  for (const store of storeNames) {
    if (db.objectStoreNames.contains(store)) {
      await tx.objectStore(store).clear();
    }
  }
  await tx.done;
}
