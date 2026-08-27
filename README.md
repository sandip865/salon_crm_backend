# ✂️ Salon CRM - Backend API

> **Note**: For full project setup, architecture details, and test credentials, please see the [Main Project README](../README.md) in the root directory.

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge) ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

The core backend service for the **Salon CRM** ecosystem. It provides a robust, scalable RESTful API to manage salon operations, staff attendance, appointments, and role-based access control.

## 🚀 Features

- **Robust Authentication**: JWT-based authentication for secure access.
- **Role-Based Access Control (RBAC)**: Strict tenant isolation and middleware validation for `Super Admin`, `Owner`, and `Receptionist` roles.
- **Tenant Isolation**: Data is strictly scoped using `salonId` injected via JWT tokens.
- **Optimized Data Queries**: Highly optimized MongoDB queries (e.g., efficient appointment conflict checking).
- **Geo-fencing Ready**: Designed to handle Haversine formula-based distance validation for staff check-ins.

## 🛠️ Prerequisites

- Node.js (v18+)
- MongoDB running locally (`mongodb://127.0.0.1:27017/salon_crm`) or a MongoDB Atlas URI.

## 💻 Setup & Installation

1. **Clone and install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root of the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/salon_crm
   JWT_SECRET=your_super_secret_key
   ```

3. **Run the server**:
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```
   The API will be available at `http://localhost:5000`.

## 📁 Architecture

- `/src/routes` - Express routes mapped to controllers.
- `/src/controllers` - Business logic and request handling.
- `/src/models` - Mongoose schemas (e.g., User, Salon, Appointment).
- `/src/middleware` - Auth validation, Role checks, and Error handling.

## 📌 Development Notes

- **Super Admins** bypass standard tenant and subscription limits.
- Future implementation will include strict Geo-fencing logic inside the `/attendance` routes using exact device latitude and longitude.
