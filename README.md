# 🧑‍💼 StaffSync — Human Resource Management System

<div align="center">

![StaffSync Banner](https://img.shields.io/badge/StaffSync-HRM%20System-1E3A5F?style=for-the-badge&logo=users&logoColor=white)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-2ECC71?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-F39C12?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

A full-stack **Human Resource Management System** built with the **MERN Stack** — MongoDB, Express.js, React.js, and Node.js. Manage employees, attendance, leaves, announcements, and trainings — all in one place.

</div>

---

## ✨ Features

### 👤 Role-Based Access (3 Roles)
| Feature | Employee | Manager | HR Admin |
|---------|----------|---------|----------|
| View own profile | ✅ | ✅ | ✅ |
| Apply for leave | ✅ | ❌ | ❌ |
| Check in / Check out | ✅ | ❌ | ❌ |
| View team attendance | ❌ | ✅ | ✅ |
| Approve / Reject leaves | ❌ | ✅ | ✅ |
| Add / Remove employees | ❌ | ❌ | ✅ |
| Create announcements | ❌ | ❌ | ✅ |
| View HR analytics & reports | ❌ | ❌ | ✅ |

### 🔑 Core Modules
- **Authentication** — JWT-based login with role-based protected routes
- **Employee Management** — Add, edit, deactivate, or permanently delete employees
- **Manager Management** — Manage departmental managers and their teams
- **Attendance Tracking** — Daily check-in/check-out with manual HR override
- **Leave Management** — Apply, approve, reject, and cancel leave requests with balance tracking
- **Announcements** — Company-wide posts with pinning and category tags
- **Training Programs** — Create sessions and manage employee enrollment
- **Reports & Analytics** — Live charts for attendance trends, leave breakdown, and headcount
- **Notifications** — In-app notification system for leave updates and announcements
- **Dark Mode** — Full light/dark toggle with localStorage persistence

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express.js** | REST API framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB schemas |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing (12 salt rounds) |
| **Multer v2** | File uploads (profile photos) |
| **Morgan** | HTTP request logging |
| **express-rate-limit** | API rate limiting |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI component library |
| **Vite** | Frontend build tool |
| **Redux Toolkit** | Global state management |
| **React Router v6** | Client-side routing |
| **Bootstrap 5** | UI styling framework |
| **Recharts v3** | Data visualization charts |
| **Axios** | HTTP client with interceptors |
| **Formik + Yup** | Form handling & validation |
| **React Toastify** | Toast notifications |
| **React Icons** | Icon library |

---

## 📁 Project Structure

```
staffsync/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/               # Business logic handlers
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── managerController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── announcementController.js
│   │   ├── trainingController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── roleMiddleware.js      # Role-based access control
│   │   ├── errorHandler.js        # Centralized error handler
│   │   └── uploadMiddleware.js    # Multer file upload config
│   ├── models/                    # Mongoose schemas
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Manager.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   ├── Announcement.js
│   │   ├── Training.js
│   │   └── Notification.js
│   ├── routes/                    # Express route definitions
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── sendNotification.js
│   │   └── seeder.js              # Database seed script
│   ├── .env                       # Environment variables
│   └── server.js                  # App entry point
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axiosConfig.js     # Axios instance + interceptors
    │   ├── components/common/     # Reusable UI components
    │   ├── context/
    │   │   └── ThemeContext.jsx   # Dark mode provider
    │   ├── pages/
    │   │   ├── auth/              # Login, Unauthorized
    │   │   ├── employee/          # Employee-facing pages
    │   │   ├── manager/           # Manager-facing pages
    │   │   └── hr/                # HR admin pages
    │   ├── redux/
    │   │   ├── store.js
    │   │   └── slices/            # 8 Redux slices
    │   ├── routes/
    │   │   ├── AppRoutes.jsx      # All app routes
    │   │   └── ProtectedRoute.jsx # Auth + role guard
    │   └── utils/
    │       ├── formatDate.js      # Date helpers + getFullName()
    │       ├── errorMessages.js   # Human-readable API errors
    │       └── constants.js       # App-wide constants
    └── vite.config.js             # Vite + API proxy config
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) (local installation or Atlas cloud)
- npm

### 1. Clone the repository
```bash
git clone https://github.com/your-username/staffsync.git
cd staffsync
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
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

This creates demo users, employees, managers, attendance records, announcements, and training programs.

### 4. Start the Backend Server
```bash
npm run dev     # Development with nodemon (auto-restart)
# or
npm start       # Production
```

Backend runs on `http://localhost:5000`

### 5. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 6. Open in Browser
```
http://localhost:5173
```

---

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **HR Admin** | hr@staffsync.com | hr123456 |
| **Manager 1** | manager@staffsync.com | mgr123456 |
| **Manager 2** | manager2@staffsync.com | mgr123456 |
| **Employee** | alice@staffsync.com | emp123456 |
| **Employee** | bob@staffsync.com | emp123456 |
| **Employee** | charlie@staffsync.com | emp123456 |

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | HR only | Register new employee or manager |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |
| `GET` | `/api/auth/me` | Private | Get current user profile |
| `PUT` | `/api/auth/change-password` | Private | Update password |

### Employees
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/employees` | HR, Manager | List all employees (with filters) |
| `GET` | `/api/employees/:id` | Private | Get single employee |
| `PUT` | `/api/employees/:id` | HR, Self | Update employee profile |
| `DELETE` | `/api/employees/:id` | HR | Deactivate employee (soft delete) |
| `DELETE` | `/api/employees/:id/permanent` | HR | Permanently delete employee |

### Attendance
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/attendance/checkin` | Employee | Daily check-in |
| `PUT` | `/api/attendance/checkout` | Employee | Daily check-out |
| `GET` | `/api/attendance/my` | Employee | Personal attendance history |
| `GET` | `/api/attendance/all` | HR, Manager | All attendance records |
| `PUT` | `/api/attendance/mark` | HR | Manually record attendance |
| `GET` | `/api/attendance/summary` | HR, Manager | Attendance count summary |

### Leaves
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/leaves/apply` | Employee | Submit leave request |
| `GET` | `/api/leaves/my` | Employee | Personal leave history |
| `GET` | `/api/leaves/balance` | Employee | Remaining leave balance |
| `GET` | `/api/leaves` | HR, Manager | All leave requests |
| `GET` | `/api/leaves/pending` | HR, Manager | Pending leave requests |
| `PUT` | `/api/leaves/:id/approve` | HR, Manager | Approve leave |
| `PUT` | `/api/leaves/:id/reject` | HR, Manager | Reject leave with comments |
| `DELETE` | `/api/leaves/:id` | Employee | Cancel own leave |

### Announcements, Trainings, Notifications
> Full API list available in `PROJECT_EXPLANATION.txt`

---

## 🗄️ Database Design

```
Users ──────── Employee (1:1)  userId ref
         └──── Manager  (1:1)  userId ref

Manager ──── Employee[] (teamMembers array)

Employee ──── Attendance[] (compound index: employeeId + date)
         ──── Leave[]      (leave requests)

User ──── Notification[] (in-app alerts)
```

### Leave Balance per Employee
| Type | Days/Year |
|------|-----------|
| 🟢 Casual | 12 |
| 🟡 Sick | 10 |
| 🔵 Earned | 15 |
| ⚪ Unpaid | Unlimited |

---

## 🔒 Security

- **JWT Tokens** — Signed with secret key, expire after 1 day
- **Password Hashing** — bcrypt with 12 salt rounds (never stored in plain text)
- **Role-Based Access Control (RBAC)** — Three roles: `employee`, `manager`, `hr`
- **Protected Routes** — Both frontend (React Router) and backend (Express middleware)
- **Rate Limiting** — 100 requests per 15 minutes on auth routes
- **CORS** — Configured to allow only the client origin
- **Human-Readable Errors** — API errors mapped to user-friendly messages

---

## 🌙 Dark Mode

Click the **🌙 moon icon** in the top navigation bar to toggle dark mode. Your preference is saved in `localStorage` and applied instantly on every visit — no flicker.

---

## 📊 Reports & Analytics

The Reports page shows **live data** from the database:

- 📈 **Monthly Attendance Trends** — Bar chart for last 6 months (Present / Absent / Late)
- 🍩 **Leave Category Breakdown** — Pie chart by leave type
- 🏢 **Headcount by Department** — Bar chart of employee distribution
- 📊 **KPI Cards** — Total workforce, attendance rate, total leave applications

---

## 🤝 Contributing

1. Fork the project
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add: your feature description"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍🎓 About

**StaffSync** was built as a college project to demonstrate full-stack MERN development skills:

- ✅ RESTful API design with Express.js
- ✅ JWT authentication & role-based access control
- ✅ Redux Toolkit for predictable state management
- ✅ Responsive UI with Bootstrap 5 + custom CSS variables
- ✅ MongoDB schema design with Mongoose
- ✅ Real-time-like notifications
- ✅ Dark mode support

---

<div align="center">

**Made with ❤️ using the MERN Stack**

</div>
