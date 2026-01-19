import React from "react";
import { useNavigate } from "react-router-dom";

const DeliveryBoy = () => {
  const navigate = useNavigate();

  const goToDashboard = () => {
    const token = localStorage.getItem("deliveryBoyToken");
    if (token) {
      navigate("/delivery-boy/dashboard");
    } else {
      navigate("/delivery-boy/login"); 
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        backgroundImage: `url('https://images.unsplash.com/photo-1605902711622-cfb43c443f5f?auto=format&fit=crop&w=1470&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)", 
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <h1 className="mb-3">🚴 Welcome, Delivery Boy!</h1>
        <p className="mb-4" style={{ fontSize: "1.2rem" }}>
          View your active orders and manage delivery status from your
          dashboard.
        </p>
        <button
          className="btn btn-primary btn-lg"
          onClick={goToDashboard}
          style={{ backgroundColor: "#ff7f50", border: "none" }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default DeliveryBoy;
