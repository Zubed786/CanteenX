![CanteenX Banner](Canteenx.png)

# 🍴 CanteenX  
> A modern full-stack **Canteen Management System** built with React, Express, and MongoDB.

![GitHub last commit](https://img.shields.io/github/last-commit/Zubed786/CanteenX)
![GitHub repo size](https://img.shields.io/github/repo-size/Zubed786/CanteenX)
![GitHub issues](https://img.shields.io/github/issues/Zubed786/CanteenX)
![GitHub license](https://img.shields.io/github/license/Zubed786/CanteenX)

---

## 🚀 Tech Stack

| Layer | Technology |
|:------|:------------|
| 🎨 **Frontend** | ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) |
| ⚙️ **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white) |
| 💾 **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white) |
| 🧩 **Tools** | ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?logo=nodemon&logoColor=white) ![Dotenv](https://img.shields.io/badge/Dotenv-000000?logo=dotenv&logoColor=white) |

---

## 📂 Project Structure

```
CanteenX/
│
├── client/                  # 🌐 Frontend (React + Vite + TypeScript)
│   ├── App.tsx
│   ├── index.tsx
│   ├── constants.ts
│   ├── types.ts
│   ├── components/
│   ├── package.json
│   └── vite.config.ts
│
├── server/                  # ⚙️ Backend (Express + MongoDB)
│   ├── index.js
│   ├── .env
│   ├── package.json
│   ├── models/
│   │   ├── User.js
│   │   └── Order.js
│   └── routes/
│       ├── userRoutes.js
│       └── orderRoutes.js
│
├── CanteenX.png
└── README.md
```

---

## 🧠 Features

✅ Static food items (from constants.ts — no DB needed)  
✅ Real **user signup/login** stored in MongoDB  
✅ **Orders** saved in MongoDB with user details  
✅ Order history fetched dynamically  
✅ Clean UI with TailwindCSS  
✅ Simple, scalable backend API  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Zubed786/CanteenX.git
cd CanteenX
```

### 2️⃣ Backend Setup
```bash
cd server
npm install
```

Create a file named **.env** inside `/server`:
```
MONGO_URI=mongodb://localhost:27017/canteenx
PORT=5000
```

Run the backend:
```bash
npm run dev
```
✅ Output:
```
✅ Connected to MongoDB (Compass)
🚀 Server running on port 5000
```

---

### 3️⃣ Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

Open the app in your browser at:
👉 [http://localhost:5173](http://localhost:5173)

---

## 🧩 API Endpoints

| Method | Endpoint | Description |
|:--|:--|:--|
| **POST** | `/api/users/signup` | Register a new user |
| **POST** | `/api/users/login` | Login existing user |
| **POST** | `/api/orders` | Place an order |
| **GET** | `/api/orders/:email` | Fetch user order history |

---

## 🧑‍💻 Author

**Zubed786**  
📧 mdzubed777@gmail.com  
🔗 [GitHub Profile](https://github.com/Zubed786)

---

## 🏁 Quick Start Summary
```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd ../client
npm install
npm run dev
```

---

> ⭐ If you like this project, give it a star on [GitHub](https://github.com/Zubed786/CanteenX)!
