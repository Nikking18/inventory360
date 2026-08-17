'use client';

import React, { useState } from 'react';
import {
  FulfillmentOrder,
  SalesChannel,
  FulfillmentStatus,
  SalesChannelType,
  Product,
  Location,
} from '../../lib/types';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { Modal } from '../common/Modal';
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
}

export const FulfillmentView: React.FC<FulfillmentViewProps> = ({
  channels,
  orders,
  products,
  locations,
  onSyncAllChannels,
  onUpdateOrderStatus,
  currencySymbol,
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(false);

  // Selected Order for Modal / Tracking Update
  const [selectedOrder, setSelectedOrder] = useState<FulfillmentOrder | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<'FedEx' | 'UPS' | 'DHL' | 'USPS' | 'Local Courier'>('FedEx');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [isPackingSlipOpen, setIsPackingSlipOpen] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await onSyncAllChannels();
    setIsSyncing(false);
    setSyncSuccessMsg(true);
    setTimeout(() => setSyncSuccessMsg(false), 3000);
  };

  const getChannelIcon = (name: SalesChannelType) => {
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

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatusTab === 'all' || o.status.toLowerCase() === selectedStatusTab.toLowerCase();
    const matchesChannel = selectedChannelFilter === 'all' || o.channel === selectedChannelFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesChannel && matchesSearch;
  });

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const inProgressCount = orders.filter((o) => o.status === 'Picking' || o.status === 'Packed').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped').length;

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

  return (
    <div className="space-y-6 text-slate-900 font-mono">
      {/* 1. Header & Channel Sync Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-wider font-heading">
            Omnichannel Sales &amp; Order Fulfillment
          </h1>
          <p className="text-xs text-slate-600">
            Real-time multi-channel inventory sync, order dispatch, tracking numbers, and pick &amp; pack queues.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-4 py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync All Channels'}</span>
        </button>
      </div>

      {syncSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>All 4 connected channels (Shopify, Amazon, eBay, In-Store POS) synced successfully.</span>
        </div>
      )}

      {/* 2. Connected Channel Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {channels.map((channel) => (
          <div key={channel.id} className="p-3.5 bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getChannelIcon(channel.name)}
                <span className="font-bold text-xs text-slate-900 uppercase">{channel.name}</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 border border-emerald-300 text-emerald-800 bg-emerald-50 uppercase">
                {channel.status}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span>{channel.activeListingsCount} SKUs Linked</span>
              <span>{channel.lastSyncedAt ? formatDateTime(channel.lastSyncedAt).split(' ')[1] : 'Live'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Operational Summary Metric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        <div className="p-3.5 bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Pending Dispatch</span>
            <p className="text-xl font-bold text-amber-950 mt-0.5">{pendingCount} Orders</p>
          </div>
          <Clock className="w-5 h-5 text-amber-700" />
        </div>

        <div className="p-3.5 bg-sky-50 border border-sky-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-widest">In Picking / Packed</span>
            <p className="text-xl font-bold text-sky-950 mt-0.5">{inProgressCount} Orders</p>
          </div>
          <Package className="w-5 h-5 text-sky-700" />
        </div>

        <div className="p-3.5 bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Dispatched &amp; Tracking</span>
            <p className="text-xl font-bold text-emerald-950 mt-0.5">{shippedCount} Orders</p>
          </div>
          <Truck className="w-5 h-5 text-emerald-700" />
        </div>
      </div>

      {/* 4. Orders Registry & Fulfillment Workspace */}
      <div className="bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
        {/* Workspace Toolbar: Tabs + Search + Filter */}
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
              <option value="all">All Sales Channels</option>
              <option value="Shopify">Shopify</option>
              <option value="Amazon">Amazon</option>
              <option value="eBay">eBay</option>
              <option value="In-Store POS">In-Store POS</option>
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
                <th className="p-2.5">Customer &amp; Address</th>
                <th className="p-2.5">Items</th>
                <th className="p-2.5 text-right">Total</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5">Carrier / Tracking</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                    No orders matching active filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
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
                      <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{order.shippingAddress}</p>
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

      {/* 5. Dispatch Order & Carrier Tracking Modal */}
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
              Confirming dispatch will automatically deduct allocated stock from your inventory ledger.
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

      {/* 6. Packing Slip View Modal */}
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
    </div>
  );
};
