'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { Customer, Sale } from '../../lib/types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { Plus, Search } from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  sales: Sale[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalRevenue' | 'outstandingBalance' | 'createdAt'>) => Promise<void>;
  currencySymbol: string;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  sales,
  onAddCustomer,
  currencySymbol,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddCustomer({
      name,
      email,
      phone,
      address,
      status: 'Active',
    });
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setIsAddModalOpen(false);
  };

  const filtered = customers.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  const customerSales = selectedCustomer
    ? sales.filter((s) => s.customerId === selectedCustomer.id)
    : [];

  return (
    <div id="tour-customer-crm" className="space-y-6 text-slate-900 font-mono">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-bold text-lg text-slate-900 uppercase tracking-wider font-heading">
            {t('customers', 'Customer Profiles & CRM')}
          </h2>
          <p className="text-xs text-slate-600">
            Registered customer accounts, transaction histories, and sales logs.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-slate-900 text-white hover:bg-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>{t('add_customer', 'New Customer')}</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="relative max-w-sm">
          <input
            type="text"
            placeholder={t('search_placeholder', 'Search by customer name, email, or phone...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 text-slate-900 pl-9 pr-3 py-2 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                <th className="py-2.5 px-3">{t('customer', 'Customer Name')}</th>
                <th className="py-2.5 px-3">{t('contact_info', 'Contact')}</th>
                <th className="py-2.5 px-3 text-right">{t('total_orders', 'Total Orders')}</th>
                <th className="py-2.5 px-3 text-right">{t('lifetime_value', 'Lifetime Spent')}</th>
                <th className="py-2.5 px-3 text-center">{t('status', 'Status')}</th>
                <th className="py-2.5 px-3 text-center">{t('actions', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs font-mono">
                    {search ? `No customer records match "${search}"` : 'No registered customer profiles available.'}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] text-slate-500">{c.address}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <p>{c.email}</p>
                      <p className="text-[10px] text-slate-500">{c.phone}</p>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{c.totalOrders || 0}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">
                      {formatCurrency(c.totalRevenue || 0, currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 border border-emerald-300 text-emerald-800 bg-emerald-50 uppercase">
                        {c.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 text-[10px] uppercase font-bold"
                      >
                        {t('history', 'History')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer History Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`${t('history', 'Sales Log')}: ${selectedCustomer.name}`}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 flex justify-between">
              <div>
                <p className="text-slate-500 text-[10px] uppercase">{t('total_orders', 'Total Orders')}</p>
                <p className="font-bold text-slate-900 text-base">{selectedCustomer.totalOrders}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-[10px] uppercase">{t('lifetime_value', 'Total Spent')}</p>
                <p className="font-bold text-emerald-700 text-base">
                  {formatCurrency(selectedCustomer.totalRevenue, currencySymbol)}
                </p>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 uppercase text-xs">{t('sales-history', 'Transaction History')}</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {customerSales.length === 0 ? (
                <p className="text-slate-500 italic text-xs">{t('no_sales', 'No sales history available for this customer.')}</p>
              ) : (
                customerSales.map((s) => (
                  <div key={s.id} className="p-2.5 bg-slate-50 border border-slate-200 flex justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{s.saleNumber}</p>
                      <p className="text-[10px] text-slate-500">{formatDate(s.createdAt)}</p>
                    </div>
                    <p className="font-bold text-slate-900">{formatCurrency(s.total, currencySymbol)}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2 bg-slate-100 border border-slate-300 text-slate-800 font-bold uppercase hover:bg-slate-200 text-xs"
              >
                {t('cancel', 'Close')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('add_customer', 'New Customer Registration')}
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('customer', 'Full Name')}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('email', 'Email Address')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('phone', 'Phone Number')}</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('address', 'Physical Address')}</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-bold uppercase hover:bg-slate-200"
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-slate-900 text-white font-bold uppercase hover:bg-black"
            >
              {t('add_customer', 'Register Customer')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
