export type StockStatus = 'Healthy' | 'Low Stock' | 'Out of Stock' | 'Dead Stock' | 'Quarantined';

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size XL / Charcoal"
  sku: string;
  barcode: string;
  costPrice: number;
  retailPrice: number;
  stockQuantity: number;
  attributes: Record<string, string>; // e.g. { size: 'XL', color: 'Charcoal', material: 'Cotton' }
}

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
  locationReorderPoints?: Record<string, number>; // locationId -> reorder point
  variants?: ProductVariant[];
  customFields?: Record<string, string>; // Dynamic custom attributes (e.g. Material, Warranty, Weight)
  lotNumber?: string;
  batchNumber?: string;
  serialNumber?: string;
  expirationDate?: string;
  documents?: string[]; // Attached specs / certificates
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

export type MovementType = 'Sale' | 'Purchase' | 'Return' | 'Transfer' | 'Adjustment' | 'Damage' | 'Fulfillment';

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
  referenceId?: string; // saleNumber, poNumber, orderNumber, etc.
  lotNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  variantId?: string;
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
  channel?: string; // 'In-Store POS' | 'Shopify' | 'Amazon' | 'eBay'
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

export type SalesChannelType = 'In-Store POS' | 'Online' | 'Shopify' | 'Amazon' | 'eBay' | 'WooCommerce';

export interface SalesChannel {
  id: string;
  name: SalesChannelType;
  category?: 'In-Store POS' | 'Online';
  platform?: 'Shopify' | 'Amazon' | 'eBay' | 'WooCommerce' | 'In-Store POS';
  icon: string;
  status: 'Tracked' | 'Active' | 'Paused';
  lastSyncedAt: string;
  activeListingsCount: number;
  pendingOrdersCount: number;
  autoSyncInventory: boolean;
}

export type FulfillmentStatus = 'Pending' | 'Picking' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface FulfillmentItem {
  productId: string;
  variantId?: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface FulfillmentOrder {
  id: string;
  orderNumber: string;
  channel: SalesChannelType;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: FulfillmentItem[];
  totalAmount: number;
  status: FulfillmentStatus;
  carrier?: 'FedEx' | 'UPS' | 'DHL' | 'USPS' | 'Local Courier';
  trackingNumber?: string;
  assignedLocationId: string;
  assignedLocationName: string;
  createdAt: string;
  shippedAt?: string;
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
