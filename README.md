# 💳 PayFlow - Full-Stack Payment Wallet Application

A full-stack virtual wallet application built with **React** (Vite + Tailwind CSS), **Node.js + Express**, and **MongoDB (Mongoose)**. Users maintain virtual accounts, purchase wallet points in Indian Rupees (INR) through a simulated payment gateway, transfer wallet points to other registered users in real-time with atomic consistency, and view complete transaction histories. Administrators manage and update the conversion rate between Rupees and wallet points and monitor platform activity.

---

## 📁 Project Architecture & Folder Structure

The project strictly follows standard separation of concerns with dedicated `frontend` and `backend` directories:

```
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection & automated local daemon runner
│   ├── controllers/
│   │   ├── authController.js     # User registration, authentication & JWT issuance
│   │   ├── walletController.js   # Purchase points, peer transfers & my transactions
│   │   ├── userController.js     # Directory of registered users & profile aggregates
│   │   └── adminController.js    # Conversion rate configuration, stats & platform ledger
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & request user hydration
│   │   └── adminMiddleware.js    # Administrator role authorization
│   ├── models/
│   │   ├── User.js               # User schema (roles, balance, bcrypt hashing)
│   │   ├── Config.js             # System settings (points per Rupee conversion rate)
│   │   └── Transaction.js        # Transaction ledger (PURCHASE / TRANSFER, status, notes)
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── userRoutes.js         # /api/users endpoints
│   │   ├── walletRoutes.js       # /api/wallet endpoints
│   │   └── adminRoutes.js        # /api/admin endpoints
│   ├── scripts/
│   │   └── seed.js               # Pre-seeds admin and demo users with points
│   ├── .env                      # Backend environment variables
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express application entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js    # Axios client with JWT interceptor & auto-headers
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state, balance sync & session management
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar with live points pill & profile menu
│   │   │   ├── ProtectedRoute.jsx# Auth route guard
│   │   │   ├── AdminRoute.jsx    # Admin-only route guard
│   │   │   ├── TransferModal.jsx # Points transfer modal with live balance preview
│   │   │   └── PaymentModal.jsx  # Simulated checkout modal (UPI, Card, NetBanking)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # Dashboard with user directory & quick transfer
│   │   │   ├── PurchasePage.jsx  # Points purchasing calculator & simulated payment
│   │   │   ├── ProfilePage.jsx   # Profile stats & filterable transaction ledger
│   │   │   ├── LoginPage.jsx     # Login page with 1-click Demo Fill buttons
│   │   │   ├── RegisterPage.jsx  # User registration with 50-point starter bonus
│   │   │   └── AdminDashboardPage.jsx # Admin rate manager & system audit
│   │   ├── App.jsx               # Router & routes configuration
│   │   ├── main.jsx              # React 18 DOM root
│   │   └── index.css             # Tailwind base & custom styling
│   ├── index.html
│   ├── vite.config.js            # Vite configuration with API reverse proxy
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── package.json                  # Root scripts for running backend & frontend
└── README.md                     # Documentation
```

---

## ✨ Features Implemented

### 👑 Admin Features
1. **Admin Authentication**: Dedicated administrator login credentials and route guard (`/admin`).
2. **Dynamic Conversion Rate Management**: 
   - View the current conversion rate (`1 INR = X Points`).
   - Live update the conversion rate (e.g., change from 10 points/₹ to 15 points/₹).
   - Any rate change applies immediately to all future purchases across the platform.
3. **Platform Statistics & Ledger**:
   - Total registered users count.
   - Total circulating wallet points in user balances.
   - Total INR revenue received through purchases.
   - Total points transferred between users.
   - Complete audit trail of all transactions with search & filtering.

### 👤 End-User Features
1. **User Registration & Login**:
   - Secure password hashing using `bcryptjs` and session tokens via `jsonwebtoken`.
   - Free **50 wallet points** starter bonus upon registering a new account.
   - 1-Click demo fill buttons on the login screen for instantaneous testing.
2. **Landing Page / Dashboard**:
   - Displays real-time wallet points balance and approximate rupee value.
   - **Registered Users Directory**: Searchable list of other registered users on the platform.
   - **1-Click "Transfer"**: Directly open the transfer dialog with that user pre-selected.
   - Quick preview of recent transactions.
