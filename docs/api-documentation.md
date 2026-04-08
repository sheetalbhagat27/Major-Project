# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST `/auth/login`
Login with teacher credentials.

**Request Body:**
```json
{
  "email": "teacher@portal.com",
  "password": "Teacher@123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGci...",
  "teacher": {
    "_id": "...",
    "name": "Prof. Sharma",
    "email": "teacher@portal.com",
    "designation": "Senior Faculty",
    "role": "teacher"
  }
}
```

---

## Dashboard

### GET `/dashboard` 🔒
Returns aggregated KPI data.

**Response:**
```json
{
  "totalStudents": 10,
  "activeCourses": 1,
  "pendingAssignments": 3,
  "upcomingDeadlines": [...],
  "averageClassPerformance": 72
}
```

---

## Batches

### GET `/batches` 🔒
Returns all batches with populated student refs.

### POST `/batches` 🔒
Create a new batch.

**Request Body:**
```json
{
  "batchName": "React Batch",
  "batchType": "Regular",
  "totalStudents": 25,
  "status": "Upcoming",
  "startDate": "2026-03-01",
  "endDate": "2026-06-01"
}
```

### PUT `/batches/:id` 🔒
Update batch fields.

### PUT `/batches/:id/end` 🔒
Set batch status to Completed (progress → 100%).

---

## Attendance

### GET `/attendance/:batchId` 🔒
Get all attendance records for a batch.

### POST `/attendance` 🔒
Submit attendance. **Remark is required** (returns 400 if missing).

**Request Body:**
```json
{
  "batchId": "...",
  "date": "2026-02-19",
  "remark": "Chapter 5 lecture",
  "records": [
    { "studentId": "...", "status": "Present" },
    { "studentId": "...", "status": "Absent" }
  ]
}
```

### PUT `/attendance/:id` 🔒
Edit attendance. Returns **403** if editing window (10 min) has passed.

### GET `/attendance/student/:studentId` 🔒
Get attendance history for a specific student.

---

## Assessments

### Assignments
- **GET** `/assessment/assignments` 🔒 — List all
- **POST** `/assessment/assignments` 🔒 — Create
- **PUT** `/assessment/assignments/:id` 🔒 — Update
- **POST** `/assessment/assignments/:id/evaluate` 🔒 — Evaluate submission

**Evaluate Body:**
```json
{
  "studentId": "...",
  "marks": 85,
  "feedback": "Great work!"
}
```

### Quizzes
- **GET** `/assessment/quizzes` 🔒 — List all
- **POST** `/assessment/quizzes` 🔒 — Create with MCQ questions
- **GET** `/assessment/quizzes/:id/attempts` 🔒 — View attempts
- **POST** `/assessment/quizzes/:id/restrict` 🔒 — Update attempt limit

---

## Students

### GET `/students` 🔒
Query params: `name`, `enrollmentId`, `email`, `course`, `status`

### GET `/students/:id` 🔒
Returns full detail: student info, attendance records, assignment submissions, quiz attempts, progress percentage.

---

## Support Requests

### GET `/support` 🔒
Query params: `course`, `status`

### POST `/support/reply/:id` 🔒
Reply to a support request.

### PUT `/support/resolve/:id` 🔒
Mark as Resolved.

### PUT `/support/backup/:id` 🔒
Schedule a backup class.

**Request Body:**
```json
{
  "backupClassDate": "2026-02-25"
}
```
