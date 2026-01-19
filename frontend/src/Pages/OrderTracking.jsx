// OrderTracking.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Invalid token:", err);
      return null;
    }
  };

  const fetchOrders = async (userId) => {
    try {
      const res = await axios.get(
        `/api/orders/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Please log in to view your orders.");
      setLoading(false);
      return;
    }
    const decoded = decodeToken(token);
    if (decoded && decoded.id) fetchOrders(decoded.id);
    else {
      setError("Invalid session. Please log in again.");
      setLoading(false);
    }
  }, [fetchOrders]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-danger mt-5">
        <p>{error}</p>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="text-center mt-5">
        <h5 className="text-muted">You don’t have any orders yet.</h5>
      </div>
    );

  return (
    <section
      className="min-vh-100 py-7"
    >
      <div className="container">
        <h2 className="text-center text-black fw-bold mb-5">
          My Orders Timeline
        </h2>

        <div className="timeline">
          {orders.map((order, index) => {
            const colors = {
              Pending: "warning",
              Accepted: "primary",
              "Out for Delivery": "info",
              Delivered: "success",
            };
            const badgeColor = colors[order.status] || "secondary";

            return (
              <div
                className="timeline-item bg-white shadow-sm p-4 rounded-3 mb-4 position-relative"
                key={order._id}
              >
                <div
                  className={`position-absolute top-0 start-0 translate-middle rounded-circle bg-${badgeColor}`}
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "3px solid white",
                    left: "-8px",
                  }}
                ></div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0 text-primary">{order.title}</h5>
                  <span
                    className={`badge bg-${badgeColor}`}
                    style={{ fontSize: "0.8rem" }}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="mb-1 text-muted small">
                  Ordered on:{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <div className="mt-3">
                  <p className="mb-1">
                    <strong>Quantity:</strong> {order.quantity}
                  </p>
                  <p className="mb-1">
                    <strong>Price:</strong> ₹{order.price}
                  </p>
                  <p className="mb-0">
                    <strong>Delivery Address:</strong> {order.address}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OrderTracking;
