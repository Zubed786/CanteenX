import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order and link it to a user
 * @access  Public
 */
router.post("/", async (req, res) => {
  try {
    const { userEmail, items, totalAmount } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new order document
    const newOrder = new Order({
      user: user._id,
      userDetails: {
        name: user.name,
        email: user.email,
      },
      items,
      totalAmount,
      status: "PLACED",
    });

    await newOrder.save();

    // -----------------------------------------
    // 🚀 AUTOMATIC ORDER STATUS PROGRESSION
    // -----------------------------------------

    // After 10 sec → PREPARING
    setTimeout(async () => {
      await Order.findByIdAndUpdate(newOrder._id, { status: "PREPARING" });
      console.log(`Order ${newOrder._id} → PREPARING`);
    }, 5000);

    // After 20 sec → READY
    setTimeout(async () => {
      await Order.findByIdAndUpdate(newOrder._id, { status: "READY" });
      console.log(`Order ${newOrder._id} → READY`);
    }, 10000);

    // After 30 sec → COMPLETED
    setTimeout(async () => {
      await Order.findByIdAndUpdate(newOrder._id, { status: "COMPLETED" });
      console.log(`Order ${newOrder._id} → COMPLETED`);
    }, 15000);

    res.status(201).json({ message: "Order placed successfully", newOrder });

  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   GET /api/orders/:email
 * @desc    Get all orders for a specific user
 * @access  Public
 */
router.get("/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;

    const orders = await Order.find({ "userDetails.email": userEmail })
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
