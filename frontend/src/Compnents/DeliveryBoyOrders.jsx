import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";

// Auto-detect socket URL for dev/production
const getSocketURL = () => {
  if (window.location.hostname === 'localhost') {
    return "http://localhost:3000";
  }
  return window.location.origin;
};

const socket = io(getSocketURL(), {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  secure: window.location.protocol === "https:",
  autoConnect: true
});

const DeliveryBoyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("deliveryBoyToken");

  // Status progression (can only move forward)
  const STATUS_FLOW = ["Accepted", "Out for Delivery", "Delivered"];

  const decodeToken = useCallback((token) => {
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
      console.error("Error decoding token:", err);
      return null;
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setError("Please log in as a delivery boy");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        "/api/orders/delivery-boy/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const filtered = res.data.filter(
        (order) =>
          order.status === "Accepted" ||
          order.status === "Out for Delivery" ||
          order.status === "Delivered"
      );

      setOrders(filtered);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.put(
        `/api/orders/delivery-boy/orders/${orderId}/status`,
        { newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        alert(`✅ Order status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  // Get only forward status options (no going backward)
  const getAvailableStatuses = (currentStatus) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === -1) return [];
    
    // Return only statuses that come AFTER current status
    return STATUS_FLOW.slice(currentIndex + 1);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Accepted":
        return "primary";
      case "Out for Delivery":
        return "info";
      case "Delivered":
        return "success";
      default:
        return "secondary";
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Please log in as a delivery boy");
      setLoading(false);
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded?.id) {
      setError("Invalid token");
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchOrders();

    // Join delivery room
    socket.emit("joinDeliveryRoom", decoded.id);

    // Define event handlers
    const handleOrderUpdated = (updatedOrder) => {
      console.log("Order updated:", updatedOrder);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    };

    const handleConnect = () => {
      console.log("Socket connected");
      socket.emit("joinDeliveryRoom", decoded.id);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
    };

    // Attach event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("orderUpdated", handleOrderUpdated);

    // Cleanup function
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("orderUpdated", handleOrderUpdated);
    };
  }, [token, decodeToken, fetchOrders]);

  if (loading)
    return <p className="text-center mt-5">Loading accepted orders...</p>;
  
  if (error)
    return (
      <div className="alert alert-danger text-center mt-3" role="alert">
        {error}
      </div>
    );

  return (
    <div className="container py-7">
      <h3 className="text-center mb-4">🚴 My Active Orders</h3>

      {orders.length === 0 ? (
        <p className="text-center text-muted">No accepted orders yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Status</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => {
                const availableStatuses = getAvailableStatuses(order.status);
                
                return (
                  <tr key={order._id}>
                    <td>{i + 1}</td>
                    <td>{order.name}</td>
                    <td>{order.address}</td>
                    <td>{order.title}</td>
                    <td>{order.quantity}</td>
                    <td>₹{order.price}</td>
                    <td>
                      <span
                        className={`badge ${
                          order.status === "Accepted"
                            ? "bg-primary"
                            : order.status === "Out for Delivery"
                            ? "bg-warning text-dark"
                            : "bg-success"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      {order.status === "Delivered" ? (
                        <button className="btn btn-sm btn-success" disabled>
                          ✅ Delivered
                        </button>
                      ) : (
                        <select
                          className="form-select form-select-sm"
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                        >
                          {/* Current status (disabled) */}
                          <option value={order.status} disabled>
                            {order.status} (current)
                          </option>
                          
                          {/* Only show forward statuses */}
                          {availableStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyOrders;