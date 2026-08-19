import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Product, StockStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Standard financial rounding helper to eliminate floating point inaccuracies (e.g., 0.1 + 0.2 = 0.30000000000000004)
 */
export function round2(num: number): number {
  return Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount: number, symbol = '$'): string {
  const rounded = round2(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
  return `${symbol}${formatted}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function calculateStockStatus(product: Partial<Product>): StockStatus {
  const stock = product.stockQuantity ?? 0;
  const reorder = product.reorderPoint ?? 10;

  if (product.status === 'Dead Stock') return 'Dead Stock';
  if (stock <= 0) return 'Out of Stock';
  if (stock <= reorder) return 'Low Stock';
  return 'Healthy';
}

export function getStatusBadgeStyle(status: StockStatus | string) {
  switch (status) {
    case 'Healthy':
    case 'Active':
    case 'Completed':
    case 'Received':
    case 'VIP':
      return 'bg-[#F4F5DC] text-[#787B00] border-[#D1D480]';
    case 'Low Stock':
    case 'Partial':
    case 'Sent':
    case 'Pending':
      return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
    case 'Out of Stock':
    case 'Cancelled':
    case 'Refunded':
      return 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]';
    case 'Dead Stock':
    case 'Inactive':
      return 'bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB]';
    default:
      return 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]';
  }
}
