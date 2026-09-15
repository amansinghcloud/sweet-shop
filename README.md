# 🍬 Madhuraj Sweet House – Full-Stack E-Commerce Web Application

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68A063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Jest](https://img.shields.io/badge/Jest-Tested_100%25-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![JavaScript](https://img.shields.io/badge/ES6+-Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **Madhuraj Sweet House** is a production-grade full-stack confectionery e-commerce web platform celebrating authentic traditional Indian mithai handcrafted in 100% pure cow desi ghee since 1990. 
> 
> Engineered with a robust **Node.js & Express REST API backend**, **SQLite persistent database**, **JWT authentication**, **real-time order tracking pipeline**, **interactive cart drawer & checkout**, **administrator analytics portal**, and a **comprehensive automated test suite**.

---

## 📑 Table of Contents
- [🌟 Key Features](#-key-features)
- [🏗️ Architecture & Tech Stack](#️-architecture--tech-stack)
- [🚀 Quick Start Guide (How to Run)](#-quick-start-guide-how-to-run)
- [🔑 Demo Accounts & Test Credentials](#-demo-accounts--test-credentials)
- [🏷️ Active Discount Promo Codes](#️-active-discount-promo-codes)
- [🚚 Live Order Tracking Demo](#-live-order-tracking-demo)
- [🧪 Running Automated Tests](#-running-automated-tests)
- [🌐 REST API Documentation](#-rest-api-documentation)
- [📂 Project Structure](#-project-structure)
- [👑 Admin Management Portal](#-admin-management-portal)

---

## 🌟 Key Features

### 🛒 Customer Storefront & Shopping Experience
- **Luxury Confectionery Aesthetic:** Rich royal crimson and saffron amber design palette, gold gradients, glassmorphic modal overlays, and smooth micro-interactions.
- **Dynamic Sweets Catalog:** Real-time catalog populated from SQLite with category tabs (*Laddoo, Kaju Katli, Barfi & Peda, Bengali Sweets, Dry Fruits, Hampers*), live search filter, and price/rating sorting.
- **Product Quick-View Modal:** Detailed sweet view featuring authentic ingredients, shelf-life indicators, customer ratings, pack size selector (`250g`, `500g`, `1kg`), and dynamic price calculation.
- **Slide-Over Cart Drawer:** Interactive slide-out cart drawer with quantity controls (`+` / `-`), item removal, live subtotal updates, and real-time promo coupon validation.
- **Express Checkout Flow:** Seamless checkout modal with delivery address capture, payment method selection (*Cash on Delivery, UPI, Debit/Credit Card*), order notes, and instant stock deduction.
- **Order Confirmation Celebration:** Pop-up celebration with uniquely generated Tracking ID (e.g., `MS-982410`) and one-click redirection to live tracking.

### 🚚 Live 6-Stage Order Tracking Pipeline
- Real-time interactive delivery timeline:
  1. `Order Received` (Confirmed & allocated)
  2. `Preparing Fresh` (Handcrafted in kitchen with pure cow ghee)
  3. `Quality Check` (Aroma inspection & vacuum sealing)
  4. `Dispatched` (Handed over to express courier)
  5. `Out for Delivery` (Delivery executive approaching doorstep)
  6. `Delivered` (Safely delivered to customer)
- Status-based active pulsing node, visual completion progress bar, delivery address review, and ordered items breakdown.

### 🛡️ Secure Authentication & User Roles
- **JWT (JSON Web Tokens):** Cryptographically signed tokens with 7-day expiration.
- **Password Security:** Salted and hashed using `bcryptjs` (10 rounds).
- **Role-Based Authorization:** Strict separation of privileges between `customer` and `admin` roles.
- **1-Click Evaluator Login:** Built-in demo helper buttons to instantly populate evaluator credentials.

### 👑 Administrator Management Portal (`/admin.html`)
- **Real-Time Analytics:** Live dashboard cards showing Total Revenue (₹), Total Orders, Pending Deliveries, and Low Stock alerts.
- **Live Order Fulfillment:** Real-time orders table allowing admins to change an order's status dropdown (e.g. from `Received` to `Out for Delivery` or `Delivered`) which dynamically updates the customer's live tracking page!
- **Inventory & Stock Management:** View catalog stock levels, trigger one-click `Restock +25` units, or add new sweets with custom categories, prices, and images.
- **Customer Inquiries Console:** Review contact form submissions and corporate gifting inquiries.

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph LR
    subgraph Frontend["Frontend Client (Vanilla Web)"]
        UI["HTML5 + CSS3 (Confectionery Design)"]
        JS["script.js (State, Cart Drawer & API Client)"]
        UI <--> JS
    end

    subgraph Backend["Backend Server (Node.js & Express 5)"]
        Router["Express REST Router (/api)"]
        AuthMid["JWT Auth & Role Guard Middleware"]
        Controllers["Controllers: Auth, Products, Orders, Coupons, Inquiries, Admin"]
        Router --> AuthMid --> Controllers
    end

    subgraph Database["Persistent Storage Layer"]
        DB[("SQLite Database (sweetshop.db)")]
        Controllers <--> DB
    end

    JS -->|HTTP Fetch (JSON)| Router
```

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v18+) | Non-blocking, event-driven JavaScript runtime |
| **Framework** | Express.js 5.x | High-performance minimalist REST API framework |
| **Database** | SQLite 3 | Embedded zero-config SQL database with async Promises |
| **Security** | bcryptjs & jsonwebtoken | Industry standard password hashing and JWT sessions |
| **Frontend** | Vanilla HTML5, CSS3 & ES6 | Pure native stack with zero heavy framework overhead |
| **Testing** | Jest & Supertest | Automated integration tests for all REST endpoints |

---

## 🚀 Quick Start Guide (How to Run)

Follow these simple steps to run the complete full-stack project locally on your machine:

### 1. Prerequisites
Make sure you have **Node.js** (v18 or higher) and **npm** installed on your system:
```bash
node -v
npm -v
```

### 2. Clone Repository & Navigate
```bash
git clone https://github.com/amansinghcloud/sweet-shop.git
cd sweet-shop
```

### 3. Install Dependencies
Install all required backend and developer dependencies:
```bash
npm install
```

### 4. Seed Database (Optional – Auto-seeds on boot)
To manually seed the SQLite database with the full sweets catalog, demo accounts, sample orders, and promo coupons:
```bash
npm run seed
```

### 5. Start the Application
Run the production server:
```bash
npm start
```
*(Or run in development mode with auto-reload using `npm run dev`)*

### 6. Open in Browser
Once started, access the project at:
- **Customer Storefront:** [http://localhost:5000](http://localhost:5000)
- **Sweets Catalog:** [http://localhost:5000/shop.html](http://localhost:5000/shop.html)
- **Live Order Tracker:** [http://localhost:5000/trackorder.html](http://localhost:5000/trackorder.html)
- **Admin Management Portal:** [http://localhost:5000/admin.html](http://localhost:5000/admin.html)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Accounts & Test Credentials

Pre-configured accounts are seeded automatically for instant evaluator testing:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@madhuraj.in` | `Admin@123` | Full access to Admin Portal (`/admin.html`), sales metrics, order status controls, and inventory restock |
| **Customer** | `demo@example.com` | `Demo@123` | Storefront browsing, cart checkout, profile management, and order history |

> 💡 **Evaluator Convenience:** In both the customer login modal and the Admin Portal login page, you will find a **"Quick Evaluator Demo Fill"** button that automatically inputs these credentials with a single click!

---

## 🏷️ Active Discount Promo Codes

Test the promo discount engine in the slide-over Cart Drawer:

| Promo Code | Discount | Minimum Order | Terms |
| :--- | :--- | :--- | :--- |
| `MITHAI15` | **15% OFF** | ₹500 | Max discount ₹300 |
| `WELCOME10` | **10% OFF** | ₹300 | Max discount ₹200 |
| `FESTIVE20` | **20% OFF** | ₹1,200 | Max discount ₹600 (ideal for hampers) |

---

## 🚚 Live Order Tracking Demo

You can test live order tracking using either pre-seeded tracking codes or by placing a fresh order:

1. **Pre-Seeded Orders to Test Instantly:**
   - Tracking ID: **`MS-1001`** → Status: **Out for Delivery**
   - Tracking ID: **`MS-1002`** → Status: **Preparing Fresh**
2. **Dynamic Live Update Test:**
   - Open `http://localhost:5000/admin.html` and log in as Admin.
   - Change `MS-1001`'s status to `Delivered`.
   - Refresh or view `http://localhost:5000/trackorder.html?orderId=MS-1001` to verify the live timeline immediately reflects the update!

---

## 🧪 Running Automated Tests

A comprehensive integration test suite built with **Jest** and **Supertest** verifies all backend controllers, auth authorization, input validation, and business logic:

```bash
npm test
```

### Test Coverage Summary:
```text
PASS tests/api.test.js
  Madhuraj Sweet House API Test Suite
    √ GET /api/health should return healthy status
    √ POST /api/auth/login with valid demo customer credentials
    √ POST /api/auth/login with valid admin credentials
    √ POST /api/auth/login should reject invalid password
    √ GET /api/auth/profile with bearer token
    √ GET /api/auth/profile fails without token
    √ GET /api/products returns catalog of sweets
    √ GET /api/products?category=kaju filters specifically for Kaju sweets
    √ GET /api/products?search=Motichoor returns search results
    √ POST /api/coupons/validate verifies valid coupon code MITHAI15
    √ POST /api/coupons/validate rejects invalid coupon
    √ POST /api/orders successfully places an order and returns tracking code
    √ GET /api/orders/track/:code tracks the newly created order
    √ GET /api/orders/track/:code with existing seeded code MS-1001
    √ GET /api/admin/stats denies customer token (403 Forbidden)
    √ GET /api/admin/stats allows admin token and returns analytics
    √ POST /api/contact submits customer inquiry

Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
```

---

## 🌐 REST API Documentation

### Base URL: `http://localhost:5000/api`

### 1. Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new customer account | No |
| `POST` | `/auth/login` | Authenticate customer/admin & receive JWT | No |
| `GET` | `/auth/profile` | Get logged-in user profile & purchase history | **Bearer Token** |

### 2. Products Catalog
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Query sweets (supports `?category=`, `?search=`, `?sort=`) | No |
| `GET` | `/products/:id` | Get single sweet details with reviews | No |
| `POST` | `/products` | Add a new sweet to the menu | **Admin Only** |
| `PUT` | `/products/:id` | Update sweet price, stock, or details | **Admin Only** |
| `DELETE` | `/products/:id` | Remove sweet from catalog | **Admin Only** |
| `POST` | `/products/:id/reviews` | Submit a customer rating and review | No |

### 3. Orders & Tracking
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Place a new sweet order & generate tracking ID | Optional JWT |
| `GET` | `/orders/track/:code` | Retrieve 6-stage order tracking status & details | No |
| `GET` | `/orders/admin` | Retrieve all customer orders for fulfillment | **Admin Only** |
| `PUT` | `/orders/admin/:id/status` | Update fulfillment status (`Received` → `Delivered`) | **Admin Only** |

### 4. Promo Coupons & Inquiries
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/coupons/validate` | Validate promo code and compute cart discount | No |
| `POST` | `/contact` | Submit general or corporate gifting inquiry | No |
| `GET` | `/contact/admin` | View all customer inquiries | **Admin Only** |
| `GET` | `/admin/stats` | Retrieve sales revenue, orders count, and alerts | **Admin Only** |

---

## 📂 Project Structure

```text
sweetshop/
├── index.html                  # Homepage (Hero, Bestsellers, Heritage banner)
├── shop.html                   # Sweets Catalog (Search, Filter, Quick-View)
├── trackorder.html             # Live 6-Stage Delivery Pipeline Tracker
├── admin.html                  # Admin Management Portal & Sales Analytics
├── gifting.html                # Corporate Gifting & Custom Hamper Builder
├── achievements.html           # Brand Heritage, Awards & Milestones
├── contact.html                # Store Locator & Contact Inquiry Form
├── style.css                   # Unified Confectionery Design System
├── script.js                   # Client-side State, Cart Drawer & API Layer
│
├── server/                     # Modular Node.js / Express REST API
│   ├── server.js               # Express application entrypoint
│   ├── config/
│   │   ├── db.js               # SQLite connection & schema initialization
│   │   └── seed.js             # Initial database seed (sweets, users, orders)
│   ├── controllers/
│   │   ├── authController.js   # Registration, Login, Profile
│   │   ├── productController.js# CRUD, Search, Filter & Reviews
│   │   ├── orderController.js  # Order Checkout & Status Tracking
│   │   ├── couponController.js # Promo Discount Engine
│   │   ├── inquiryController.js# Contact Inquiries
│   │   └── adminController.js  # Analytics & Dashboard Metrics
│   ├── middleware/
│   │   └── auth.js             # JWT verification & Admin RBAC guards
│   └── routes/
│       └── api.js              # Central REST API router
│
├── tests/
│   └── api.test.js             # Jest & Supertest Integration Test Suite
│
├── sweetshop.db                # Persistent SQLite database file
├── package.json                # Project dependencies and scripts
├── .env                        # Environment configuration
└── README.md                   # Complete documentation guide
```

---

## 👑 Admin Management Portal Preview

Navigate to **`http://localhost:5000/admin.html`** or log in with `admin@madhuraj.in` / `Admin@123` to experience:

1. **Dashboard Analytics:** Live metrics showing revenue earned, order volume, pending kitchen batches, and active sweets catalog.
2. **Order Fulfillment Table:** View every placed order with customer address, contact phone, ordered items, and payment method.
3. **Interactive Status Controls:** Modify an order's fulfillment status (*Received → Preparing → Quality Check → Dispatched → Out for Delivery → Delivered*) with real-time persistence.
4. **Stock Restocking:** One-click inventory restock and new sweet menu additions.

---

## 👥 Original Author & Academic Info
- **Student Name:** Aman Singh
- **College ID:** 2024KUEC2037
- **Batch:** C2
- **Original Repository:** [https://github.com/amansinghcloud/sweet-shop.git](https://github.com/amansinghcloud/sweet-shop.git)

---

### 💖 Crafted with Tradition and Pure Desi Ghee since 1990.
