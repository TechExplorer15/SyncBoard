<div align="center">
  <img src="https://via.placeholder.com/150/4F46E5/FFFFFF?text=SyncBoard" alt="SyncBoard Logo" width="120" height="120" style="border-radius: 20px;" />
  
  # SyncBoard 📋🚀
  
  **A highly scalable, real-time Kanban board workspace**
  
  [![CI Pipeline](https://github.com/TechExplorer15/SyncBoard/actions/workflows/ci.yml/badge.svg)](https://github.com/TechExplorer15/SyncBoard/actions/workflows/ci.yml)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](#)
  [![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](#)
  [![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis&logoColor=white)](#)
</div>

<br />

SyncBoard is a production-ready Kanban application (similar to Trello or Linear) built with the MERN stack and Redis. It is engineered from the ground up for massive scalability and collaborative speed, featuring fractional indexing, Redis-backed WebSocket syncing, and an ultra-premium glassmorphism UI.

## ✨ Key Features

- **⚡ Real-Time Multiplayer:** Drag and drop cards seamlessly. Changes reflect instantly for all connected users in the workspace via optimized Socket.io events.
- **🧠 Fractional Indexing:** Powered by mathematical lexicographical sorting strings. Reorder thousands of cards without causing cascading database writes.
- **👀 Live Presence:** See real-time avatars of team members currently viewing the same board. Powered by a highly-efficient Redis Sorted Set implementation.
- **🎨 Premium SaaS UI:** A stunning, fully bespoke interface utilizing glassmorphism (`backdrop-blur`), subtle gradient borders, smooth hover lifting, and Lucide React iconography.
- **🔒 Granular RBAC:** Secure Workspace isolation. Users are assigned strict `admin`, `member`, or `viewer` roles, rigorously enforced by backend middleware.
- **🛡️ Enterprise Security:** Battle-hardened against IDOR (WebSocket level authorization), XSS, NoSQL Injection (Zod validation), and Brute-Force attacks (Proxy-trusted rate limiting).

---

## 🏗️ Tech Stack

### Frontend (Client)
* **Framework:** React 18 + TypeScript + Vite
* **State Management:** Redux Toolkit
* **Styling:** TailwindCSS + `tailwindcss-animate`
* **Interactions:** `@hello-pangea/dnd` (Drag and Drop)
* **Icons:** `lucide-react`

### Backend (Server)
* **Runtime & Framework:** Node.js + Express.js
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Real-time Engine:** Socket.io (with `@socket.io/redis-adapter`)
* **Caching & Pub/Sub:** Upstash Redis Serverless
* **Auth & Security:** JWT (HttpOnly Cookies), Helmet, `express-rate-limit`, Zod validation

---

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
Navigate into the server directory and install dependencies:
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
Open a new terminal, navigate to the client, and install dependencies:
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

**That's it!** Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Testing & CI/CD

This repository enforces strict code quality via **GitHub Actions**. Every push to `main` triggers an automated workflow that runs:
1. **Frontend Type-Checking:** Validates all TypeScript interfaces and Redux slices.
2. **Backend Integration Tests:** Runs a comprehensive Jest suite covering authentication, RBAC restrictions, CRUD operations, and fractional index card reordering algorithms.

To run the tests locally:
```bash
cd server
npm run test
```

## 📜 License

This project is open-source and available under the MIT License.
