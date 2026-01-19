const mongoose = require("mongoose");

const deliveryBoySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  vehicle: { type: String, required: true },
  licenseNumber: { type: String, required: true },
});

module.exports = mongoose.model("DeliveryBoy", deliveryBoySchema);
