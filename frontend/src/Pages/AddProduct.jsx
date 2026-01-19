import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const addProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    const productData = {
      title: formData.get("pname"),
      description: formData.get("pdesc"),
      priceStart: formData.get("pprice"),
    };

    const data = new FormData();

    data.append("title", productData.title);
    data.append("description", productData.description);
    data.append("priceStart", productData.priceStart);

    const mainImage = formData.get("pimage");
    const thumbnails = formData.getAll("pthumbnail");

    if (mainImage) {
      data.append("pimage", mainImage);
    }

    if (thumbnails && thumbnails.length > 0) {
      thumbnails.forEach((thumbnail) => {
        data.append("pthumbnail", thumbnail);
      });
    }

    try {
      await axios.post("/api/products/add", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      alert("✅ Product added successfully");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("❌ Error adding product:", err);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Add New Product</h3>
      <form onSubmit={addProduct}>
        <div className="mb-3">
          <label className="form-label">Product Name</label>
          <input type="text" name="pname" className="form-control" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Product Description</label>
          <textarea name="pdesc" className="form-control" rows="3" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Main Product Image</label>
          <input
            type="file"
            name="pimage"
            className="form-control"
            accept="image/*"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Thumbnail Images</label>
          <input
            type="file"
            name="pthumbnail"
            className="form-control"
            accept="image/*"
            multiple
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>
          <input type="number" name="pprice" className="form-control" required />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
        <button
          className="btn btn-secondary ms-2"
          type="button"
          onClick={() => navigate("/admin/dashboard")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddProduct;