// routes/deliveryboy.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const DeliveryBoy = require("../models/DeliveryBoy.js");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "jeevansecretkey";

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, address, vehicle, licenseNumber } = req.body;

        const existing = await DeliveryBoy.findOne({ email });
        if (existing)
            return res.status(400).json({ message: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const deliveryBoy = new DeliveryBoy({
            name,
            email,
            password: hashedPassword,
            address,
            vehicle,
            licenseNumber,
        });

        await deliveryBoy.save();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const deliveryBoy = await DeliveryBoy.findOne({ email });
        if (!deliveryBoy)
            return res.status(400).json({ message: "Invalid email or password" });
        
        const isMatch = await bcrypt.compare(password, deliveryBoy.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid email or password" });
        
        const token = jwt.sign({ id: deliveryBoy._id, role: "delivery-boy" }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({ token, id: deliveryBoy._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
