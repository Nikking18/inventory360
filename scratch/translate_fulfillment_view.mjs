import fs from 'fs';

const filePath = 'components/views/FulfillmentView.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replacements in FulfillmentView.tsx:
// 1. Top action buttons
content = content.replace(
  `<span>Log Order</span>`,
  `<span>{t('log_order', 'Log Order')}</span>`
);
content = content.replace(
  `<span>{isSyncing ? 'Updating...' : 'Update Feeds'}</span>`,
  `<span>{isSyncing ? t('updating_feeds', 'Updating...') : t('update_feeds', 'Update Feeds')}</span>`
);
content = content.replace(
  `<span>Tracked feeds refreshed for In-Store POS and Online platforms (Shopify, Amazon, eBay, WooCommerce).</span>`,
  `<span>{t('tracked_feeds_refreshed', 'Tracked feeds refreshed for In-Store POS and Online platforms (Shopify, Amazon, eBay, WooCommerce).')}</span>`
);

// 2. Channel cards
content = content.replace(
  `<h3 className="font-bold text-xs text-slate-900 uppercase">In-Store POS</h3>\n                    <p className="text-[10px] text-slate-500">Counter Register &amp; Walk-in</p>`,
  `<h3 className="font-bold text-xs text-slate-900 uppercase">{t('in_store_pos', 'In-Store POS')}</h3>\n                    <p className="text-[10px] text-slate-500">{t('counter_walk_in', 'Counter Register & Walk-in')}</p>`
);
content = content.replace(
  `<span className="text-[9px] font-bold px-2 py-0.5 border border-slate-300 text-slate-800 bg-slate-50 uppercase">\n                  Tracked\n                </span>`,
  `<span className="text-[9px] font-bold px-2 py-0.5 border border-slate-300 text-slate-800 bg-slate-50 uppercase">\n                  {t('tracked', 'Tracked')}\n                </span>`
);
content = content.replace(
  `<span className="text-[9px] text-slate-500 uppercase">POS Sales</span>`,
  `<span className="text-[9px] text-slate-500 uppercase">{t('pos_sales', 'POS Sales')}</span>`
);
content = content.replace(
  `{orders.filter((o) => o.channel === 'In-Store POS').length} Logged`,
  `{orders.filter((o) => o.channel === 'In-Store POS').length} {t('logged', 'Logged')}`
);
content = content.replace(
  `<span className="text-[9px] text-slate-500 uppercase">Inventory Sync</span>\n                  <p className="text-sm font-bold text-slate-900 mt-0.5">Real-Time</p>`,
  `<span className="text-[9px] text-slate-500 uppercase">{t('inventory_sync', 'Inventory Sync')}</span>\n                  <p className="text-sm font-bold text-slate-900 mt-0.5">{t('real_time', 'Real-Time')}</p>`
);
content = content.replace(
  `<h3 className="font-bold text-xs text-slate-900 uppercase">Online Marketplaces &amp; E-Commerce</h3>\n                    <p className="text-[10px] text-slate-500">Tracked Multi-Platform Order Streams</p>`,
  `<h3 className="font-bold text-xs text-slate-900 uppercase">{t('online_marketplaces', 'Online Marketplaces & E-Commerce')}</h3>\n                    <p className="text-[10px] text-slate-500">{t('tracked_order_streams', 'Tracked Multi-Platform Order Streams')}</p>`
);
content = content.replace(
  `<span className="text-[9px] font-bold px-2 py-0.5 border border-emerald-300 text-emerald-800 bg-emerald-50 uppercase">\n                  Tracked (4 Platforms)\n                </span>`,
  `<span className="text-[9px] font-bold px-2 py-0.5 border border-emerald-300 text-emerald-800 bg-emerald-50 uppercase">\n                  {t('tracked_4_platforms', 'Tracked (4 Platforms)')}\n                </span>`
);
content = content.replace(
  `<span className="text-[8px] font-bold uppercase text-slate-600 bg-white border border-slate-200 px-1 py-0.2">\n                          Tracked\n                        </span>`,
  `<span className="text-[8px] font-bold uppercase text-slate-600 bg-white border border-slate-200 px-1 py-0.2">\n                          {t('tracked', 'Tracked')}\n                        </span>`
);
content = content.replace(
  `<p className="text-[10px] text-slate-500">{plat.ordersCount} Orders</p>`,
  `<p className="text-[10px] text-slate-500">{plat.ordersCount} {t('orders_count', 'Orders')}</p>`
);

// 3. Status Tabs and Filters
content = content.replace(
  `{tab}\n                  </button>`,
  `{t(\`status_\${tab}\`, tab)}\n                  </button>`
);
content = content.replace(
  `placeholder="Search Order #, Customer, Tracking..."`,
  `placeholder={t('search_fulfillment_placeholder', 'Search Order #, Customer, Tracking...')}`
);
content = content.replace(
  `<option value="all">All Channels</option>\n                  <option value="in-store">In-Store POS</option>\n                  <option value="online-all">Online (All Platforms)</option>`,
  `<option value="all">{t('all_channels', 'All Channels')}</option>\n                  <option value="in-store">{t('channel_in_store', 'In-Store POS')}</option>\n                  <option value="online-all">{t('channel_online_all', 'Online (All Platforms)')}</option>`
);

