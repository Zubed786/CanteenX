import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  available: Boolean
});

export default mongoose.model("Item", itemSchema);
