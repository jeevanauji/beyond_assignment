const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("../models/Products.js");

const router = express.Router();
const BASE_URL = "/uploads";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage });




router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post(
  "/add",
  upload.fields([
    { name: "pimage", maxCount: 1 },
    { name: "pthumbnail", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { title, description, priceStart } = req.body;
      const normalizePath = (p) => p.replace(/\\/g, "/");

const mainImage = req.files.pimage
  ? `${BASE_URL}/${req.files.pimage[0].filename}`
  : "";

const thumbnails = req.files.pthumbnail
  ? req.files.pthumbnail.map(
      (file) => `${BASE_URL}/${file.filename}`
    )
  : [];

      const newProduct = new Product({
        title,
        description,
        priceStart,
        mainImage,
        thumbnails,
      });

      const savedProduct = await newProduct.save();
      res.status(201).json(savedProduct);
    } catch (err) {
      console.error("Error saving product:", err);
      res.status(500).json({ error: "Failed to add product" });
    }
  }
);

router.put("/edit/:id", upload.single("mainImage"), async (req, res) => {
  try {
    const { title, description, priceStart } = req.body;
    const updateData = { title, description, priceStart };

 if (req.file) {
  updateData.mainImage = `${BASE_URL}/${req.file.filename}`;
}

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ error: "Product not found" });

    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Product not found" });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
