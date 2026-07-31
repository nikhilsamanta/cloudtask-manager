# CloudTask Pro — Enterprise Task & Project Management Platform

CloudTask Pro is a modern, production-ready Task Management Web Application built with **React 18, Node.js/Express, MongoDB (Mongoose), and Tailwind CSS**. It features JWT authentication, role-based authorization (Admin, Manager, Employee), interactive Kanban task tracking, dashboard analytics, file attachments, and a clean 12-factor architecture designed to be easily containerized and deployed with cloud/DevOps tools.

---

## 🚀 Key Features

- **🔐 Authentication & RBAC**:
  - Secure login & registration with JWT tokens.
  - Role-based authorization (`Admin`, `Manager`, `Employee`).
  - 1-click Quick Demo login buttons on the login screen.
- **📁 Project Workspace**:
  - Create, view, edit, and filter project initiatives.
  - Team member assignment and progress indicators.
- **📋 Interactive Kanban Board**:
  - Drag-and-drop / column status movements (`To Do`, `In Progress`, `Completed`).
  - Priorities (`High` 🔴, `Medium` 🟡, `Low` 🟢), tags, due dates, comment threads, and attachment dropzones.
- **📊 Analytics Dashboard**:
  - Key Performance Metrics (Total Projects, Tasks, Completion Rate, Pending Tasks).
  - Status Doughnut Chart (Recharts) and Risk Breakdown.
  - Real-time audit trail / activity log feed.
- **📎 Attachment Engine (AWS S3 Ready)**:
  - Local file upload via `multer` with abstracted storage service layer ready for zero-code migration to AWS S3.
- **🎨 Modern UI**:
  - Glassmorphism design system with full Light & Dark mode support.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios
- **Backend**: Node.js, Express.js, Mongoose, JWT, BcryptJS, Multer, Helmet, Morgan
- **Database**: MongoDB (Local instance or MongoDB Atlas)

---

## 💻 Local Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 1. Run Backend Server
```bash
cd backend
npm install
npm run seed  # Seed initial demo data
npm run dev   # Runs Express API on http://localhost:5000
```

### 2. Run Frontend Application
```bash
cd frontend
npm install
npm run dev   # Runs React Vite app on http://localhost:5173
```

---

## 👤 Quick Demo Accounts

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** 👑 | `admin@cloudtask.com` | `password123` | Full access across all projects, users, and deletion rights |
| **Manager** 💼 | `manager@cloudtask.com` | `password123` | Create/edit projects, create/assign tasks, view analytics |
| **Employee** 👤 | `employee@cloudtask.com` | `password123` | View assigned projects, move Kanban tasks, add comments & files |
