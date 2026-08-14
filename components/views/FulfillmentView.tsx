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
  Filter,
  ExternalLink,
  ChevronRight,
  Printer,
  Check,
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
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'Amazon':
        return <Globe className="w-4 h-4 text-amber-400" />;
      case 'eBay':
        return <Tag className="w-4 h-4 text-sky-400" />;
      case 'WooCommerce':
        return <ShoppingCart className="w-4 h-4 text-purple-400" />;
      case 'In-Store POS':
      default:
        return <Store className="w-4 h-4 text-white" />;
    }
  };

  const getStatusBadge = (status: FulfillmentStatus) => {
    switch (status) {
      case 'Pending':
        return 'border-amber-900/80 text-amber-400 bg-amber-950/60';
      case 'Picking':
        return 'border-sky-900/80 text-sky-400 bg-sky-950/60';
      case 'Packed':
        return 'border-indigo-900/80 text-indigo-400 bg-indigo-950/60';
      case 'Shipped':
        return 'border-emerald-900/80 text-emerald-400 bg-emerald-950/60';
      case 'Delivered':
        return 'border-neutral-700 text-neutral-300 bg-neutral-900';
      case 'Cancelled':
        return 'border-rose-900/80 text-rose-400 bg-rose-950/60';
      default:
        return 'border-neutral-800 text-neutral-400 bg-neutral-950';
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      selectedStatusTab === 'all' || o.status.toLowerCase() === selectedStatusTab.toLowerCase();
    const matchesChannel =
      selectedChannelFilter === 'all' || o.channel.toLowerCase() === selectedChannelFilter.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()) || i.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesChannel && matchesSearch;
  });

  const handleAdvanceStatus = async (order: FulfillmentOrder) => {
    if (order.status === 'Pending') {
      await onUpdateOrderStatus(order.id, 'Picking');
    } else if (order.status === 'Picking') {
      await onUpdateOrderStatus(order.id, 'Packed');
    } else if (order.status === 'Packed') {
      setSelectedOrder(order);
      setTrackingNumberInput(order.trackingNumber || `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`);
    } else if (order.status === 'Shipped') {
      await onUpdateOrderStatus(order.id, 'Delivered');
    }
  };

  const handleConfirmShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    await onUpdateOrderStatus(selectedOrder.id, 'Shipped', selectedCarrier, trackingNumberInput);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-8 font-mono text-neutral-200">
      {/* Top Channels Status Strip */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Multi-Channel Sales Sync &amp; Order Fulfillment</span>
            </h2>
            <p className="text-xs text-neutral-400">
              Synchronize live stock levels and manage order fulfillment across all e-commerce channels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {syncSuccessMsg && (
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> All Channels Synced!
              </span>
            )}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Channels...' : 'Sync Stock Quantities'}</span>
            </button>
          </div>
        </div>

        {/* Connected Channels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {channels.map((chan) => (
            <div key={chan.id} className="p-3.5 bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  {getChannelIcon(chan.name)}
                  <span>{chan.name}</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.2 uppercase">
                  {chan.status}
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 space-y-0.5 pt-1 border-t border-neutral-800/80">
                <p>Listings: <span className="text-white font-bold">{chan.activeListingsCount}</span></p>
                <p>Pending Orders: <span className="text-white font-bold">{chan.pendingOrdersCount}</span></p>
                <p className="text-[9px] text-neutral-500">Synced: {formatDateTime(chan.lastSyncedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fulfillment Pipeline Hub */}
      <div className="space-y-4">
        {/* Filters & Status Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1 bg-neutral-950 p-1 border border-neutral-800">
            {['all', 'pending', 'picking', 'packed', 'shipped', 'delivered'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedStatusTab(tab)}
                className={`px-3 py-1.5 text-xs uppercase font-bold transition-colors ${
                  selectedStatusTab === tab
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab} (
                {tab === 'all'
                  ? orders.length
                  : orders.filter((o) => o.status.toLowerCase() === tab).length}
                )
              </button>
            ))}
          </div>

          {/* Search & Channel Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, SKU..."
                className="w-full text-xs bg-neutral-950 border border-neutral-800 text-white pl-8 pr-3 py-1.5 focus:outline-none focus:border-white"
              />
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2" />
            </div>

            <select
              value={selectedChannelFilter}
              onChange={(e) => setSelectedChannelFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-white text-xs p-1.5 focus:outline-none focus:border-white"
            >
              <option value="all">All Channels</option>
              <option value="shopify">Shopify</option>
              <option value="amazon">Amazon</option>
              <option value="ebay">eBay</option>
              <option value="woocommerce">WooCommerce</option>
              <option value="in-store pos">In-Store POS</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="border border-neutral-800 bg-neutral-900 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase tracking-wider">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Customer &amp; Destination</th>
                <th className="p-3">Line Items</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Fulfillment Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500 italic">
                    No fulfillment orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      {order.orderNumber}
                      <p className="text-[10px] text-neutral-500 font-normal">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-bold text-neutral-300">
                        {getChannelIcon(order.channel)}
                        <span>{order.channel}</span>
                      </span>
                    </td>

                    <td className="p-3 max-w-xs">
                      <p className="font-bold text-white">{order.customerName}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{order.shippingAddress}</p>
                    </td>

                    <td className="p-3 max-w-xs">
                      <div className="space-y-0.5">
                        {order.items.map((it, idx) => (
                          <p key={idx} className="text-[11px] text-neutral-300">
                            • {it.productName} <span className="text-neutral-500 font-bold">x{it.quantity}</span>
                          </p>
                        ))}
                      </div>
                    </td>

                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      {formatCurrency(order.totalAmount, currencySymbol)}
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 border uppercase ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        {order.trackingNumber && (
                          <p className="text-[9px] text-neutral-400 font-mono">
                            {order.carrier}: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleAdvanceStatus(order)}
                            className="px-2.5 py-1 bg-white text-black font-bold uppercase text-[10px] hover:bg-neutral-200 transition-colors flex items-center gap-1"
                          >
                            <span>
                              {order.status === 'Pending' && 'Start Picking'}
                              {order.status === 'Picking' && 'Mark Packed'}
                              {order.status === 'Packed' && 'Dispatch & Ship'}
                              {order.status === 'Shipped' && 'Mark Delivered'}
                            </span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsPackingSlipOpen(true);
                          }}
                          title="Print Packing Slip"
                          className="p-1 text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800"
                        >
                          <Printer className="w-3.5 h-3.5" />
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

      {/* Modal: Dispatch / Assign Tracking */}
      {selectedOrder && !isPackingSlipOpen && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`DISPATCH SHIPMENT // ${selectedOrder.orderNumber}`}
        >
          <form onSubmit={handleConfirmShipment} className="space-y-4 text-xs font-mono text-neutral-200">
            <p className="text-neutral-400 leading-relaxed">
              Assign shipping carrier and tracking barcode to fulfill this order from{' '}
              <strong className="text-white">{selectedOrder.assignedLocationName}</strong>.
            </p>

            <div className="space-y-3 p-4 bg-neutral-950 border border-neutral-800">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                  Select Shipping Carrier
                </label>
                <select
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs p-2 focus:outline-none focus:border-white"
                >
                  <option value="FedEx">FedEx Express / Ground</option>
                  <option value="UPS">UPS Logistics</option>
                  <option value="DHL">DHL Worldwide Express</option>
                  <option value="USPS">USPS Priority Mail</option>
                  <option value="Local Courier">Local Store Courier</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                  Tracking Number / Barcode ID
                </label>
                <input
                  type="text"
                  required
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. 1Z9999999999999999 or 772910482910"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs p-2 focus:outline-none focus:border-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-neutral-900 text-neutral-300 uppercase font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-white text-black uppercase font-bold text-xs hover:bg-neutral-200 flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Confirm &amp; Notify {selectedOrder.channel}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Printable Packing Slip */}
      {selectedOrder && isPackingSlipOpen && (
        <Modal
          isOpen={isPackingSlipOpen}
          onClose={() => {
            setIsPackingSlipOpen(false);
            setSelectedOrder(null);
          }}
          title="OFFICIAL PACKING SLIP"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-neutral-200 font-mono text-xs p-4 bg-white text-black rounded-sm shadow-md">
            {/* Slip Header */}
            <div className="flex justify-between items-start border-b border-neutral-300 pb-4">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wider text-black">INVENTORY 360 PACKING SLIP</h3>
                <p className="text-[10px] text-neutral-600">Origin: {selectedOrder.assignedLocationName}</p>
                <p className="text-[10px] text-neutral-600">Channel: {selectedOrder.channel}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold font-mono">{selectedOrder.orderNumber}</p>
                <p className="text-[10px] text-neutral-600">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>
            </div>

            {/* Destination */}
            <div className="p-3 bg-neutral-100 border border-neutral-200 text-neutral-800 space-y-1">
              <p className="text-[10px] uppercase font-bold text-neutral-500">SHIP TO:</p>
              <p className="font-bold text-black">{selectedOrder.customerName}</p>
              <p className="text-xs">{selectedOrder.shippingAddress}</p>
              <p className="text-[10px] text-neutral-600">Email: {selectedOrder.customerEmail}</p>
            </div>

            {/* Itemized Table */}
            <table className="w-full text-left text-xs border border-neutral-300">
              <thead className="bg-neutral-100 border-b border-neutral-300 text-[10px] uppercase font-bold text-neutral-700">
                <tr>
                  <th className="p-2">Item &amp; Description</th>
                  <th className="p-2">SKU</th>
                  <th className="p-2 text-center">Qty Picked</th>
                  <th className="p-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {selectedOrder.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-bold">{it.productName}</td>
                    <td className="p-2 font-mono text-[11px]">{it.sku}</td>
                    <td className="p-2 text-center font-bold">{it.quantity}</td>
                    <td className="p-2 text-right font-mono">{formatCurrency(it.unitPrice, currencySymbol)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center border-t border-neutral-300 pt-3">
              <span className="text-[10px] text-neutral-600">Carrier: {selectedOrder.carrier || 'Pending Assignment'}</span>
              <p className="text-sm font-bold">Total: {formatCurrency(selectedOrder.totalAmount, currencySymbol)}</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 no-print">
              <button
                onClick={() => {
                  setIsPackingSlipOpen(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 bg-neutral-200 text-black uppercase font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 bg-black text-white uppercase font-bold text-xs hover:bg-neutral-800 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Packing Slip</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
