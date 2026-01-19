import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Admin = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); 

  const toggleMode = () => {
    setIsRegister((prev) => !prev);
    setMessage("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isRegister) {
        // Admin Register
        const res = await axios.post("/api/admin/register", formData);
        setMessage(res.data.message);
        setMessageType("success");
      } else {
        // Admin Login
        const res = await axios.post("/api/admin/login", {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("adminToken", res.data.token);
        setMessage(res.data.message || "✅ Login successful!");
        setMessageType("success");

        if (onLoginSuccess) onLoginSuccess();
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Something went wrong.");
      setMessageType("danger");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-sm p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-4">{isRegister ? "Admin Register" : "Admin Login"}</h3>

        {message && (
          <div className={`alert alert-${messageType}`} role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <button className="btn btn-link mt-3 w-100" onClick={toggleMode}>
          {isRegister
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
};

export default Admin;
