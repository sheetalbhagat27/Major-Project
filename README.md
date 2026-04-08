<p align="center">
  <h1 align="center">🎓 Academic Operations and Management Portal</h1>
  <p align="center"><strong>Teacher Module</strong></p>
  <p align="center">
    Built for <strong>NavKalpana Hackathon</strong> | Team Code: <strong>RICR-NK-0067</strong>
  </p>
</p>

---

## 📌 About The Project

The **Academic Operations and Management Portal** is a comprehensive web application designed to streamline academic workflows for teachers. The **Teacher Module** provides a centralized platform for managing batches, tracking attendance, creating and evaluating assessments, monitoring student performance, and handling support requests — all through an intuitive and modern interface.

---

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js (Vite), Tailwind CSS, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT, bcrypt |
| **HTTP Client** | Axios |
| **Icons** | React Icons |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## ⚙️ Installation & Setup

### 📋 Prerequisites

- Node.js **v18+**
- MongoDB (local or Atlas)
- npm or yarn

### 🔧 Backend Setup

```bash
cd backend
npm install
```

Copy the environment file and configure it:

```bash
cp .env.example .env
```

Configure `.env` with your credentials:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Insert dummy data and start the server:

```bash
node seedData.js
node server.js
```

> Backend runs on **http://localhost:5000**

### 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> Frontend runs on **http://localhost:5173**

### 🔑 Login Credentials

| Field | Value |
|-------|-------|
| **Email** | `teacher@portal.com` |
| **Password** | `Teacher@123` |

---

## � Project Folder Structure

```
NavKalpana-RICR-NK-0067/
├── README.md
├── docs/
│   ├── api-documentation.md
│   ├── architecture-diagram.md
│   └── deployment.md
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── seedData.js
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Teacher.js
│   │   ├── Student.js
│   │   ├── Batch.js
│   │   ├── Assignment.js
│   │   ├── Quiz.js
│   │   ├── Attendance.js
│   │   └── SupportRequest.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── batchController.js
│   │   ├── attendanceController.js
│   │   ├── assessmentController.js
│   │   ├── studentController.js
│   │   └── supportController.js
│   └── routes/
│       ├── authRoutes.js
│       ├── dashboardRoutes.js
│       ├── batchRoutes.js
│       ├── attendanceRoutes.js
│       ├── assessmentRoutes.js
│       ├── studentRoutes.js
│       └── supportRoutes.js
└── frontend/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Sidebar.jsx
        │   └── TopNavbar.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── Dashboard.jsx
            ├── BatchManagement.jsx
            ├── AttendanceManagement.jsx
            ├── AssessmentManagement.jsx
            ├── StudentManagement.jsx
            └── SupportRequests.jsx
```

---

## 📡 API Endpoints

### 🔐 Auth

| Method | Endpoint | Auth |
|--------|----------|------|
| `POST` | `/api/auth/login` | No Auth |

### 📊 Dashboard

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/dashboard` | Protected |

### 📦 Batches

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/batches` | Protected |
| `POST` | `/api/batches` | Protected |
| `PUT` | `/api/batches/:id` | Protected |
| `PUT` | `/api/batches/:id/end` | Protected |

### 📋 Attendance

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/attendance/:batchId` | Protected |
| `POST` | `/api/attendance` | Protected |
| `PUT` | `/api/attendance/:id` | Protected |
| `GET` | `/api/attendance/student/:studentId` | Protected |

### 📝 Assessment — Assignments

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/assessment/assignments` | Protected |
| `POST` | `/api/assessment/assignments` | Protected |
| `PUT` | `/api/assessment/assignments/:id` | Protected |
| `POST` | `/api/assessment/assignments/:id/evaluate` | Protected |

### 📝 Assessment — Quizzes

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/assessment/quizzes` | Protected |
| `POST` | `/api/assessment/quizzes` | Protected |
| `GET` | `/api/assessment/quizzes/:id/attempts` | Protected |
| `POST` | `/api/assessment/quizzes/:id/restrict` | Protected |

### 🎓 Students

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/students` | Protected |
| `GET` | `/api/students/:id` | Protected |

### 🆘 Support

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/support` | Protected |
| `POST` | `/api/support/reply/:id` | Protected |
| `PUT` | `/api/support/resolve/:id` | Protected |
| `PUT` | `/api/support/backup/:id` | Protected |

---

## 📸 Screenshots

> 🖼️ Screenshots to be added after deployment

---

## 🚀 Deployment

| Component | Platform |
|-----------|----------|
| **Frontend** | Vercel |
| **Backend** | Render |
| **Database** | MongoDB Atlas |

> 📄 Detailed deployment steps are available in [`docs/deployment.md`](docs/deployment.md)

---

## 🔮 Future Improvements

- 🎓 Student self-service portal
- 🔔 Real-time notifications using WebSocket
- 📁 File upload for assignments using Cloudinary or S3
- 📊 Analytics dashboard with more charts
- 📧 Email notifications for deadlines
- 🔐 Role-based access for Admin, Teacher, Student
- 📱 PWA support for mobile access
- 🌗 Dark and Light theme toggle
- 🤖 AI based student performance prediction
- 📬 Automated attendance reports via email

---

<p align="center">Made with ❤️ for <strong>NavKalpana Hackathon</strong> by Team <strong>RICR-NK-0067</strong></p>
