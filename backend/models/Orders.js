const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    mainImage: { type: String },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Out for Delivery", "Delivered"],
      default: "Pending",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy",
      default: null,
    },

    // 🆕 delivery request from delivery boys
    deliveryRequest: {
      deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy", default: null },
      status: { type: String, enum: ["Pending", "Approved", "Rejected", "None"], default: "None" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
