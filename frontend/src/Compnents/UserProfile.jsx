import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) {
          setError("Please log in to view your profile.");
          setLoading(false);
          return;
        }

        const res = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user data. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 text-danger text-center">
        <p className="mb-3">{error}</p>
        <button className="btn btn-primary" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );

  return (
    <section
      className="d-flex align-items-center justify-content-center min-vh-100 position-relative text-center"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1505842465776-3ac1cf1b3b45?auto=format&fit=crop&w=1920&q=80)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#333",
        backgroundBlendMode: "overlay",
      }}
    >
   
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      ></div>

   
      <div
        className="card shadow-lg p-4 p-md-5 rounded-4 bg-light text-dark position-relative"
        style={{
          width: "100%",
          maxWidth: "450px",
          zIndex: 2,
        }}
      >
        <div className="text-center mb-3">
          <img
            src={`https://api.dicebear.com/9.x/identicon/svg?seed=${user.username}`}
            alt="User Avatar"
            className="rounded-circle mb-3 border border-3 border-primary"
            width="100"
            height="100"
          />
          <h4 className="fw-bold mb-1">{user.username}</h4>
          <p className="text-muted mb-0">{user.email}</p>
        </div>

        <hr />

        <div className="text-start">
          <p className="mb-2">
            <strong>User ID:</strong> <br />
            <span className="text-secondary">{user._id}</span>
          </p>
          {user.role && (
            <p className="mb-2">
              <strong>Role:</strong> <span className="text-secondary">{user.role}</span>
            </p>
          )}
          {user.createdAt && (
            <p className="mb-0">
              <strong>Joined:</strong>{" "}
              <span className="text-secondary">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </p>
          )}
        </div>

        <button
          className="btn btn-danger mt-4 w-100 shadow-sm"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </section>
  );
};

export default UserProfile;
