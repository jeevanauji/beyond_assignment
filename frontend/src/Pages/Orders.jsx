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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const STATUS_FLOW = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      alert("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `/api/orders/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      );
      
      alert(`✅ Order status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update order status");
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchOrders();

    // Join public room
    socket.emit("joinPublic");

    // Define event handlers
    const handleNewOrder = (newOrder) => {
      console.log("New order received:", newOrder);
      setOrders((prev) => [newOrder, ...prev]);
    };

    const handleOrderUpdated = (updatedOrder) => {
      console.log("Order updated:", updatedOrder);
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    };

    const handleConnect = () => {
      console.log("Socket connected");
      socket.emit("joinPublic");
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
    };

    // Attach event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("newOrder", handleNewOrder);
    socket.on("orderUpdated", handleOrderUpdated);

    // Cleanup function
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("newOrder", handleNewOrder);
      socket.off("orderUpdated", handleOrderUpdated);
    };
  }, [fetchOrders]);

  const getNextStatus = (currentStatus) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) {
      return null;
    }
    return STATUS_FLOW[currentIndex + 1];
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
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



  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading orders...</p>
      </div>
    );


  return (
    <section
      className="min-vh-100 py-7"
      style={{
        background: "linear-gradient(135deg, #f3f8ff, #eaf1ff)",
      }}
    >
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary">📦 Live Orders Dashboard</h2>
          <span className="badge bg-info text-dark fs-6">
            Total: {orders.length}
          </span>
        </div>

        {orders.length > 0 ? (
          <div className="table-responsive shadow-sm rounded">
            <table className="table table-hover align-middle text-center bg-white">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Placed On</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const statusColor =
                    order.status === "Pending"
                      ? "warning"
                      : order.status === "Accepted"
                        ? "primary"
                        : order.status === "Out for Delivery"
                          ? "info"
                          : "success";

                  return (
                    <tr key={order._id} className="align-middle">
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{order.name}</td>
                      <td className="text-muted">{order.email}</td>
                      <td>{order.title}</td>
                      <td>{order.quantity}</td>
                      <td>₹{order.price}</td>
                      <td>
                        <select
                          className={`form-select form-select-sm border-${statusColor}`}
                          value={order.status}
                          disabled={order.status === "Pending"}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                        >
                          {STATUS_FLOW.map((status) => {
                            const currentIndex = STATUS_FLOW.indexOf(order.status);
                            const optionIndex = STATUS_FLOW.indexOf(status);

                            return (
                              <option
                                key={status}
                                value={status}
                                disabled={optionIndex < currentIndex}
                              >
                                {status}
                              </option>
                            );
                          })}
                        </select>
                      </td>

                      <td>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-muted mt-5">No orders found.</p>
        )}
      </div>
    </section>
  );
};

export default Orders;
