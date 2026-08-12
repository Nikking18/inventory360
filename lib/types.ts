export type StockStatus = 'Healthy' | 'Low Stock' | 'Out of Stock' | 'Dead Stock';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  description: string;
  categoryId: string;
  categoryName: string;
  costPrice: number;
  retailPrice: number;
  stockQuantity: number;
  reorderPoint: number;
  supplierId: string;
  supplierName: string;
  imageUrl?: string;
  status: StockStatus;
  locationQuantities: Record<string, number>; // locationId -> qty
  lastSoldAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  leadTimeDays: number;
  rating?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalOrders: number;
  totalRevenue: number;
  outstandingBalance: number;
  lastPurchaseDate?: string;
  status: 'Active' | 'VIP' | 'Inactive';
  createdAt: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  address: string;
  isMain?: boolean;
}

export type MovementType = 'Sale' | 'Purchase' | 'Return' | 'Transfer' | 'Adjustment' | 'Damage';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: MovementType;
  quantityChange: number; // e.g. -2 or +10
  previousStock: number;
  newStock: number;
  locationId: string;
  locationName: string;
  referenceId?: string; // saleNumber, poNumber, etc.
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  unitCost: number;
  quantity: number;
  total: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  costOfGoodsSold: number;
  grossProfit: number;
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Store Credit';
  status: 'Completed' | 'Refunded';
  locationId: string;
  locationName: string;
  createdAt: string;
}

export interface POItem {
  productId: string;
  productName: string;
  sku: string;
  unitCost: number;
  orderedQuantity: number;
  receivedQuantity: number;
  total: number;
}

export type POStatus = 'Draft' | 'Sent' | 'Partial' | 'Received' | 'Cancelled';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: POItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: POStatus;
  expectedDate: string;
  receivedDate?: string;
  locationId: string;
  locationName: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  locationId?: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  sourceLocationId: string;
  sourceLocationName: string;
  targetLocationId: string;
  targetLocationName: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
  }[];
  status: 'Pending' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface StockAuditItem {
  productId: string;
  productName: string;
  sku: string;
  expectedQuantity: number;
  actualQuantity: number;
  difference: number;
}

export interface StockAudit {
  id: string;
  auditNumber: string;
  locationId: string;
  locationName: string;
  auditorName: string;
  items: StockAuditItem[];
  notes?: string;
  createdAt: string;
}

export interface BusinessSettings {
  id?: string;
  businessName: string;
  ownerName: string;
  currencySymbol: string;
  currencyCode?: string;
  language?: string;
  theme?: 'dark' | 'light';
  taxRate: number; // e.g. 8.5 for 8.5%
  primaryLocationId: string;
  address: string;
  phone: string;
  email: string;
  demoMode: boolean;
}
