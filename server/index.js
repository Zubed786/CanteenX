import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import itemRoutes from "./routes/items.js";  // 👈 This is the import being referred to

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB (Compass)"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 👇 Use the routes we imported
app.use("/api/items", itemRoutes);

app.get("/", (req, res) => {
  res.send("CanteenX backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
