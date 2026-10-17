<div align="center">

<img src="https://img.shields.io/badge/-StaffSync-1E3A5F?style=for-the-badge&logoColor=white" height="60" alt="StaffSync Logo" />

# 🏢 StaffSync — Modern Human Resource Management Solution

**A complete, production-ready HR Management System built with the MERN Stack**  
*Manage your entire workforce — employees, attendance, leaves, trainings, and reports — all from one beautiful dashboard.*

<br/>

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-2ECC71?style=for-the-badge)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)]()

<br/>

[🚀 Live Demo](#-getting-started) • [📖 Features](#-features) • [🛠️ Installation](#-installation) • [📸 Screenshots](#-screenshots) • [🔐 Credentials](#-demo-credentials)

</div>

---

## 🌟 What is StaffSync?

**StaffSync** is a full-featured Human Resource Management System that helps organizations manage their entire workforce digitally. From the moment an employee joins to their daily attendance, leave requests, training programs, and performance analytics — StaffSync handles it all.

> Built as a complete MERN Stack application with **role-based access control**, **real-time analytics**, **dark mode**, and a clean, intuitive UI that works for HR teams of all sizes.

---

## ✨ Features

### 🎭 Three-Role System
StaffSync has dedicated dashboards and permissions for three types of users:

| 👤 Employee | 👔 Manager | 🧑‍💼 HR Admin |
|:-----------:|:----------:|:------------:|
| View own profile & info | View team attendance | Manage all employees |
| Apply for leave | Approve / Reject leaves | Add & remove managers |
| Daily check-in / check-out | Manage team members | Mark attendance manually |
| View announcements | Create training programs | Post announcements |
| Enroll in trainings | View team analytics | Full HR analytics & reports |

### 🔑 Core Modules

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | Secure JWT login with role detection and auto-redirect |
| 👥 **Employee Management** | Add, edit, view, deactivate, or permanently delete employees |
| 🏢 **Manager Management** | Manage departmental heads, assign team members |
| 📅 **Attendance Tracking** | Daily check-in/check-out with HR manual override |
| 🌴 **Leave Management** | Apply, approve, reject, cancel leaves with balance tracking |
| 📢 **Announcements** | Company-wide posts with pin support and category tags |
| 🎓 **Training Programs** | Create sessions, enroll employees, track status |
| 📊 **Reports & Analytics** | Live charts — attendance trends, leave breakdown, headcount |
| 🔔 **Notifications** | In-app alerts for leave decisions, new announcements |
| 🌙 **Dark Mode** | Full light / dark theme toggle, saved per user |

---

## 📸 Screenshots

> *Login to the live demo to explore all views*

### 🖥️ HR Dashboard
Clean overview of total employees, today's attendance, pending leaves, and quick analytics.

### 📊 Reports & Analytics
Real-time bar and pie charts showing monthly attendance trends, leave category breakdown, and department headcount — all powered by live data from MongoDB.

### 🌴 Leave Management
Full leave request flow — employees apply, managers review, HR has final control. Leave balances update automatically on approval.

### 🌙 Dark Mode
One click — every page, table, modal, and form switches to a clean dark theme.

---

## 🛠️ Tech Stack

### Backend
```
Node.js + Express.js   →  REST API server
MongoDB + Mongoose     →  Database & schema modeling
JWT (jsonwebtoken)     →  Authentication tokens
bcryptjs               →  Password hashing (12 salt rounds)
Multer v2              →  Profile photo uploads
express-rate-limit     →  Brute-force protection on auth routes
Morgan                 →  HTTP request logging
```

### Frontend
```
React 18 + Vite        →  Fast, modern UI
Redux Toolkit          →  Centralized state management
React Router v6        →  Client-side routing with guards
Bootstrap 5            →  Responsive layout & components
Recharts v3            →  Beautiful data visualizations
Axios                  →  HTTP client with interceptors
Formik + Yup           →  Forms & validation
React Toastify         →  User-friendly toast messages
React Icons            →  Icon library
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string
- npm

---

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Ayush0818/The-StaffSync---Modern-Human-Resource-Management-Solution.git
cd The-StaffSync---Modern-Human-Resource-Management-Solution
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/staffsync
JWT_SECRET=staffsync_super_secret_jwt_key_2024_hrm
JWT_EXPIRE=1d
CLIENT_URL=http://localhost:5173
```

### 3. Seed the Database

```bash
npm run seed
```

This will create:
- ✅ 1 HR Admin account
- ✅ 2 Manager accounts with departments
- ✅ 5 Employee accounts
- ✅ 7 days of sample attendance records
- ✅ Sample announcements and training programs

### 4. Start the Backend

```bash
npm run dev
```

> Backend runs on → `http://localhost:5000`

### 5. Setup the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

> Frontend runs on → `http://localhost:5173`

### 6. Open in your browser

```
http://localhost:5173
```

---

## 🔐 Demo Credentials

Use these accounts to explore the system:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 🧑‍💼 **HR Admin** | `hr@staffsync.com` | `hr123456` | Full system access |
| 👔 **Manager 1** | `manager@staffsync.com` | `mgr123456` | Team & leaves |
| 👔 **Manager 2** | `manager2@staffsync.com` | `mgr123456` | Team & leaves |
| 👤 **Employee** | `alice@staffsync.com` | `emp123456` | Own profile & leaves |
| 👤 **Employee** | `bob@staffsync.com` | `emp123456` | Own profile & leaves |
| 👤 **Employee** | `charlie@staffsync.com` | `emp123456` | Own profile & leaves |

---

## 🗂️ Project Structure

```
staffsync/
│
├── backend/                        # Express.js REST API
│   ├── config/db.js                # MongoDB connection
│   ├── controllers/                # Route handlers & business logic
│   ├── middleware/                 # Auth, RBAC, error handling, uploads
│   ├── models/                     # Mongoose schemas (8 models)
│   ├── routes/                     # Express routers (8 route files)
│   ├── utils/                      # Token generator, notifications, seeder
│   ├── .env                        # Environment config (not pushed to git)
│   └── server.js                   # App entry point
│
└── frontend/                       # React + Vite app
    └── src/
        ├── api/axiosConfig.js      # Axios instance with auth interceptors
        ├── components/common/      # Reusable: Table, Card, Modal, Topbar, Sidebar
        ├── context/ThemeContext.jsx # Dark mode state
        ├── pages/
        │   ├── auth/               # Login, Unauthorized
        │   ├── employee/           # 6 employee pages
        │   ├── manager/            # 5 manager pages
        │   └── hr/                 # 8 HR admin pages
        ├── redux/slices/           # 8 Redux slices (auth, employees, leaves...)
        ├── routes/                 # Protected routes with role guards
        └── utils/                  # Date helpers, error messages, constants
```

---

## 🔒 Security

- 🔑 **JWT Tokens** — Expire after 1 day; attached to every request via Axios interceptor
- 🔐 **bcrypt Hashing** — Passwords hashed with 12 salt rounds, never stored plain
- 🛡️ **Role-Based Access Control** — 3 roles with separate permissions on every route
- 🚧 **Protected Routes** — Both frontend (React Router guards) and backend (Express middleware)
- ⏱️ **Rate Limiting** — 100 requests per 15 minutes on `/api/auth` to prevent brute force
- 🌐 **CORS** — Configured to allow only the client origin
- 💬 **Human-Readable Errors** — All API errors mapped to friendly user messages

---

## 📊 Database Schema Overview

```
User ──────────────── Employee (1:1)
              └────── Manager  (1:1)

Manager ──── [ Employee, Employee, ... ]   (teamMembers)

Employee ──── [ Attendance records ]        (daily, unique per day)
         ──── [ Leave requests ]            (with balance deduction)

User ─────── [ Notifications ]              (indexed for fast reads)
```

### Leave Balance Per Employee Per Year

| Leave Type | Days |
|-----------|------|
| 🟢 Casual | 12 days |
| 🟡 Sick | 10 days |
| 🔵 Earned | 15 days |
| ⚪ Unpaid | Unlimited |

---

## 🌙 Dark Mode Support

StaffSync ships with a **full dark mode** across every page:
- Toggle with the 🌙 / ☀️ button in the top navigation bar
- Preference is saved in `localStorage` — persists across sessions
- Covers: cards, tables, modals, forms, dropdowns, sidebar, topbar

---

## 🤝 Contributing

Contributions are always welcome!

```bash
# 1. Fork the project
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m "Add: some amazing feature"

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 👨‍💻 Author

**Ayush** — [@Ayush0818](https://github.com/Ayush0818)

> ⭐ If you found this project useful, please give it a star! It helps others discover it.

---

<div align="center">

**Built with ❤️ using MongoDB · Express · React · Node.js**

</div>
