import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    priceStart: "",
    mainImage: null,
    mainImagePreview: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        const p = res.data;
        setForm({
          title: p.title || "",
          description: p.description || "",
          priceStart: p.priceStart || "",
          mainImagePreview: p.mainImage || "",
        });
      } catch (err) {
        console.error("Error loading product:", err);
        alert("Failed to load product");
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({
      ...prev,
      mainImage: file,
      mainImagePreview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("priceStart", form.priceStart);
      if (form.mainImage) fd.append("mainImage", form.mainImage);

      await axios.put(`/api/products/edit/${id}`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      alert("✅ Product updated successfully");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Edit Product</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="form-control"
            rows="3"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            name="priceStart"
            value={form.priceStart}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Main Image</label>
          {form.mainImagePreview && (
            <div className="mb-2">
              <img
                src={form.mainImagePreview}
                alt="Preview"
                width="100"
                style={{ borderRadius: "5px" }}
              />
            </div>
          )}
          <input
            type="file"
            name="mainImage"
            className="form-control"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Product"}
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

export default EditProduct;
