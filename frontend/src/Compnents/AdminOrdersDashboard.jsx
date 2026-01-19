
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// Initialize socket ONCE outside component
// Auto-detect the correct URL (works in both dev and production)
const socketURL = window.location.hostname === 'localhost' 
  ? "http://localhost:3000" 
  : window.location.origin;

const socket = io(socketURL, { 
  path: "/socket.io",
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  secure: window.location.protocol === "https:"
});

const AdminOrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoize fetchOrders to prevent recreation
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - function never changes

  const approveRequest = async (id, decision) => {
    try {
      await axios.post(`/api/orders/admin/orders/${id}/approve`, { decision });
      alert(`Request ${decision}`);
      fetchOrders();
    } catch (err) {
      console.error("Error approving:", err);
      alert(err.response?.data?.message || "Failed to update request");
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchOrders();

    // Join public room
    socket.emit("joinPublic");

    // Define event handlers
    const handleNewOrder = (newOrder) => {
      console.log("Admin got new order:", newOrder);
      setOrders((prev) => [newOrder, ...prev]);
    };

    const handleDeliveryRequest = (data) => {
      console.log("New delivery request:", data);
      fetchOrders();
    };

    const handleOrderUpdated = (updatedOrder) => {
      console.log("Admin order updated:", updatedOrder);
      setOrders((prev) =>
        prev.map((o) => 
          String(o._id) === String(updatedOrder._id) ? updatedOrder : o
        )
      );
    };

    const handleDeliveryRequestResponse = (data) => {
      console.log("deliveryRequestResponse:", data);
      fetchOrders();
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
    socket.on("deliveryRequest", handleDeliveryRequest);
    socket.on("orderUpdated", handleOrderUpdated);
    socket.on("deliveryRequestResponse", handleDeliveryRequestResponse);

    // Cleanup function
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("newOrder", handleNewOrder);
      socket.off("deliveryRequest", handleDeliveryRequest);
      socket.off("orderUpdated", handleOrderUpdated);
      socket.off("deliveryRequestResponse", handleDeliveryRequestResponse);
    };
  }, [fetchOrders]); // Include fetchOrders in dependencies

  if (loading) return <p className="text-center mt-5">Loading admin orders...</p>;

  return (
    <div className="container py-7">
      <h2 className="text-center mb-4">🧾 Admin Orders Dashboard</h2>

      {orders.length === 0 ? (
        <p className="text-center">No orders yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Product</th>
                <th>Price</th>
                <th>Status</th>
                <th>Delivery Boy</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td>{index + 1}</td>
                  <td>{order.name}</td>
                  <td>{order.address}</td>
                  <td>{order.title}</td> 
                  <td>₹{order.price}</td>
                  <td>
                    <span
                      className={`badge ${
                        order.status === "Pending"
                          ? "bg-warning text-dark"
                          : order.status === "Accepted"
                          ? "bg-primary"
                          : order.status === "Out for Delivery"
                          ? "bg-info"
                          : "bg-success"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{order.assignedTo ? order.assignedTo.name : "Unassigned"}</td>
                  <td>
                    {order.deliveryRequest?.status === "Pending" ? (
                      <>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => approveRequest(order._id, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => approveRequest(order._id, "Rejected")}
                        >
                          Reject
                        </button>
                      </>
                    ) : order.status === "Pending" ? (
                      <span className="text-muted">No Requests</span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersDashboard;
