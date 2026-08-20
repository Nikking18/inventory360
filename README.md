# Inventory 360 📦

> **Industrial-Grade Local-First Point of Sale (POS) & Multi-Outlet Inventory Management System**

[![Live Production](https://img.shields.io/badge/🌐_Live_Domain-www.inventory360.shop-10B981?style=for-the-badge&logo=vercel&logoColor=white)](https://www.inventory360.shop/)
[![Next.js 15](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![IndexedDB Local-First](https://img.shields.io/badge/Storage-100%25_Offline_IndexedDB-blueviolet?style=for-the-badge)](https://www.inventory360.shop/)
[![Languages](https://img.shields.io/badge/i18n-11_Languages_Supported-amber?style=for-the-badge)](https://www.inventory360.shop/)

Inventory 360 is a zero-latency, local-first retail enterprise web application designed for fast, offline-resilient stock tracking, quick-sale POS terminal operations, matrix product variants, lots & FEFO batch expiry management, multi-channel marketplace synchronization, thermal receipt printing, and multi-outlet financial analytics.

---

## 🌐 Official Production Domain

🚀 **Launch the Web App:**  
👉 **[https://www.inventory360.shop/](https://www.inventory360.shop/)**

---

## ✨ Core Enterprise Features

### 📊 Executive Dashboard & Real-Time Financial Ledger
- **Live Sales & Profit Telemetry**: Sub-second revenue calculations, profit margins, and average order values (AOV).
- **Interactive Chart.js Visualizations**: Switch between interactive line and bar charts with daily, weekly, and monthly aggregations.
- **Recent Buyers & Live Invoices**: Live stream of walk-in and customer transactions with instant ESC/POS thermal receipt reprint.
- **Multi-Outlet Aggregation**: Seamlessly switch telemetry across all outlets or filter by individual retail branch / warehouse.

### 🛒 Point of Sale (POS) Terminal
- **Sub-50ms SKU & Barcode Lookup**: High-speed live catalog search with camera barcode scanning support.
- **Matrix Variant Selector**: Direct POS variant add for color, size, and material combinations.
- **Flexible Discounts & Dual Tax Rules**: Line-item tax exemptions, custom cashier flat/percent discounts, and automated HST/GST computation.
- **Multi-Channel Tender**: Cash, Card, Bank Transfer, and marketplace payments with instant split calculation.
- **ESC/POS & Thermal Printing**: Configurable 58mm / 80mm thermal receipts and standard A4 invoices.

### 📦 Master Product Catalog & Matrix Variants
- **2D / 3D Variant Matrix Generator**: Instantly generate matrix permutations (e.g. Size × Color) with auto-generated SKUs.
- **Collision Protection**: Strict client-side validation against duplicate SKUs or barcode collisions.
- **Automated Profit Margins**: Live calculation of markup percentages, cost of goods sold (COGS), and MSRP pricing.
- **Custom Tax Overrides**: Assign item-specific tax rates or mark products as tax-exempt.

### 🔄 Multi-Location Inventory & Stock Transfer Hub
- **Multi-Outlet Balance Grids**: Real-time stock distribution across main storefronts, pop-ups, and central warehouses.
- **Inter-Outlet Stock Transfers**: Execute audited stock movements with transfer slips, carrier tracking, and receiving verification.
- **Lots & FEFO Expiry Tracking**: Batch lot numbers, manufacturing dates, and First-Expired-First-Out (FEFO) alerts to eliminate spoilage.
- **Automated Purchase Orders (PO)**: 1-click PO generator when inventory dips below minimum reorder thresholds.

### 👥 Customer Relationship Management (CRM)
- **Customer Lifetime Value (LTV)**: Track total purchases, average spend, loyalty tiers (VIP), and order history per buyer.
- **Omni-Channel Attribution**: Associate orders with in-store walk-in, Shopify, Amazon, eBay, or WooCommerce channels.
- **Refund & Return Ledger**: Full restocking return processing that automatically balances store inventory and customer metrics.

### 📈 Reporting & Financial Audit
- **Comprehensive Ledger Reports**: Export filtered sales, COGS, tax breakdowns, and net margins.
- **1-Click Export Options**: Export full reports in **CSV**, **Excel (.xlsx)**, or print-ready **PDF**.
- **Historical Audit Logs**: Complete immutability log for all inventory transfers, adjustments, and price edits.

### 🌍 11-Language Internationalization (i18n)
- **Supported Languages**: English (`en`), Spanish (`es`), French (`fr`), German (`de`), Hindi (`hi`), Japanese (`ja`), Chinese (`zh`), Arabic (`ar` with full RTL layout), Portuguese (`pt`), Italian (`it`), and Russian (`ru`).
- **Global Currency Engine**: Instant live switching between USD ($), EUR (€), GBP (£), CAD (C$), AUD (A$), JPY (¥), INR (₹), BRL (R$), MXN (Mex$), AED (AED), and more.

### 💾 Automated Local File System Backups
- **Continuous Auto-Save**: Automated periodic snapshots saved directly to your chosen local folder via the HTML5 File System Access API.
- **Encrypted JSON Export / Import**: 1-click backup and schema-validated restore for total data sovereignty.

---

## 🛠️ Technology Stack

- **Deployment**: [Vercel](https://vercel.com/) (Edge CDN with custom domain SSL)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Static Export ready)
- **UI Architecture**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Storage Layer**: Browser [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via `idb`
- **Styling**: Vanilla CSS & Tailwind CSS with curated industrial aesthetics
- **Charting**: [Chart.js](https://www.chartjs.org/) & `react-chartjs-2`
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18.18.0 or higher
- **npm**, **pnpm**, or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Nikking18/inventory360.git
   cd inventory360
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build production bundle**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔒 Privacy, Security & Data Sovereignty

Inventory 360 is built strictly with a **local-first architecture**:
- **Zero Cloud Tracking**: All retail transactions, inventory catalogs, financial reports, and customer profiles remain in your local browser storage.
- **100% Offline Capability**: Complete operational continuity without internet connectivity.
- **Content Security Policy (CSP)**: Hardened HTTP headers preventing XSS and unauthorized script execution.

---

## 📄 License

This project is licensed under the MIT License.
