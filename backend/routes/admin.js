const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin.js");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await Admin.findOne({ email });
        if (existing) return res.status(400).json({ message: "Admin already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await Admin.create({ name, email, password: hashedPassword });

        res.status(201).json({ message: "Admin created successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) return res.status(400).json({ message: "Invalid credentials" });

    
        const token = jwt.sign(
            { id: admin._id, email: admin.email, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ token, message: "Admin login successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;
