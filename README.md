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
| 🧩 **Other Tools** | ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?logo=nodemon&logoColor=white) ![Git](https://img.shields.io/badge/Git-F05033?logo=git&logoColor=white) |

---

## 📂 Project Structure

```text
CANTEENX/
├── client/               # React + Vite frontend
├── server/               # Express + MongoDB backend
├── .gitignore
├── package-lock.json
└── README.md
```

## 🧠 Features

✅ Full CRUD operations with MongoDB  
✅ Beautiful React + TypeScript frontend  
✅ RESTful Express backend with CORS  
✅ Environment configuration with `.env`  
✅ Live integration between client and server  
✅ Clean project architecture for scalability  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Zubed786/CanteenX.git
cd CanteenX
2️⃣ Backend Setup (Express + MongoDB)
cd server
npm install


Create a .env file inside /server:

MONGO_URI=mongodb://localhost:27017/canteenx
PORT=5000


Run the backend:

npm run dev


Expected output:

✅ Connected to MongoDB
🚀 Server running on port 5000

3️⃣ Frontend Setup (React + Vite)

In another terminal:

cd ../client
npm install
npm run dev


Expected output:

VITE v6.x ready in 300ms
Local: http://localhost:5173/


Open your browser → http://localhost:5173

🧾 API Endpoints
Method	Endpoint	Description
GET	/api/items	Fetch all menu items
POST	/api/items	Add a new canteen item

Example POST body:

{
  "name": "Cold Coffee",
  "price": 45,
  "available": true
}

🧰 NPM Scripts
Frontend (/client)
Command	Description
npm run dev	Start React dev server
npm run build	Create production build
Backend (/server)
Command	Description
npm run dev	Start Express with nodemon
npm start	Run backend in production mode
🌍 Environment Variables
Variable	Description
MONGO_URI	MongoDB connection string
PORT	Server port number (default: 5000)
👨‍💻 Author

MD Zubed
📧 mdzubed777@gmail.com

🔗 https://github.com/Zubed786

⚠️ License

This project is open-source and available under the MIT License
.

🏁 Quick Start Summary
# Backend
cd server
npm install
npm run dev

# Frontend
cd ../client
npm install
npm run dev


Visit:

Frontend → http://localhost:5173

Backend → http://localhost:5000/api/items

✅ You’re live!
