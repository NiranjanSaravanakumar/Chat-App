# 💬 Real-Time Chat Application (MEAN Stack)

A full-stack real-time chat application built using the MEAN Stack (MongoDB, Express, Angular, Node.js) with Socket.IO for live communication.

This project demonstrates real-world backend architecture, authentication, real-time systems, and database integration.

---

## 🚀 Features

✅ User Registration & Login  
✅ Secure Authentication (JWT + bcrypt)  
✅ Real-time Messaging (Socket.IO)  
✅ Private Chat between users  
✅ Online / Offline User Status  
✅ Typing Indicators  
✅ Persistent Message History (MongoDB)  
✅ REST API Architecture  
✅ Responsive Angular UI  

---

## 🏗️ Tech Stack

### 🔹 Frontend
- Angular 19 (Standalone Components)
- TypeScript
- RxJS
- Angular Router
- Socket.IO Client

### 🔹 Backend
- Node.js
- Express.js
- Socket.IO
- JWT (Authentication)
- bcryptjs (Password hashing)

### 🔹 Database
- MongoDB (Mongoose ODM)

---

## 📂 Project Structure

```
chat-app/
│
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── message.controller.js
│   ├── models/
│   │   ├── User.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── message.routes.js
│   │   └── user.routes.js
│   ├── middleware/auth.middleware.js
│   ├── sockets/chat.socket.js
│   └── server.js
│
├── frontend/
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── chat/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── chat.service.ts
│   │   │   └── socket.service.ts
│   │   ├── guards/auth.guard.ts
│   │   ├── interceptors/auth.interceptor.ts
│   │   └── models/
│   │       ├── user.model.ts
│   │       └── message.model.ts
│   └── angular.json
│
└── README.md
```

---

## 🔐 Authentication Flow

1. User registers with username, email & password
2. Password is hashed using bcrypt (12 salt rounds)
3. JWT token is generated on login
4. Token is stored in localStorage
5. Protected routes verified using Angular Guards + JWT middleware
6. HTTP Interceptor auto-attaches Bearer token to all API requests

---

## 🔄 Real-Time Messaging Architecture

```
Client (Angular)
        ↓
Socket.IO Client
        ↓
Node.js + Express Server
        ↓
Socket.IO Server
        ↓
MongoDB (Message Storage)
```

---

## 🗃️ Database Schema

### User Model
- `username` — unique, 3-30 chars
- `email` — unique, validated format
- `password` — hashed with bcrypt
- `isOnline` — boolean
- `createdAt` / `updatedAt` — timestamps

### Message Model
- `senderId` — ref to User
- `receiverId` — ref to User
- `message` — text content (max 2000 chars)
- `createdAt` — timestamp
- Compound index on `(senderId, receiverId, createdAt)` for fast retrieval

---

## 🧠 DSA & Backend Concepts Used

- **HashMap** → Active user session tracking (`Map<userId, socketId>`)
- **Indexing** → Compound index for faster message retrieval
- **Middleware Pattern** → JWT verification middleware
- **MVC Architecture** → Controllers, Models, Routes separation
- **Event-driven programming** → Socket.IO events
- **Observer Pattern** → RxJS Observables in Angular services

---

## 📋 Requirements

Before running this project, make sure you have the following installed on your machine:

| Tool | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | v18+ (LTS recommended) | Backend runtime |
| npm | v9+ (comes with Node.js) | Package manager |
| [Angular CLI](https://angular.io/cli) | v17+ | Frontend dev server & build |
| [Git](https://git-scm.com/) | Any recent version | Clone the repository |
| MongoDB Atlas Account | — | Cloud database (free tier works) |

### ✅ Verify Your Setup

Run these commands in your terminal to confirm everything is installed:

```bash
node -v        # Should print v18.x.x or higher
npm -v         # Should print v9.x.x or higher
ng version     # Should print Angular CLI version
git --version  # Should print git version
```

> **Note:** If `ng` is not found, install Angular CLI globally:
> ```bash
> npm install -g @angular/cli
> ```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `/backend`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

Start the server:

```bash
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
ng serve
```

App runs at: `http://localhost:4200`

---

## 🌍 Future Improvements

- Group Chats
- File Sharing
- Message Reactions
- Read Receipts
- End-to-End Encryption
- Docker Deployment
- CI/CD Pipeline
- Cloud Deployment (AWS / Render / Vercel)

---

## 🎯 Learning Outcomes

- Full-stack development with MEAN
- Real-time communication systems
- Secure authentication (JWT + bcrypt)
- RESTful API design
- Database schema design with Mongoose
- Production-ready project structuring
- Angular standalone components & signals

---

## 📸 Screenshots

*(Add UI screenshots here)*

---

## 🧪 Deployment (Optional)

| Layer    | Platform Options          |
|----------|--------------------------|
| Backend  | Render / Railway          |
| Frontend | Vercel / Netlify          |
| Database | MongoDB Atlas (Free Tier) |

---

## 👨‍💻 Author

**Lucky**  
Full-Stack Developer | DSA Enthusiast

Built as an intermediate-level real-world system design project.
