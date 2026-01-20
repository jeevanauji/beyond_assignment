import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Products from "./Compnents/Products";
import Login from "./Compnents/Login";
import OrderTracking from "./Pages/OrderTracking.jsx";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Admin from "./Compnents/Admin.jsx";
import DeliveryBoy from "./Compnents/DeliveryBoy.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Navbar from "./Compnents/Navbar.jsx";
import AdminNavbar from "./Compnents/AdminNavbar.jsx";
import Orders from "./Pages/Orders.jsx";
import AddProduct from "./Pages/AddProduct.jsx";
import Order from "./Pages/Order.jsx";
import DeliveryBoyNavbar from "./Compnents/DeliveryBoyNavbar.jsx";
import DeliveryBoyAuth from "./Compnents/DeliveryBoyAuth.jsx";
import DeliveryBoyDashboard from "./Compnents/DeliveryBoyDashboard.jsx";
import DeliveryBoyOrders from "./Compnents/DeliveryBoyOrders.jsx";
import AdminOrdersDashboard from "./Compnents/AdminOrdersDashboard.jsx";
import EditProduct from "./Pages/EditProduct.jsx";
import UserProfile from "./Compnents/UserProfile.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!localStorage.getItem("adminToken"));
  const [isDeliveryBoyLoggedIn, setIsDeliveryBoyLoggedIn] = useState(!!localStorage.getItem("deliveryBoyToken"));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    setIsAdminLoggedIn(!!localStorage.getItem("adminToken"));
    setIsDeliveryBoyLoggedIn(!!localStorage.getItem("deliveryBoyToken"));

    const fetchData = async () => {
      try {
        const result = await axios.get("/");
        setData(result.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [location]);


  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
  };

  const handleDeliveryBoyLoginSuccess = () => {
    setIsDeliveryBoyLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem("adminToken");
    setIsAdminLoggedIn(false);
    navigate("/admin");
  };

  const handleLogoutDeliveryBoy = () => {
    localStorage.removeItem("deliveryBoyToken");
    setIsDeliveryBoyLoggedIn(false);
    navigate("/delivery-boy/login");
  };

  const isDeliveryBoyRoute =
    location.pathname === "/delivery-boy/login" ||
    location.pathname === "/delivery-boy" ||
    location.pathname === "/delivery-boy/dashboard" ||
    location.pathname === "/delivery-boy/orders";

  const isAdminRoute =
    location.pathname === "/admin" ||
    location.pathname === "/admin/dashboard" ||
    location.pathname === "/admin/orders" ||
    location.pathname === "/admin/add-product" ||
    location.pathname === "/admin/orders/request" ||
    location.pathname.startsWith("/admin/edit-product/");

  if (!isAdminLoggedIn && location.pathname.startsWith("/admin") && location.pathname !== "/admin") {
    return <Admin onLoginSuccess={handleAdminLoginSuccess} />;
  }

  if (!isDeliveryBoyLoggedIn && location.pathname.startsWith("/delivery-boy") && location.pathname !== "/delivery-boy/login") {
    return <DeliveryBoyAuth onLoginSuccess={handleDeliveryBoyLoginSuccess} />;
  }

  return (
    <>
      {isAdminRoute ? (
        <AdminNavbar onLogout={handleLogoutAdmin} />
      ) : isDeliveryBoyRoute ? (
        <DeliveryBoyNavbar onLogout={handleLogoutDeliveryBoy} />
      ) : (
        <Navbar onLogout={handleLogout} isLoggedIn={isLoggedIn} />
      )}

      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Products data={data} />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route path="/track-order" element={<OrderTracking />} />
        <Route path="/profile" element={<UserProfile />} />

        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/edit-product/:id" element={<EditProduct />} />
        <Route
          path="/admin/orders/request"
          element={<AdminOrdersDashboard />}
        />
        <Route path="/order" element={<Order />} />
        <Route path="/delivery-boy" element={<DeliveryBoy />} />
        <Route path="/delivery-boy/login" element={<DeliveryBoyAuth onLoginSuccess={handleDeliveryBoyLoginSuccess} />} />
        <Route path="/delivery-boy/orders" element={<DeliveryBoyOrders />} />
        <Route
          path="/delivery-boy/dashboard"
          element={<DeliveryBoyDashboard />}
        />
      </Routes>
    </>
  );
}

export default App;
