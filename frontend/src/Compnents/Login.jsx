import React, { useState } from "react";
import axios from "axios";

const Login = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsSignup((prev) => !prev);
    setMessage("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (isSignup) {
        const res = await axios.post("/api/auth/signup", {
          username: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
        });
        setMessage("✅ Signup successful! You can now log in.");
        setIsSignup(false);
      } else {
        const res = await axios.post("/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("token", res.data.token);
        setMessage("✅ Login successful!");
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <section
      className="d-flex align-items-center justify-content-center min-vh-100 text-center position-relative"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1505842465776-3ac1cf1b3b45?auto=format&fit=crop&w=1920&q=80)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
      ></div>

      <div
        className="card shadow-lg p-4 p-md-5 rounded-4 bg-light text-dark position-relative"
        style={{
          width: "100%",
          maxWidth: "500px",
          zIndex: 2,
        }}
      >
        <h2 className="fw-bold mb-4 text-primary">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-muted mb-4">
          {isSignup
            ? "Join us today! Please fill in your details."
            : "Please log in to continue."}
        </p>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="form-control form-control-lg"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="form-control form-control-lg"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="mb-3">
            <input
              type="email"
              id="email"
              name="email"
              className="form-control form-control-lg"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              id="password"
              name="password"
              className="form-control form-control-lg"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 shadow-sm"
            disabled={loading}
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>

        <div className="mt-4">
          <p className="text-muted">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="btn btn-link p-0 text-primary fw-semibold"
              onClick={toggleMode}
            >
              {isSignup ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>

        {message && (
          <div className="alert alert-info mt-3 py-2 mb-0">{message}</div>
        )}
      </div>
    </section>
  );
};

export default Login;
