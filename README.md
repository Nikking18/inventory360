# Inventory 360 📦

> **Local-First Point of Sale (POS) & Multi-Outlet Inventory Management System**

Inventory 360 is a high-performance, local-first retail enterprise management web application designed for fast, offline-durable stock tracking, quick-sale POS terminal operations, purchase order workflows, and multi-outlet financial analytics. Powered by browser IndexedDB.

---

## ✨ Key Features

### 📊 Executive Dashboard & Live Metrics
- **Real-Time KPIs**: Track gross revenue, net profit, low-stock alerts, and total inventory valuation.
- **Interactive Sales Charts**: Visual area charts tracking daily and monthly revenue trends.
- **Stock Health Badges**: Instant indicators for Healthy, Low Stock, and Out of Stock inventory.
- **Outlet Selector**: Switch between all outlets or specific store locations seamlessly.

### 🛒 Point of Sale (POS) Terminal
- **Rapid Item Lookup**: Instant barcode and SKU search with category filter tabs.
- **Cart Boundary Protection**: Enforces real-time stock limits to prevent selling out-of-stock items.
- **Customer CRM Integration**: Assign registered customers to sales at checkout.
- **Multi-Payment Options**: Cash, Card, and Digital Transfer payment processing.
- **Receipt Printing & Refunds**: Built-in receipt printer target and return refund processing.

### 📦 Product Master Catalog
- **Uniqueness Safeguards**: Strict SKU and Barcode collision validation on product creation and editing.
- **Margin Calculations**: Automated cost vs retail price profit margin tracking.
- **Location Stock Preservation**: Maintains per-outlet inventory balances on product updates.
- **Supplier & Category Lookups**: Associate master products with verified suppliers and categories.

### 🔄 Multi-Outlet Stock & Transfer Hub
- **Location Balances**: Real-time stock distribution across main store, warehouse, and outlet locations.
- **Inter-Outlet Transfers**: Execute stock transfers between locations with dual balance updates.
- **Low Stock Alerts & PO Generator**: Automated reorder point alerts with a custom Purchase Order creation modal.
- **Stock Audit Logs**: Detailed history logs recording every stock movement, transfer, and sale.

### 👥 Customer Relationship Management (CRM)
- **Lifetime Value Tracking**: Tracks total orders, lifetime revenue, and last purchase date per customer.
- **Refund Synchronization**: Automatically adjusts customer revenue and order count on sales returns.
- **Customer Search**: Quick search filtering by customer name, email address, or phone number.

### 📈 Advanced Analytics & Financial Reporting
- **Multi-Period Filtering**: Aggregate financial reports by `Today`, `Week`, `Month`, or `Year`.
- **Product Profitability Breakdown**: Inspect total units sold, gross revenue, COGS, and net profit per product.
- **1-Click Exporting**: Export reports directly to **CSV**, **Excel (.xlsx)**, or printable **PDF**.

### 🌟 Interactive Hovering Product Tour
- **7-Step Guided Tour**: Floating spotlight popup card with step counter pills (`01/07` to `07/07`).
- **Live Background Sync**: Automatically navigates background tabs as users progress through tour steps.
- **Direct Feature Triggers**: Interactive action buttons to test POS, Catalog, Inventory, and CRM live.
- **Collapsible Controls**: Minimize tour into a compact status bar anytime during use.

### ⚙️ Workspace Setup & Internationalization
- **Multi-Currency**: Instant switching across major global currencies (`$`, `€`, `£`, `₹`, `¥`, etc.).
- **6-Language Translation**: Full UI translation support for English, Spanish, French, German, Hindi, and Chinese.
- **Theme Customization**: Dark mode and Light mode interface themes.
- **IndexedDB Backup & Restore**: Export and import complete schema-validated JSON database backups.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **State & Database**: Browser [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via `idb`
- **Styling**: Vanilla CSS & [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn**

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

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔒 Privacy & Data Ownership

Inventory 360 is built with a **local-first architecture**. All data (products, sales, customers, stock movements, purchase orders, and settings) is stored safely inside your browser's IndexedDB. No external servers or third-party cloud services receive your confidential business data.

---

## 📄 License

This project is licensed under the MIT License.
