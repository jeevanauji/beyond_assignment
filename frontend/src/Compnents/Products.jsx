import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "/herobg.jpg";

const Products = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
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

    const fetchData = async () => {
    try {
      const result = await axios.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(result.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

 useEffect(() => {
    if (!token) {
      setError("Please log in to view your orders.");
      setLoading(false);
      return;
    }
    const decoded = decodeToken(token);
    if (decoded && decoded.id) fetchData(decoded.id);
    else {
      setError("Invalid session. Please log in again.");
      setLoading(false);
    }
  

}, [fetchData]);

  const scrollToNextSection = (e) => {
    e.preventDefault();
    const section = e.currentTarget.closest("section")?.nextElementSibling;
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <section
        className="d-flex align-items-center justify-content-center text-center text-light min-vh-100"
        style={{
          backgroundImage: "url('herobg.jpg')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundColor: "#444",
          backgroundBlendMode: "overlay",
          padding: "0 20px",
        }}
      >
        <div className="text-center" style={{ maxWidth: "700px" }}>
          <h1 className="display-1 fw-bolder mb-4">Buy Now</h1>
          <p className="lead mb-2">
            All products are available at your fingertips
          </p>
          <p className="lead">Order now and Get Discount.</p>

          <button
            onClick={scrollToNextSection}
            className="btn btn-link text-light mt-4 p-0 border-0"
          >
            <svg
              width="4em"
              height="4em"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
              />
              <path
                fillRule="evenodd"
                d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z"
              />
            </svg>
          </button>
        </div>
      </section>

      <section className="container my-5">
        <h1 className="text-center mb-4">
          <u>EXPLORE OUR PRODUCTS </u>
        </h1>
        <div className="row">
          {data.length > 0 ? (
            data.map((product) => (
              <div className="col-md-4 col-sm-6 mb-4" key={product._id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-img-tiles">
                    <div className="inner">
                      <div className="main-img">
                        <img
                          src={product.mainImage}
                          alt={product.title}
                          className="img-fluid rounded-top"
                          style={{
                            width: "100%",
                            height: "250px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div className="d-flex justify-content-center mt-2 gap-2">
                        {product.thumbnails?.map((thumb, i) => (
                          <img
                            key={i}
                            src={thumb}
                            alt={`${product.title} thumbnail ${i + 1}`}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "5px",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card-body text-center">
                    <h4 className="card-title">{product.title}</h4>
                    <p className="text-muted">Price: Rs.{product.priceStart}</p>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => navigate("/order", { state: { product } })}
                    >
                      BUY NOW
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading products...</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Products;
