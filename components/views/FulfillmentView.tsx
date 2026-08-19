'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';
import {
  FulfillmentOrder,
  SalesChannel,
  FulfillmentStatus,
  SalesChannelType,
  Product,
  Location,
  BusinessSettings,
} from '../../lib/types';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { downloadPickListPDF } from '../../lib/exportImport';
import {
  Globe,
  ShoppingBag,
  Store,
  Tag,
  ShoppingCart,
  RefreshCw,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Search,
  Check,
  Printer,
  Plus,
  Layers,
  ArrowRight,
  User,
  MapPin,
  ClipboardList,
  Copy,
  ExternalLink,
  AlertCircle,
  FileCheck,
  Send,
  Boxes,
  Download,
} from 'lucide-react';

interface FulfillmentViewProps {
  channels: SalesChannel[];
  orders: FulfillmentOrder[];
  products: Product[];
  locations: Location[];
  onSyncAllChannels: () => Promise<void>;
  onUpdateOrderStatus: (
    orderId: string,
    status: FulfillmentStatus,
    carrier?: 'FedEx' | 'UPS' | 'DHL' | 'USPS' | 'Local Courier',
    trackingNumber?: string
  ) => Promise<void>;
  currencySymbol: string;
  settings?: BusinessSettings;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
}