3. **Points Transfer**:
   - Select any registered user from the directory.
   - Enter points amount with instant remaining balance preview.
   - Add an optional transfer note/message (e.g., "Dinner split", "Project reward").
   - Atomic deduction and credit using MongoDB conditional atomic updates to prevent double-spending or race conditions.
   - Confetti celebration animation upon successful transfer.
4. **Purchase Wallet Points Page**:
   - Real-time exchange rate display managed by the admin.
   - Interactive rupee-to-points calculator with preset amount chips (₹50, ₹100, ₹250, ₹500, ₹1000, ₹2000).
   - **Simulated Payment Gateway**:
     - Modern checkout UI with options for **UPI** (GPay, PhonePe, Paytm), **Credit/Debit Cards**, and **Net Banking**.
     - **Simulation Testing Toggle**: Switch between "Simulate Success" and "Simulate Failure" to test error scenarios and receipt generation.
5. **User Profile & Transaction History Page**:
   - Summary statistics: Total points purchased, total INR spent, total points sent, and total points received.
   - Filterable transaction history: Filter by **All**, **Purchases**, **Transfers Sent**, and **Transfers Received**.
   - Instant search by reference ID or note.
   - Click any transaction to open a full digital receipt with timestamps, counterparty details, and reference codes.

---

## 🔑 Pre-Seeded Demo Credentials

The backend automatically seeds these test accounts on startup:

| Role | Name | Email | Password | Starting Balance |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | System Admin | `admin@wallet.com` | `admin123` | 10,000 pts |
| **User** | Rahul Sharma | `rahul@gmail.com` | `user123` | 850 pts |
| **User** | Priya Patel | `priya@gmail.com` | `user123` | 1,200 pts |
| **User** | Amit Verma | `amit@gmail.com` | `user123` | 400 pts |
| **User** | Sneha Reddy | `sneha@gmail.com` | `user123` | 2,500 pts |

> 💡 **Tip**: On the **Sign In** page, you can click the **"Quick Demo Fill"** cards to instantly log in as the Admin or User without typing!

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas URI)

---

### Step 1: Start the Backend Server

Open a terminal in the project root:

```bash
cd backend
npm start
```

*The backend will:*
- Connect to MongoDB at `mongodb://127.0.0.1:27017/wallet_app` (or launch the local daemon).
- Seed the default Administrator, demo users, and default conversion rate (`1 INR = 10 Points`).
- Start listening on `http://localhost:5000`.

---

### Step 2: Start the Frontend Client

Open a second terminal in the project root:

```bash
cd frontend
npm run dev
```

The Vite development server will start at:
👉 **`http://localhost:3000`** (or `http://localhost:5173`)

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (grants 50 free bonus points) |
| `POST` | `/api/auth/login` | Public | Sign in and receive JWT token |
| `GET` | `/api/auth/me` | Protected | Get current authenticated user details |

### Wallet Operations (`/api/wallet`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wallet/conversion-rate` | Public | Retrieve active conversion rate (points per INR) |
| `POST` | `/api/wallet/purchase` | Protected | Purchase points with simulated payment |
| `POST` | `/api/wallet/transfer` | Protected | Transfer wallet points to another registered user |
| `GET` | `/api/wallet/transactions` | Protected | View user transaction history with filters & pagination |

### Users (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Protected | Get registered users excluding current user (searchable) |
| `GET` | `/api/users/profile` | Protected | Get user profile and aggregate wallet statistics |

### Admin Operations (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/conversion-rate` | Admin | Get current conversion rate details |
| `PUT` | `/api/admin/conversion-rate` | Admin | Update points-per-rupee conversion rate |
| `GET` | `/api/admin/stats` | Admin | Get system statistics (users, revenue, circulating points) |
| `GET` | `/api/admin/transactions` | Admin | View entire platform transaction audit ledger |
| `GET` | `/api/admin/users` | Admin | View all registered platform users and balances |

---

## 🛡️ Atomic Integrity & Concurrency

All points transfers implement conditional atomic updates on MongoDB:
```javascript
const updatedSender = await User.findOneAndUpdate(
  { _id: senderId, walletBalance: { $gte: pointsNum } },
  { $inc: { walletBalance: -pointsNum } },
  { new: true }
);
```
This guarantees that double spending or negative balances are impossible even during concurrent requests.

