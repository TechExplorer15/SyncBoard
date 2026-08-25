# SyncBoard 📋🚀

SyncBoard is a highly scalable, real-time Kanban board application (similar to Trello or Jira) built with the MERN stack and Redis. It features optimistic UI updates, fractional indexing for infinite drag-and-drop scalability, role-based access control, and a real-time presence system to see who is currently viewing a board.

## ✨ Features

- **Real-Time Kanban Boards**: Drag and drop cards seamlessly. Changes reflect instantly for all connected users via WebSockets (Socket.io).
- **Optimistic UI & Fractional Indexing**: Drag-and-drop operations use mathematical fractional strings (lexicographical sorting) to order cards without rewriting the database. The client updates instantly and syncs asynchronously.
- **Real-Time Presence**: See live avatars of team members currently viewing the board, powered by a highly optimized Redis Sorted Set implementation.
- **Role-Based Access Control (RBAC)**: Secure Workspace isolation. Users can be `admin`, `member`, or `viewer` with granular permissions.
- **Robust Security**: Protected against IDOR, XSS, NoSQL Injection, and Brute-Force attacks. Configured securely behind load balancers with rate limiting.

## 🏗️ Architecture

- **Frontend**: React, TypeScript, Redux Toolkit, TailwindCSS, Vite, `@hello-pangea/dnd`.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io.
- **Real-Time Data**: Upstash Redis (Socket.io adapter & Presence system).
- **Security**: JWT (HttpOnly cookies for refresh tokens), Helmet, express-rate-limit.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Upstash Redis account (or local Redis)

### 1. Clone the repository

```bash
git clone https://github.com/TechExplorer15/SyncBoard.git
cd SyncBoard
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/syncboard
REDIS_URL=rediss://default:<token>@<upstash-url>:6379
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
```

Start the backend development server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Visit the Application
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠️ Testing

The backend contains a comprehensive suite of integration tests covering authentication, RBAC, CRUD operations, and fractional index card reordering.

```bash
cd server
npm run test
```

## 📜 License

This project is open-source and available under the MIT License.
