# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           React.js + Vite + Tailwind CSS        │   │
│  │                                                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │  Pages   │  │Components│  │  AuthContext  │  │   │
│  │  │          │  │          │  │              │  │   │
│  │  │Dashboard │  │ Sidebar  │  │ JWT Token    │  │   │
│  │  │Batches   │  │ TopNavbar │  │ Login/Logout │  │   │
│  │  │Attendance│  │          │  │              │  │   │
│  │  │Assessment│  └──────────┘  └──────────────┘  │   │
│  │  │Students  │                                    │   │
│  │  │Support   │         Axios HTTP Client          │   │
│  │  │Login     │              │                     │   │
│  │  └──────────┘              │                     │   │
│  └────────────────────────────┼─────────────────────┘   │
│                               │                         │
└───────────────────────────────┼─────────────────────────┘
                                │ REST API (Port 5173→5000)
                                ▼
┌─────────────────────────────────────────────────────────┐
│                    SERVER (Node.js)                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Express.js (Port 5000)              │   │
│  │                                                  │   │
│  │  Middleware: CORS, JSON Parser, JWT Auth          │   │
│  │                                                  │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │              Route Layer                  │   │   │
│  │  │                                          │   │   │
│  │  │ /api/auth    → authRoutes                │   │   │
│  │  │ /api/dashboard → dashboardRoutes         │   │   │
│  │  │ /api/batches → batchRoutes               │   │   │
│  │  │ /api/attendance → attendanceRoutes       │   │   │
│  │  │ /api/assessment → assessmentRoutes       │   │   │
│  │  │ /api/students → studentRoutes            │   │   │
│  │  │ /api/support → supportRoutes             │   │   │
│  │  └──────────────┬───────────────────────────┘   │   │
│  │                 │                                │   │
│  │  ┌──────────────▼───────────────────────────┐   │   │
│  │  │           Controller Layer                │   │   │
│  │  │                                          │   │   │
│  │  │ authController    dashboardController     │   │   │
│  │  │ batchController   attendanceController    │   │   │
│  │  │ assessmentController  studentController   │   │   │
│  │  │ supportController                         │   │   │
│  │  └──────────────┬───────────────────────────┘   │   │
│  │                 │                                │   │
│  │  ┌──────────────▼───────────────────────────┐   │   │
│  │  │            Model Layer (Mongoose)         │   │   │
│  │  │                                          │   │   │
│  │  │ Teacher  Student  Batch  Assignment       │   │   │
│  │  │ Quiz  Attendance  SupportRequest          │   │   │
│  │  └──────────────┬───────────────────────────┘   │   │
│  │                 │                                │   │
│  └─────────────────┼────────────────────────────────┘   │
│                    │                                     │
└────────────────────┼─────────────────────────────────────┘
                     │ Mongoose Connection
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   MongoDB Database                       │
│                                                         │
│  Collections:                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ teachers │ │ students │ │ batches  │ │assignments│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ quizzes  │ │ attendances  │ │ supportrequests  │  │
│  └──────────┘ └──────────────┘ └──────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
1. Teacher enters email + password
2. POST /api/auth/login
3. Server validates credentials (bcrypt compare)
4. Server generates JWT token (24h expiry)
5. Token stored in localStorage
6. All subsequent API calls include: Authorization: Bearer <token>
7. Auth middleware verifies token on protected routes
8. Logout clears token from localStorage
```

## Data Flow

```
User Action → React Component → Axios API Call → Express Route
→ Auth Middleware → Controller → Mongoose Model → MongoDB
→ Response → Update React State → Re-render UI
```
