import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DeliveryBoyNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("deliveryBoyToken")
  );
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("deliveryBoyToken");
    setIsLoggedIn(false);
    navigate("/delivery-boy/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top shadow-sm">
      <div className="container-fluid">
        <span
          className="navbar-brand"
          style={{ cursor: "pointer" }}
          onClick={() =>
            localStorage.getItem("deliveryBoyToken")
              ? navigate("/delivery-boy")
              : navigate("/delivery-boy/login")
          }
        >
          🚚 Delivery Portal
        </span>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#deliveryNavbar"
          aria-controls="deliveryNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="deliveryNavbar">
          <div className="navbar-nav ms-auto">
            <button
              className="btn btn-outline-success me-2 mb-2 mb-lg-0"
              onClick={() =>
                navigate(
                  localStorage.getItem("deliveryBoyToken")
                    ? "/delivery-boy/dashboard"
                    : "delivery-boy/login"
                )
              }
            >
              Dashboard
            </button>

            <button
              className="btn btn-outline-secondary me-2 mb-2 mb-lg-0"
              onClick={() =>
                navigate(
                  localStorage.getItem("deliveryBoyToken")
                    ? "/delivery-boy/orders"
                    : "delivery-boy/login"
                )
              }
            >
              My Orders
            </button>

            <button
              className="btn btn-outline-danger mb-2 mb-lg-0"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DeliveryBoyNavbar;
