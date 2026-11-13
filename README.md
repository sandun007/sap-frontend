# SAP / ERP Frontend Application

A modern, responsive, and feature-rich Enterprise Resource Planning (ERP) frontend application designed to streamline inventory, procurement, and master data management. Built with **React 19**, **Vite**, and **Tailwind CSS v4**.

---

## 🚀 Key Modules & Features

### 📦 Inventory & Stock Control
- **Live Stock Management:** Monitor real-time inventory counts across multiple branches and warehouses.
- **Bin Card Tracking:** Comprehensive transaction logs and history per item/location.
- **Stock Adjustments:** Easily record discrepancies, write-offs, and stock transfers.

### 📋 Purchasing & GRN (Goods Received Notes)
- Create and manage purchase orders and vendor deliveries.
- Track GRN receipts, history, and product-specific purchase logs.

### 🏷️ Master Data Management
Complete CRUD and search interfaces for enterprise entities:
- **Products:** Detailed product profiles, SKU, pricing, and barcode integration.
- **Brands, Categories & Subcategories:** Hierarchical classification of items.
- **Branches & Departments:** Organizational unit structure.
- **Stores & Warehouses:** Multi-location stock allocation.
- **Suppliers & Customers:** Contact directories and profile management.
- **Employees:** User access and staff records.
- **Banks & Accounts:** Financial institution and account management.

### 🔍 Barcode & QR Code Integration
- Integrated barcode and QR code scanning using `@zxing`, `html5-qrcode`, and `quagga`.
- QR code generation with `react-qr-code` for quick product tagging and lookup.

### 📊 Reports & Data Export
- One-click export of data tables to **PDF** (via `jspdf` and `jspdf-autotable`) and **Excel** (`.xlsx`).
- Printable formats and thermal/receipt printing configurations.

### 🔐 Security & Access Control
- JWT-based authentication with automated Axios request/response token interceptors.
- Automatic session invalidation and redirect on unauthorized (`401`) responses.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Core Framework** | [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/) |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) (Accessible Primitive Components) |
| **Icons & Alerts** | [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |
| **HTTP Client** | [Axios](https://axios-http.com/) |
| **Scanning & QR** | ZXing, html5-qrcode, Quagga, react-qr-code |
| **Export Tools** | jsPDF, jsPDF-AutoTable, SheetJS (xlsx) |
| **Shortcuts** | hotkeys-js |

---

## 📂 Project Structure

```text
sap-frontend/
├── erp/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── api/            # Centralized Axios API instances & service endpoints
│   │   ├── assets/         # Images, fonts, and graphics
│   │   ├── components/     # Reusable UI elements (Radix primitives, forms, tables)
│   │   ├── Context/        # React context providers (AuthContext, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility helpers and class merges (clsx, tailwind-merge)
│   │   ├── pages/          # Application views & modules
│   │   │   ├── auth/       # Login and credentials screens
│   │   │   ├── bank/       # Bank creation and listings
│   │   │   ├── branch/     # Branch management
│   │   │   ├── brand/      # Brand forms and lists
│   │   │   ├── category/   # Category & subcategory views
│   │   │   ├── customer/   # Customer records
│   │   │   ├── department/ # Department views
│   │   │   ├── employee/   # Employee directories
│   │   │   ├── layout/     # DashboardLayout, Sidebar, Navbar
│   │   │   ├── product/    # Product catalog and creation
│   │   │   ├── purchase/   # Purchase and GRN management
│   │   │   ├── stock/      # Live stock, bin card, stock adjustment
│   │   │   ├── store/      # Store/warehouse operations
│   │   │   └── supplier/   # Supplier directory
│   │   ├── utils/          # Export handlers and formatters
│   │   ├── App.jsx         # Main router and route definitions
│   │   ├── index.css       # Tailwind global directives and theme tokens
│   │   └── main.jsx        # React root entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Backend REST API running (default expected at `http://localhost:8000`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sandun007/sap-frontend.git
   cd sap-frontend
   ```

2. **Navigate to the frontend application directory:**
   ```bash
   cd erp
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Configure API Base URL (Optional):**
   The API connection is configured in [`erp/src/api/api.js`](erp/src/api/api.js):
   ```javascript
   export const BASE_URL = 'http://localhost:8000';
   ```
   Update this to point to your backend server URL if different.

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 🔑 Admin Login & Testing Guide

### Option 1: Standard Login (With Backend API)
1. Ensure your backend server is running on `http://localhost:8000`.
2. Start the frontend (`npm run dev`) and navigate to:
   ```text
   http://localhost:5173/login
   ```
3. Enter your admin credentials:
   - **Email:** `admin@example.com` *(or your backend seeded admin email)*
   - **Password:** `password` *(or your configured admin password)*
4. Click **Login** to enter the main dashboard.

### Option 2: Quick UI Demo / Testing Mode (Without Backend)
If you want to immediately explore and test the dashboard, views, forms, and modules without running a local backend server:

1. Open `http://localhost:5173` in your browser.
2. Open the Browser Developer Console (**F12** or right-click ➔ **Inspect** ➔ **Console**).
3. Paste the following command and hit **Enter**:
   ```javascript
   localStorage.setItem('token', 'demo-test-token'); window.location.href = '/';
   ```
4. This simulates an authenticated session so you can explore:
   - 📊 **Main Dashboard & Layout:** Navigation, statistics, search, and inbox.
   - 📦 **Inventory & Stock:** Live stock tables, Bin Card views, and stock adjustments.
   - 🏷️ **Master Data Interfaces:** Product lists, Add/Edit forms, Category & Brand views.
   - 📷 **Barcode / QR Utilities:** Scanner popups and code generation.
   - 📥 **Export Pipelines:** Excel (`.xlsx`) and PDF generation.

---

## 📜 Available Scripts

Inside the `erp` folder, you can run:

| Command | Description |
|---|---|
| `npm run dev` | Launches the local development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles and bundles production-ready assets into `dist/`. |
| `npm run preview` | Locally serves the production build for testing before deployment. |
| `npm run lint` | Runs ESLint to check for code quality and syntax issues. |

---

## 📄 License

This project is private and proprietary. All rights reserved.
