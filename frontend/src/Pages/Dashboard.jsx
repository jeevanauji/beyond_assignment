import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      alert("Failed to load products");
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      navigate("/admin");
      return;
    }
    fetchProducts();
  }, []);

  const addProduct = () => navigate("/admin/add-product");
  const handleEdit = (id) => navigate(`/admin/edit-product/${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      alert("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product");
    }
  };

  return (
    <section
      className="min-vh-100 py-7"
      style={{
        background: "linear-gradient(135deg, #e9f0ff 0%, #f7f9fc 100%)",
      }}
    >
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary">📦 Product Management</h2>
          <button className="btn btn-success shadow-sm" onClick={addProduct}>
            ➕ Add Product
          </button>
        </div>

        <div className="row g-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div className="col-md-4 col-lg-3" key={product._id}>
                <div
                  className="card border-0 shadow-sm h-100 position-relative"
                  style={{
                    transition: "transform 0.3s, box-shadow 0.3s",
                  }}
                >
                  <img
                    src={product.mainImage}
                    alt={product.title}
                    className="card-img-top"
                    style={{
                      height: "200px",
                      objectFit: "contain",
                      borderTopLeftRadius: "8px",
                      borderTopRightRadius: "8px",
                    }}
                  />
                  <div className="card-body">
                    <h5 className="card-title text-primary">{product.title}</h5>
                  </div>
                  <div className="card-footer bg-white border-0 d-flex justify-content-between">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleEdit(product._id)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(product._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted mt-5">
              <h5>No products found.</h5>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
