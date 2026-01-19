import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminNavbar = ({ onLogout }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("adminToken")
  );
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsLoggedIn(false);
    if (onLogout) onLogout();
    navigate("/admin");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 fixed-top shadow-sm">
      <div className="container-fluid">
        <span className="navbar-brand fw-bold">Admin Panel</span>
        <div className="d-flex">
          <button
            className="btn btn-outline-success me-2"
            type="button"
            onClick={() =>
              localStorage.getItem("adminToken")
                ? navigate("/admin/dashboard")
                : navigate("/admin")
            }
          >
            Home
          </button>

          <button
            className="btn btn-outline-secondary me-2"
            type="button"
            onClick={() =>
              localStorage.getItem("adminToken")
                ? navigate("/admin/orders")
                : navigate("/admin")
            }
          >
            Orders
          </button>

          <button
            className="btn btn-outline-secondary me-2"
            type="button"
            onClick={() =>
              localStorage.getItem("adminToken")
                ? navigate("/admin/orders/request")
                : navigate("/admin")
            }
          >
            Orders Request
          </button>

          <button
            className="btn btn-outline-danger"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
