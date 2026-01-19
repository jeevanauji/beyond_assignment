import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DeliveryBoyAuth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    vehicle: "",
    licenseNumber: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin
        ? "/api/delivery-boy/login"
        : "/api/delivery-boy/register";

      const response = await axios.post(endpoint, formData);
      const data = response.data;

      if (isLogin && data.token) {
        localStorage.setItem("deliveryBoyToken", data.token);
        navigate("/delivery-boy");
      } else if (!isLogin && data.success) {
        alert("Registration successful! You can now log in.");
        setIsLogin(true);
      } else {
        alert(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      alert("Error: " + (error.response?.data?.message || "Server error"));
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "40px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h3 className="text-center mb-4">
          {isLogin ? "Delivery Boy Login" : "Delivery Boy Registration"}
        </h3>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  className="form-control"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Vehicle</label>
                <input
                  type="text"
                  name="vehicle"
                  className="form-control"
                  value={formData.vehicle}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  className="form-control"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{ backgroundColor: "#ff7f50", border: "none" }}
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center mt-3">
          {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
          <button
            className="btn btn-link p-0"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default DeliveryBoyAuth;
