import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ onLogout, isLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 fixed-top shadow-sm">
      <div className="container-fluid">

        <span
          className="navbar-brand"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <h2 className="m-0">Home</h2>
        </span>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav ms-auto align-items-center">

            <li className="nav-item me-3">
              <span
                className="nav-link"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(isLoggedIn ? "/track-order" : "/")}
              >
                <i className="fas fa-shopping-cart"></i>
              </span>
            </li>


            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                id="navbarDropdownMenuAvatar"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  src="https://mdbcdn.b-cdn.net/img/new/avatars/2.webp"
                  className="rounded-circle"
                  height="30"
                  alt="User avatar"
                />
              </a>

              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="navbarDropdownMenuAvatar"
              >
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate(isLoggedIn ? "/profile" : "/")}
                  >
                    My Profile
                  </button>
                </li>
                {isLoggedIn && (
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                )}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;