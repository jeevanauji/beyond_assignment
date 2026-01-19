import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Order = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state || {};
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    quantity: 1,
  });

  if (!product) {
    return <h3 className="text-center mt-5">No product selected.</h3>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderData = {
      id: user ? user._id : "",
      productId: product._id,
      title: product.title,
      price: product.priceStart,
      mainImage: product.mainImage,
      ...formData,
    };

    try {
      await axios.post("/api/orders/placed", orderData);
      alert("✅ Order placed successfully!");
      navigate("/");
    } catch (error) {
      console.error("Order failed:", error);
      alert("❌ There was a problem placing your order.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(res.data);
        setFormData((prev) => ({
          ...prev,
          name: res.data.username || "",
          email: res.data.email || "",
        }));
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <section
      className="min-vh-100 py-7"
      style={{
        background: "linear-gradient(135deg, #f5f9ff, #eaf3ff)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
         
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-primary text-white text-center">
                <h3 className="mb-0">🛒 Order Summary</h3>
              </div>
              <div className="card-body p-4">
                <div className="row g-4 align-items-center">
               
                  <div className="col-md-6 text-center">
                    <img
                      src={product.mainImage}
                      alt={product.title}
                      className="img-fluid rounded mb-3 shadow-sm"
                      style={{ maxHeight: "260px", objectFit: "cover" }}
                    />
                    <h5 className="fw-bold">{product.title}</h5>
                    <p className="text-muted mb-1">
                      Price:{" "}
                      <span className="fw-semibold text-primary">
                        ₹{product.priceStart * formData.quantity}
                      </span>
                    </p>
                    <small className="text-secondary">
                      Quantity: {formData.quantity}
                    </small>
                  </div>

                 
                  <div className="col-md-6">
                    <h5 className="fw-bold mb-3">Enter Your Details</h5>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          value={formData.name}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          value={formData.email}
                          onChange={handleChange}
                          readOnly
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Address</label>
                        <textarea
                          name="address"
                          className="form-control"
                          placeholder="Enter your delivery address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                        ></textarea>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          name="quantity"
                          className="form-control"
                          min="1"
                          value={formData.quantity}
                          onChange={handleChange}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-100 mt-2 shadow-sm"
                      >
                        Confirm Purchase
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

           
            <div className="text-center mt-4">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate("/")}
              >
                ← Back to Shop
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Order;