export const FulfillmentView: React.FC<FulfillmentViewProps> = ({
  channels,
  orders,
  products,
  locations,
  onSyncAllChannels,
  onUpdateOrderStatus,
  currencySymbol,
  settings,
  activeSubTab = 'channels',
  onSubTabChange,
}) => {
  const { t } = useTranslation();

  // Filters & State
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('all');
  const [selectedCarrierFilter, setSelectedCarrierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(false);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  // Selected Order for Dispatch / Packing Slip Modal
  const [selectedOrder, setSelectedOrder] = useState<FulfillmentOrder | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<'FedEx' | 'UPS' | 'DHL' | 'USPS' | 'Local Courier'>('FedEx');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [isPackingSlipOpen, setIsPackingSlipOpen] = useState(false);
  const [isBatchPickListOpen, setIsBatchPickListOpen] = useState(false);

  // Manual Log Order Modal State
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [newOrderChannel, setNewOrderChannel] = useState<'Shopify' | 'Amazon' | 'eBay' | 'WooCommerce' | 'In-Store POS'>('Shopify');
  const [newOrderCustomer, setNewOrderCustomer] = useState('');
  const [newOrderEmail, setNewOrderEmail] = useState('');
  const [newOrderAddress, setNewOrderAddress] = useState('');
  const [newOrderProductId, setNewOrderProductId] = useState(products[0]?.id || '');
  const [newOrderQuantity, setNewOrderQuantity] = useState<number>(1);
  const [newOrderLocationId, setNewOrderLocationId] = useState(locations[0]?.id || '');

  const handleSync = async () => {
    setIsSyncing(true);
    await onSyncAllChannels();
    setIsSyncing(false);
    setSyncSuccessMsg(true);
    setTimeout(() => setSyncSuccessMsg(false), 3000);
  };

  const getChannelIcon = (name: SalesChannelType | string) => {
    switch (name) {
      case 'Shopify':
        return <ShoppingBag className="w-4 h-4 text-emerald-700" />;
      case 'Amazon':
        return <Globe className="w-4 h-4 text-amber-700" />;
      case 'eBay':
        return <Tag className="w-4 h-4 text-sky-700" />;
      case 'WooCommerce':
        return <ShoppingCart className="w-4 h-4 text-purple-700" />;
      case 'In-Store POS':
      default:
        return <Store className="w-4 h-4 text-slate-900" />;
    }
  };

  const getStatusBadge = (status: FulfillmentStatus) => {
    switch (status) {
      case 'Pending':
        return 'border-amber-300 text-amber-800 bg-amber-50';
      case 'Picking':
        return 'border-sky-300 text-sky-800 bg-sky-50';
      case 'Packed':
        return 'border-indigo-300 text-indigo-800 bg-indigo-50';
      case 'Shipped':
        return 'border-emerald-300 text-emerald-800 bg-emerald-50';
      case 'Delivered':
        return 'border-slate-300 text-slate-800 bg-slate-100';
      case 'Cancelled':
        return 'border-rose-300 text-rose-800 bg-rose-50';
      default:
        return 'border-slate-300 text-slate-700 bg-slate-50';
    }
  };

  // Metrics
  const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Picking' || o.status === 'Packed');
  const shippedOrders = orders.filter((o) => o.status === 'Shipped' || o.status === 'Delivered');
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const inProgressCount = orders.filter((o) => o.status === 'Picking' || o.status === 'Packed').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  // Filter for ALL ORDERS page
  const filteredAllOrders = orders.filter((o) => {
    const matchesStatus = selectedStatusTab === 'all' || o.status.toLowerCase() === selectedStatusTab.toLowerCase();
    let matchesChannel = true;
    if (selectedChannelFilter === 'in-store') {
      matchesChannel = o.channel === 'In-Store POS';
    } else if (selectedChannelFilter === 'online-all') {
      matchesChannel = ['Shopify', 'Amazon', 'eBay', 'WooCommerce'].includes(o.channel);
    } else if (selectedChannelFilter !== 'all') {
      matchesChannel = o.channel === selectedChannelFilter;
    }
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesChannel && matchesSearch;
  });

  // Filter for PENDING DISPATCH page
  const filteredPendingOrders = pendingOrders.filter((o) => {
    let matchesChannel = true;
    if (selectedChannelFilter === 'in-store') {
      matchesChannel = o.channel === 'In-Store POS';
    } else if (selectedChannelFilter === 'online-all') {
      matchesChannel = ['Shopify', 'Amazon', 'eBay', 'WooCommerce'].includes(o.channel);
    } else if (selectedChannelFilter !== 'all') {
      matchesChannel = o.channel === selectedChannelFilter;
    }
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  // Filter for SHIPPED & TRACKING page
  const filteredShippedOrders = shippedOrders.filter((o) => {
    const matchesCarrier = selectedCarrierFilter === 'all' || o.carrier === selectedCarrierFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCarrier && matchesSearch;
  });

  const handleOpenDispatchModal = (order: FulfillmentOrder) => {
    setSelectedOrder(order);
    setSelectedCarrier(order.carrier || 'FedEx');
    setTrackingNumberInput(order.trackingNumber || `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`);
  };

  const handleConfirmDispatch = async () => {
    if (!selectedOrder) return;
    await onUpdateOrderStatus(selectedOrder.id, 'Shipped', selectedCarrier, trackingNumberInput);
    setSelectedOrder(null);
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === newOrderProductId) || products[0];
    const loc = locations.find((l) => l.id === newOrderLocationId) || locations[0];
    if (!prod) return;

    const unitPrice = prod.retailPrice;
    const totalAmount = unitPrice * newOrderQuantity;

    const prefix =
      newOrderChannel === 'Shopify'
        ? 'SH'
        : newOrderChannel === 'Amazon'
        ? 'AMZ'
        : newOrderChannel === 'eBay'
        ? 'EB'
        : newOrderChannel === 'WooCommerce'
        ? 'WC'
        : 'POS';
    const orderNumber = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: FulfillmentOrder = {
      id: `ful_${Date.now()}`,
      orderNumber,
      channel: newOrderChannel,
      customerName: newOrderCustomer || 'Online Customer',
      customerEmail: newOrderEmail || 'customer@example.com',
      shippingAddress: newOrderAddress || 'Standard Delivery Address',
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: newOrderQuantity,
          unitPrice: unitPrice,
        },
      ],
      totalAmount,
      status: 'Pending',
      assignedLocationId: loc?.id || 'loc_1',
      assignedLocationName: loc?.name || 'Primary Store',
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    setIsNewOrderModalOpen(false);
    setNewOrderCustomer('');
    setNewOrderEmail('');
    setNewOrderAddress('');
  };

  const handleCopyTracking = (tracking: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(tracking);
      setCopiedTrackingId(tracking);
      setTimeout(() => setCopiedTrackingId(null), 2000);
    }
  };

  // Aggregated items needed across all pending orders for Batch Pick List
  const aggregatedPickItems = React.useMemo(() => {
    const map = new Map<string, { sku: string; name: string; quantity: number }>();
    pendingOrders.forEach((o) => {
      o.items.forEach((item) => {
        const existing = map.get(item.sku);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          map.set(item.sku, { sku: item.sku, name: item.productName, quantity: item.quantity });
        }
      });
    });
    return Array.from(map.values());
  }, [pendingOrders]);

  return (
    <div className="space-y-6 text-slate-900 font-mono">
      {/* 1. TOP SUB-NAVIGATION BAR (3 DISTINCT PAGES) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            {
              id: 'all-orders',
              label: t('all-orders', 'All Fulfillment Orders'),
              icon: Layers,
              count: orders.length,
            },
            {
              id: 'pending-dispatch',
              label: t('pending-dispatch', 'Pending Dispatch'),
              icon: Clock,
              count: pendingOrders.length,
              badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
            },
            {
              id: 'shipped-orders',
              label: t('shipped-orders', 'Shipped & Tracking'),
              icon: Truck,
              count: shippedOrders.length,
              badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSubTabChange && onSubTabChange(tab.id)}
                className={`px-3.5 py-2 text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-bold border ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border-slate-700'
                      : tab.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Order</span>
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3.5 py-1.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Updating...' : 'Update Feeds'}</span>
          </button>
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>Tracked feeds refreshed for In-Store POS and Online platforms (Shopify, Amazon, eBay, WooCommerce).</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 1: ALL FULFILLMENT ORDERS                                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'all-orders' && (
        <div className="space-y-6">
          {/* Tracked Channels: IN-STORE POS & ONLINE (Shopify, Amazon, eBay, WooCommerce) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Card 1: In-Store POS Channel Tracker */}
            <div className="lg:col-span-4 p-4 bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-slate-900" />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 uppercase">In-Store POS</h3>
                    <p className="text-[10px] text-slate-500">Counter Register &amp; Walk-in</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 border border-slate-300 text-slate-800 bg-slate-50 uppercase">
                  Tracked
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 bg-slate-50 border border-slate-100">
                  <span className="text-[9px] text-slate-500 uppercase">POS Sales</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {orders.filter((o) => o.channel === 'In-Store POS').length} Logged
                  </p>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-100">
                  <span className="text-[9px] text-slate-500 uppercase">Inventory Sync</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">Real-Time</p>
                </div>
              </div>
            </div>

            {/* Card 2: Online Channels (Shopify, Amazon, eBay, WooCommerce) */}
            <div className="lg:col-span-8 p-4 bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-700" />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 uppercase">Online Marketplaces &amp; E-Commerce</h3>
                    <p className="text-[10px] text-slate-500">Tracked Multi-Platform Order Streams</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 border border-emerald-300 text-emerald-800 bg-emerald-50 uppercase">
                  Tracked (4 Platforms)
                </span>
              </div>

              {/* 4 Tracked Online Platforms */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {[
                  { id: 'Shopify', name: 'Shopify', icon: ShoppingBag, color: 'text-emerald-700', ordersCount: orders.filter((o) => o.channel === 'Shopify').length },
                  { id: 'Amazon', name: 'Amazon', icon: Globe, color: 'text-amber-700', ordersCount: orders.filter((o) => o.channel === 'Amazon').length },
                  { id: 'eBay', name: 'eBay', icon: Tag, color: 'text-sky-700', ordersCount: orders.filter((o) => o.channel === 'eBay').length },
                  { id: 'WooCommerce', name: 'WooCommerce', icon: ShoppingCart, color: 'text-purple-700', ordersCount: orders.filter((o) => o.channel === 'WooCommerce').length },
                ].map((plat) => {
                  const Icon = plat.icon;
                  return (
                    <div key={plat.id} className="p-2.5 bg-slate-50 border border-slate-200 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <Icon className={`w-3.5 h-3.5 ${plat.color}`} />
                        <span className="text-[8px] font-bold uppercase text-slate-600 bg-white border border-slate-200 px-1 py-0.2">
                          Tracked
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="font-bold text-xs text-slate-900">{plat.name}</p>
                        <p className="text-[10px] text-slate-500">{plat.ordersCount} Orders</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Orders Workspace */}
          <div className="bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
            {/* Workspace Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                {(['all', 'pending', 'picking', 'packed', 'shipped', 'delivered'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedStatusTab(tab)}
                    className={`px-3 py-1.5 uppercase font-bold tracking-wider transition-colors ${
                      selectedStatusTab === tab
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search and Channel Dropdown */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search Order #, Customer, Tracking..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 text-slate-900 pl-8 pr-3 py-1.5 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>

                <select
                  value={selectedChannelFilter}
                  onChange={(e) => setSelectedChannelFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-300 px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
                >
                  <option value="all">All Channels</option>
                  <option value="in-store">In-Store POS</option>
                  <option value="online-all">Online (All Platforms)</option>
                  <option value="Shopify">↳ Shopify</option>
                  <option value="Amazon">↳ Amazon</option>
                  <option value="eBay">↳ eBay</option>
                  <option value="WooCommerce">↳ WooCommerce</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                    <th className="p-2.5">Order #</th>
                    <th className="p-2.5">Channel</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Customer &amp; Destination</th>
                    <th className="p-2.5">Items</th>
                    <th className="p-2.5 text-right">Total</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5">Carrier / Tracking</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAllOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                        No orders matching active filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAllOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-bold text-slate-900">{order.orderNumber}</td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            {getChannelIcon(order.channel)}
                            <span>{order.channel}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-600">{formatDateTime(order.createdAt).split(' ')[0]}</td>
                        <td className="p-2.5">
                          <p className="font-bold text-slate-900">{order.customerName}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[160px]">{order.shippingAddress}</p>
                        </td>
                        <td className="p-2.5 text-slate-800">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="text-[11px]">
                              {it.quantity}x {it.productName}
                            </div>
                          ))}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {formatCurrency(order.totalAmount, currencySymbol)}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-xs text-slate-700">
                          {order.carrier ? (
                            <div>
                              <p className="font-bold text-slate-900">{order.carrier}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{order.trackingNumber}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          {order.status !== 'Shipped' && order.status !== 'Delivered' && order.status !== 'Cancelled' ? (
                            <button
                              onClick={() => handleOpenDispatchModal(order)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase transition-colors"
                            >
                              Dispatch
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsPackingSlipOpen(true);
                              }}
                              className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 text-[10px] font-bold uppercase"
                            >
                              Slip
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 2: PENDING DISPATCH & WAREHOUSE PICK & PACK QUEUE                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'pending-dispatch' && (
        <div className="space-y-6">
          {/* Operational Workflow Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-amber-50 border border-amber-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-amber-800">1. Awaiting Pick List</span>
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <p className="text-2xl font-bold text-amber-950">{pendingCount} Orders</p>
              <p className="text-[10px] text-amber-700">Orders ready for warehouse item retrieval</p>
            </div>

            <div className="p-4 bg-sky-50 border border-sky-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-sky-800">2. Picking &amp; Packing</span>
                <Package className="w-4 h-4 text-sky-700" />
              </div>
              <p className="text-2xl font-bold text-sky-950">{inProgressCount} Orders</p>
              <p className="text-[10px] text-sky-700">Items collected, awaiting carrier boxing</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-700">Warehouse Action</span>
                <ClipboardList className="w-4 h-4 text-slate-800" />
              </div>
              <button
                onClick={() => setIsBatchPickListOpen(true)}
                className="w-full mt-1 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Generate Pick List ({aggregatedPickItems.length} SKUs)</span>
              </button>
            </div>
          </div>

          {/* Pending Dispatch Queue Cards */}
          <div className="bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase">
                  Active Dispatch Queue ({filteredPendingOrders.length} Orders)
                </h3>
                <p className="text-xs text-slate-500">
                  Step-by-step warehouse fulfillment: Advance from Pending ➔ Picking ➔ Packed ➔ Carrier Shipped
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter queue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs bg-white border border-slate-300 px-3 py-1.5 text-slate-900 font-mono shadow-2xs"
                />
              </div>
            </div>

            {filteredPendingOrders.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm text-slate-900 uppercase">Fulfillment Queue is Clear!</p>
                <p className="text-xs text-slate-500">All incoming online and POS orders have been dispatched and shipped.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border border-slate-200 bg-white hover:border-slate-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                  >
                    {/* Order Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{order.orderNumber}</span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 border border-slate-200">
                          {getChannelIcon(order.channel)}
                          <span>{order.channel}</span>
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 border uppercase ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700">
                        <strong>Customer:</strong> {order.customerName} • <strong>Destination:</strong> {order.shippingAddress}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600">
                        {order.items.map((it, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-200 px-2 py-0.5 font-mono">
                            <strong>{it.quantity}x</strong> {it.productName} ({it.sku})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Step-by-Step Dispatch Workflow Stepper */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'Picking')}
                          className="px-3 py-1.5 bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200 text-xs font-bold uppercase transition-colors flex items-center gap-1"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                          <span>Start Picking</span>
                        </button>
                      )}

                      {order.status === 'Picking' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'Packed')}
                          className="px-3 py-1.5 bg-sky-100 border border-sky-300 text-sky-900 hover:bg-sky-200 text-xs font-bold uppercase transition-colors flex items-center gap-1"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Mark Packed</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenDispatchModal(order)}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ship &amp; Tracking</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsPackingSlipOpen(true);
                        }}
                        className="p-1.5 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 transition-colors"
                        title="Print Packing Slip"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 3: SHIPPED ORDERS & LIVE TRACKING MANIFEST                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'shipped-orders' && (
        <div className="space-y-6">
          {/* Logistics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-800">Total Dispatched</span>
              <p className="text-xl font-bold text-emerald-950">{shippedOrders.length} Shipments</p>
            </div>

            <div className="p-3.5 bg-sky-50 border border-sky-300 space-y-1">
              <span className="text-[10px] font-bold uppercase text-sky-800">In Transit</span>
              <p className="text-xl font-bold text-sky-950">{shippedCount} Packages</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-300 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-700">Delivered</span>
              <p className="text-xl font-bold text-slate-950">{deliveredCount} Completed</p>
            </div>

            <div className="p-3.5 bg-indigo-50 border border-indigo-300 space-y-1">
              <span className="text-[10px] font-bold uppercase text-indigo-800">Dispatched Value</span>
              <p className="text-xl font-bold text-indigo-950">
                {formatCurrency(
                  shippedOrders.reduce((acc, o) => acc + o.totalAmount, 0),
                  currencySymbol
                )}
              </p>
            </div>
          </div>

          {/* Shipped Orders & Tracking Manifest Table */}
          <div className="bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase">
                  Carrier Logistics Manifest &amp; Waybill Tracking
                </h3>
                <p className="text-xs text-slate-500">Real-time dispatch audit trail with carrier waybill numbers.</p>
              </div>

              {/* Carrier Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCarrierFilter}
                  onChange={(e) => setSelectedCarrierFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-300 px-2.5 py-1.5 text-slate-900 font-mono shadow-2xs"
                >
                  <option value="all">All Carriers (FedEx, UPS, DHL, USPS, Local)</option>
                  <option value="FedEx">FedEx Express</option>
                  <option value="UPS">UPS Ground</option>
                  <option value="DHL">DHL International</option>
                  <option value="USPS">USPS Priority</option>
                  <option value="Local Courier">Local Delivery Courier</option>
                </select>

                <div className="relative min-w-[180px]">
                  <input
                    type="text"
                    placeholder="Search tracking #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 text-slate-900 pl-8 pr-3 py-1.5 font-mono shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>
              </div>
            </div>

            {/* Shipped Manifest Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                    <th className="p-2.5">Order #</th>
                    <th className="p-2.5">Channel</th>
                    <th className="p-2.5">Customer &amp; Address</th>
                    <th className="p-2.5">Carrier</th>
                    <th className="p-2.5">Tracking Number</th>
                    <th className="p-2.5 text-right">Value</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredShippedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                        No shipped orders matching active filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredShippedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-bold text-slate-900">{order.orderNumber}</td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            {getChannelIcon(order.channel)}
                            <span>{order.channel}</span>
                          </div>
                        </td>
                        <td className="p-2.5">
                          <p className="font-bold text-slate-900">{order.customerName}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[160px]">{order.shippingAddress}</p>
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">{order.carrier || 'Standard'}</td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 border border-slate-200 text-[11px]">
                              {order.trackingNumber || 'N/A'}
                            </span>
                            {order.trackingNumber && (
                              <button
                                onClick={() => handleCopyTracking(order.trackingNumber!)}
                                className="p-1 text-slate-400 hover:text-slate-900"
                                title="Copy tracking ID"
                              >
                                {copiedTrackingId === order.trackingNumber ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {formatCurrency(order.totalAmount, currencySymbol)}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {order.status === 'Shipped' && (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'Delivered', order.carrier, order.trackingNumber)}
                                className="px-2 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-[10px] font-bold uppercase transition-colors"
                              >
                                Mark Delivered
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsPackingSlipOpen(true);
                              }}
                              className="px-2 py-1 bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 text-[10px] font-bold uppercase transition-colors"
                            >
                              Slip
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DISPATCH ORDER & CARRIER TRACKING MODAL                                */}
      {/* ========================================================================= */}
      {selectedOrder && !isPackingSlipOpen && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`DISPATCH ORDER: ${selectedOrder.orderNumber}`}
        >
          <div className="space-y-4 font-mono text-xs text-slate-900">
            <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Ship To: {selectedOrder.customerName}</p>
              <p className="text-slate-600">{selectedOrder.shippingAddress}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Select Shipping Carrier
              </label>
              <select
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value as any)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="FedEx">FedEx Express</option>
                <option value="UPS">UPS Ground</option>
                <option value="DHL">DHL International</option>
                <option value="USPS">USPS Priority</option>
                <option value="Local Courier">Local Delivery Courier</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Tracking Number / Waybill ID
              </label>
              <input
                type="text"
                value={trackingNumberInput}
                onChange={(e) => setTrackingNumberInput(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
              />
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px]">
              Confirming dispatch will update order status to Shipped and record the carrier tracking ID.
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-bold uppercase hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                className="px-6 py-2 bg-slate-900 text-white font-bold uppercase hover:bg-black flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Confirm &amp; Ship</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 6. PACKING SLIP VIEW MODAL                                                */}
      {/* ========================================================================= */}
      {selectedOrder && isPackingSlipOpen && (
        <Modal
          isOpen={isPackingSlipOpen}
          onClose={() => {
            setIsPackingSlipOpen(false);
            setSelectedOrder(null);
          }}
          title={`PACKING SLIP: ${selectedOrder.orderNumber}`}
        >
          <div className="space-y-4 font-mono text-xs text-slate-900">
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold uppercase text-sm text-slate-900">Official Packing Slip</span>
                <span className="font-bold text-slate-600">{selectedOrder.orderNumber}</span>
              </div>
              <p><strong>Channel:</strong> {selectedOrder.channel}</p>
              <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
              <p><strong>Destination:</strong> {selectedOrder.shippingAddress}</p>
              <p><strong>Carrier:</strong> {selectedOrder.carrier || 'Standard Shipping'} (Tracking: {selectedOrder.trackingNumber || 'N/A'})</p>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-[10px] uppercase text-slate-600">Enclosed Items</p>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="p-2 border border-slate-200 flex justify-between bg-white">
                  <span>{item.quantity}x {item.productName} ({item.sku})</span>
                  <span className="font-bold">{formatCurrency(item.quantity * item.unitPrice, currencySymbol)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-900 text-white font-bold uppercase flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 7. BATCH PICK LIST MODAL                                                  */}
      {/* ========================================================================= */}
      {isBatchPickListOpen && (
        <Modal
          isOpen={isBatchPickListOpen}
          onClose={() => setIsBatchPickListOpen(false)}
          title="WAREHOUSE BATCH PICK LIST"
        >
          <div className="space-y-4 font-mono text-xs text-slate-900">
            <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900 uppercase text-xs">Summary of Items to Retrieve</p>
              <p className="text-[11px] text-slate-600">
                Total {aggregatedPickItems.reduce((a, b) => a + b.quantity, 0)} units across {aggregatedPickItems.length} SKUs for {pendingOrders.length} pending orders.
              </p>
            </div>

            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto border border-slate-200">
              {aggregatedPickItems.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between bg-white hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <input type="checkbox" className="w-4 h-4 border-slate-300" />
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm bg-slate-100 border border-slate-200 px-2.5 py-0.5">
                    Qty: {item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsBatchPickListOpen(false)}
                className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-bold uppercase hover:bg-slate-200 text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadPickListPDF(
                    aggregatedPickItems,
                    pendingOrders.length,
                    settings?.businessName,
                    settings?.logoUrl,
                    settings?.taxNumber
                  );
                }}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-800 font-bold uppercase hover:bg-slate-100 flex items-center gap-1.5 shadow-2xs text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadPickListPDF(
                    aggregatedPickItems,
                    pendingOrders.length,
                    settings?.businessName,
                    settings?.logoUrl,
                    settings?.taxNumber
                  );
                  window.print();
                }}
                className="px-5 py-2 bg-slate-900 text-white font-bold uppercase hover:bg-black flex items-center gap-1.5 shadow-xs text-xs"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Print Pick List</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

        {/* ========================================================================= */}
        {/* PRINT-ONLY WAREHOUSE PICK LIST CONTAINER                                  */}
        {/* ========================================================================= */}
        <div className="hidden print-only print-container font-mono text-black p-8">
          <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
            <div className="flex items-center gap-3">
              {settings?.logoUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={settings.logoUrl} alt="Logo" className="max-h-12 max-w-[140px] object-contain" />
              )}
              <div>
                <h1 className="font-extrabold text-xl uppercase tracking-tight">
                  {settings?.businessName || 'INVENTORY 360'}
                </h1>
                <p className="text-xs text-gray-700">WAREHOUSE BATCH PICK &amp; FULFILLMENT LIST</p>
                {settings?.taxNumber && <p className="text-[10px] text-gray-600">GSTIN / TAX: {settings.taxNumber}</p>}
              </div>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-sm">BATCH PICK LIST</p>
              <p className="text-[10px] text-gray-600">Date: {new Date().toLocaleString()}</p>
              <p className="text-[10px] font-bold">Pending Orders: {pendingOrders.length}</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-300 p-3 mb-4 text-xs">
            <p className="font-bold uppercase">Summary Instructions:</p>
            <p className="text-gray-700">
              Retrieve total {aggregatedPickItems.reduce((a, b) => a + b.quantity, 0)} units across {aggregatedPickItems.length} SKUs.
              Check items off as they are pulled from shelf locations.
            </p>
          </div>

          <table className="w-full text-left text-xs border-collapse border border-black mb-6">
            <thead>
              <tr className="bg-gray-100 border-b border-black font-bold">
                <th className="p-2 border-r border-black w-12 text-center">[ ✓ ]</th>
                <th className="p-2 border-r border-black w-10 text-center">#</th>
                <th className="p-2 border-r border-black">SKU</th>
                <th className="p-2 border-r border-black">Product Name</th>
                <th className="p-2 border-r border-black text-center w-20">Pick Qty</th>
                <th className="p-2 text-center w-28">Picker Initials</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedPickItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-300">
                  <td className="p-2 border-r border-black text-center font-bold text-sm">[  ]</td>
                  <td className="p-2 border-r border-black text-center">{idx + 1}</td>
                  <td className="p-2 border-r border-black font-bold font-mono">{item.sku}</td>
                  <td className="p-2 border-r border-black font-semibold">{item.name}</td>
                  <td className="p-2 border-r border-black text-center font-extrabold text-sm">{item.quantity}</td>
                  <td className="p-2 border-b border-dotted border-gray-400"></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-300 text-xs">
            <div>
              <div className="border-b border-black w-48 mb-1"></div>
              <p className="font-bold">Warehouse Picker Sign &amp; Date</p>
            </div>
            <div className="text-right">
              <div className="border-b border-black w-48 ml-auto mb-1"></div>
              <p className="font-bold">Dispatch Supervisor Verification</p>
            </div>
          </div>
        </div>

      {/* ========================================================================= */}
      {/* 8. LOG NEW ONLINE ORDER MODAL                                             */}
      {/* ========================================================================= */}
      {isNewOrderModalOpen && (
        <Modal
          isOpen={isNewOrderModalOpen}
          onClose={() => setIsNewOrderModalOpen(false)}
          title="LOG ONLINE / IN-STORE ORDER"
        >
          <form onSubmit={handleCreateManualOrder} className="space-y-4 font-mono text-xs text-slate-900">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Order Sales Channel
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['Shopify', 'Amazon', 'eBay', 'WooCommerce', 'In-Store POS'] as const).map((chan) => (
                  <button
                    type="button"
                    key={chan}
                    onClick={() => setNewOrderChannel(chan)}
                    className={`p-2 border text-left flex items-center gap-1.5 transition-all ${
                      newOrderChannel === chan
                        ? 'bg-slate-900 text-white border-slate-900 font-bold'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] uppercase">{chan}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Smith"
                  value={newOrderCustomer}
                  onChange={(e) => setNewOrderCustomer(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={newOrderEmail}
                  onChange={(e) => setNewOrderEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Delivery Address *
              </label>
              <input
                type="text"
                required
                placeholder="Street address, city, state, zip"
                value={newOrderAddress}
                onChange={(e) => setNewOrderAddress(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Assigned Fulfillment Outlet *
                </label>
                <select
                  value={newOrderLocationId}
                  onChange={(e) => setNewOrderLocationId(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Product SKU *
                </label>
                <select
                  value={newOrderProductId}
                  onChange={(e) => setNewOrderProductId(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.retailPrice, currencySymbol)} (Stock: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Order Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newOrderQuantity}
                  onChange={(e) => setNewOrderQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(false)}
                className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-bold uppercase hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white font-bold uppercase hover:bg-black shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Order to Tracker</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
