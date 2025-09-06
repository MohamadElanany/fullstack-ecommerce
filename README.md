
# Fullstack E-commerce App

## About
A full-stack e-commerce application built with **Node.js (Express)** for the backend, **Angular** for the frontend, and **MongoDB** for the database.  
It provides a complete online shopping experience including:

- **User Authentication** (Register, Login, JWT Security)
- **Product Management** (CRUD for Admins)
- **Shopping Cart & Checkout System**
- **Order Management** for users and admins
- **Admin Dashboard** for managing users, products, and orders
- **Contact System** between users and admin for inquiries and support
- **Sales Reports** for admin analytics
- **Customer Testimonials**: Users can submit reviews; admin approves or rejects them


---

## 📂 Project Structure
```
/E-commerce
  ├── E-backend     # Backend code (Express)
  └── E-frontend    # Frontend code (Angular)
```

---

## 🚀 Run the Project Locally

### 1️⃣ Backend (Express)
1. Navigate to the backend folder:
   ```bash
   cd E-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following values:
   ```env
   PORT=4000
   MONGO_URI=your_mongo_db_uri
   JWT_SECRET=your_jwt_secret
   UPLOAD_DIR=uploads
   ```
4. Start the server:
   ```bash
   npm start
   ```
   Runs on: `http://localhost:4000`

---

### 2️⃣ Frontend (Angular)
1. Navigate to the frontend folder:
   ```bash
   cd E-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular app:
   ```bash
   ng serve
   ```
   Runs on: `http://localhost:4200`

---

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js, MongoDB, JWT, Multer
- **Frontend**: Angular, TypeScript, RxJS, SCSS, CSS
- **Tools**: Postman, Git, GitHub

---

## 🔗 Main API Endpoints

| Method  | Endpoint                   | Description                | Auth Required   |
|---------|-----------------------------|----------------------------|-----------------|
| POST    | /api/auth/register          | Register a new user         | No              |
| POST    | /api/auth/login             | Login user                  | No              |
| GET     | /api/auth/me                | Get current user data        | Yes             |
| GET     | /api/products               | Get all products            | No              |
| POST    | /api/cart/add               | Add product to cart         | Yes             |
| GET     | /api/orders                 | Get user orders             | Yes             |
| GET     | /api/admin/users            | Manage users (Admin only)   | Admin            |

---

## 🧪 API Testing
A Postman collection is included in the project for easy API testing.

---

## 📦 Build for Production
### Backend
```bash
npm run build
```

### Frontend
```bash
ng build --prod
```

---

## 👨‍💻 Author
Developed by Mohamed Ibrahim.
