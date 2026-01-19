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

const DeliveryBoyDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryBoyId, setDeliveryBoyId] = useState(null);
  
  const token = localStorage.getItem("deliveryBoyToken");

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
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("/api/orders/delivery-boy/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      alert("Error fetching orders");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const requestToAccept = async (id) => {
    try {
      const res = await axios.post(
        `/api/orders/delivery-boy/orders/${id}/request`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert("📨 Request sent to admin!");
        setOrders((prev) =>
          prev.map((o) =>
            String(o._id) === String(id)
              ? { 
                  ...o, 
                  deliveryRequest: { 
                    ...o.deliveryRequest, 
                    status: "Pending", 
                    deliveryBoy: deliveryBoyId 
                  } 
                }
              : o
          )
        );
      }
    } catch (err) {
      console.error("Error requesting order:", err);
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  useEffect(() => {
    if (!token) {
      alert("Please log in as a delivery boy");
      setLoading(false);
      return;
    }

    const decoded = decodeToken(token);
    if (decoded?.id) {
      setDeliveryBoyId(decoded.id);
    }

    // Initial fetch
    fetchOrders();

    // Join socket rooms
    socket.emit("joinPublic");
    if (decoded?.id) {
      socket.emit("joinDeliveryRoom", decoded.id);
    }

    // Define event handlers
    const handleNewOrder = (newOrder) => {
      console.log("New order received:", newOrder);
      setOrders((prev) => [newOrder, ...prev]);
    };

    const handleDeliveryRequestResponse = (data) => {
      console.log("Delivery request response:", data);
      fetchOrders();
    };

    const handleOrderUpdated = (updatedOrder) => {
      console.log("Order updated:", updatedOrder);
      setOrders((prev) =>
        prev.map((o) => 
          String(o._id) === String(updatedOrder._id) ? updatedOrder : o
        )
      );
    };

    const handleConnect = () => {
      console.log("Socket connected");
      socket.emit("joinPublic");
      if (decoded?.id) {
        socket.emit("joinDeliveryRoom", decoded.id);
      }
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
    };

    // Attach event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("newOrder", handleNewOrder);
    socket.on("deliveryRequestResponse", handleDeliveryRequestResponse);
    socket.on("orderUpdated", handleOrderUpdated);

    // Cleanup function
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("newOrder", handleNewOrder);
      socket.off("deliveryRequestResponse", handleDeliveryRequestResponse);
      socket.off("orderUpdated", handleOrderUpdated);
      // Don't disconnect - keep socket alive for other components
    };
  }, [token, decodeToken, fetchOrders]);

  if (loading)
    return <p className="text-center py-7">Loading orders...</p>;

  return (
    <div className="container py-7">
      <h2 className="text-center mb-4">🚚 Delivery Dashboard</h2>

      {orders.length === 0 ? (
        <p className="text-center text-muted">No orders available right now.</p>
      ) : (
        <div className="row g-3">
          {orders.map((order) => {
            const assignedStr = order.assignedTo ? String(order.assignedTo) : null;
            const isAssignedToMe = deliveryBoyId && assignedStr && String(assignedStr) === String(deliveryBoyId);

            const statusColor =
              order.status === "Pending"
                ? "warning"
                : order.status === "Accepted"
                ? "primary"
                : order.status === "Out for Delivery"
                ? "info"
                : "success";

            return (
              <div key={order._id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{order.title || order.product?.title}</h5>
                    <p className="card-text mb-1"><strong>Customer:</strong> {order.name || order.user?.name}</p>
                    <p className="card-text mb-1"><strong>Address:</strong> {order.address || order.shippingAddress}</p>
                    <p className="card-text mb-1"><strong>Price:</strong> ₹{order.price}</p>
                    <span className={`badge bg-${statusColor} mb-2 align-self-start`}>
                      {order.status}
                    </span>
                    <p className="mb-2">
                      <strong>Assigned:</strong>{" "}
                      {!order.assignedTo ? "Unassigned" : isAssignedToMe ? "You" : "Other"}
                    </p>
                    <div className="mt-auto">
                      {!order.assignedTo && order.status === "Pending" ? (
                        order.deliveryRequest?.status === "Pending" ? (
                          <button className="btn btn-secondary btn-sm w-100" disabled>Requested</button>
                        ) : (
                          <button className="btn btn-primary btn-sm w-100" onClick={() => requestToAccept(order._id)}>Request</button>
                        )
                      ) : isAssignedToMe ? (
                        <button className="btn btn-success btn-sm w-100" disabled>Assigned to You</button>
                      ) : (
                        <button className="btn btn-light btn-sm w-100" disabled>Not Available</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyDashboard;