// 4. All Orders Table Headers
content = content.replace(
  `<th className="p-2.5">Order #</th>\n                    <th className="p-2.5">Channel</th>\n                    <th className="p-2.5">Date</th>\n                    <th className="p-2.5">Customer &amp; Destination</th>\n                    <th className="p-2.5">Items</th>\n                    <th className="p-2.5 text-right">Total</th>\n                    <th className="p-2.5 text-center">Status</th>\n                    <th className="p-2.5">Carrier / Tracking</th>\n                    <th className="p-2.5 text-center">Action</th>`,
  `<th className="p-2.5">{t('th_order_num', 'Order #')}</th>\n                    <th className="p-2.5">{t('th_channel', 'Channel')}</th>\n                    <th className="p-2.5">{t('th_date', 'Date')}</th>\n                    <th className="p-2.5">{t('th_customer_dest', 'Customer & Destination')}</th>\n                    <th className="p-2.5">{t('th_items', 'Items')}</th>\n                    <th className="p-2.5 text-right">{t('th_total', 'Total')}</th>\n                    <th className="p-2.5 text-center">{t('th_status', 'Status')}</th>\n                    <th className="p-2.5">{t('th_carrier_tracking', 'Carrier / Tracking')}</th>\n                    <th className="p-2.5 text-center">{t('th_action', 'Action')}</th>`
);
content = content.replace(
  `No orders matching active filters.`,
  `{t('no_orders_match', 'No orders matching active filters.')}`
);
content = content.replace(
  `Dispatch\n                            </button>`,
  `{t('process_dispatch', 'Dispatch')}\n                            </button>`
);
content = content.replace(
  `Slip\n                            </button>`,
  `{t('packing_slip', 'Slip')}\n                            </button>`
);

// 5. Pending dispatch queue
content = content.replace(
  `<span>Generate Pick List ({aggregatedPickItems.length} SKUs)</span>`,
  `<span>{t('batch_pick_list', 'Generate Pick List')} ({aggregatedPickItems.length} SKUs)</span>`
);
content = content.replace(
  `<span>Start Picking</span>`,
  `<span>{t('start_picking', 'Start Picking')}</span>`
);
content = content.replace(
  `<span>Mark Packed</span>`,
  `<span>{t('mark_packed', 'Mark Packed')}</span>`
);
content = content.replace(
  `<span>Ship &amp; Tracking</span>`,
  `<span>{t('process_dispatch', 'Ship & Tracking')}</span>`
);

// 6. Shipped Orders
content = content.replace(
  `<th className="p-2.5">Order #</th>\n                    <th className="p-2.5">Channel</th>\n                    <th className="p-2.5">Customer &amp; Address</th>\n                    <th className="p-2.5">Carrier</th>\n                    <th className="p-2.5">Tracking Number</th>\n                    <th className="p-2.5 text-right">Value</th>\n                    <th className="p-2.5 text-center">Status</th>\n                    <th className="p-2.5 text-center">Actions</th>`,
  `<th className="p-2.5">{t('th_order_num', 'Order #')}</th>\n                    <th className="p-2.5">{t('th_channel', 'Channel')}</th>\n                    <th className="p-2.5">{t('th_customer_dest', 'Customer & Address')}</th>\n                    <th className="p-2.5">{t('select_carrier', 'Carrier')}</th>\n                    <th className="p-2.5">{t('enter_tracking_num', 'Tracking Number')}</th>\n                    <th className="p-2.5 text-right">{t('th_total', 'Value')}</th>\n                    <th className="p-2.5 text-center">{t('th_status', 'Status')}</th>\n                    <th className="p-2.5 text-center">{t('th_actions', 'Actions')}</th>`
);
content = content.replace(
  `Mark Delivered\n                              </button>`,
  `{t('mark_delivered', 'Mark Delivered')}\n                              </button>`
);

// 7. Modals
content = content.replace(
  `title={\`DISPATCH ORDER: \${selectedOrder.orderNumber}\`}`,
  `title={\`\${t('dispatch_modal_title', 'DISPATCH ORDER')}: \${selectedOrder.orderNumber}\`}`
);
content = content.replace(
  `Select Shipping Carrier\n              </label>`,
  `{t('select_carrier', 'Select Shipping Carrier')}\n              </label>`
);
content = content.replace(
  `Tracking Number / Waybill ID\n              </label>`,
  `{t('enter_tracking_num', 'Tracking Number / Waybill ID')}\n              </label>`
);
content = content.replace(
  `Cancel\n              </button>`,
  `{t('cancel', 'Cancel')}\n              </button>`
);
content = content.replace(
  `<span>Confirm &amp; Ship</span>`,
  `<span>{t('mark_as_shipped', 'Confirm & Ship')}</span>`
);
content = content.replace(
  `title="LOG ONLINE / IN-STORE ORDER"`,
  `title={t('log_order_modal_title', 'LOG ONLINE / IN-STORE ORDER')}`
);
content = content.replace(
  `Order Sales Channel\n              </label>`,
  `{t('select_channel', 'Order Sales Channel')}\n              </label>`
);
content = content.replace(
  `Customer Name *\n                </label>`,
  `{t('customer_name', 'Customer Name')} *\n                </label>`
);
content = content.replace(
  `Customer Email\n                </label>`,
  `{t('customer_email', 'Customer Email')}\n                </label>`
);
content = content.replace(
  `Delivery Address *\n              </label>`,
  `{t('shipping_address', 'Delivery Address')} *\n              </label>`
);
content = content.replace(
  `Assigned Fulfillment Outlet *\n                </label>`,
  `{t('assign_location', 'Assigned Fulfillment Outlet')} *\n                </label>`
);
content = content.replace(
  `Product SKU *\n                </label>`,
  `{t('select_product_label', 'Product SKU')} *\n                </label>`
);
content = content.replace(
  `Order Quantity *\n                </label>`,
  `{t('order_quantity', 'Order Quantity')} *\n                </label>`
);
content = content.replace(
  `<span>Log Order to Tracker</span>`,
  `<span>{t('register_order_btn', 'Log Order to Tracker')}</span>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully translated FulfillmentView.tsx!');
