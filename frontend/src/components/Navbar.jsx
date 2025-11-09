import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import "../assets/css/LoginPage.css";
import logo from '../assets/Logo.jpg';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Optional: clear session/localStorage if needed
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src={logo} alt="Logo" style={{ width: '150px', height: '100px' }} />
        </div>
        <nav className="navbar-links">
          <a href="#">Home</a>
          <a href="#">Upload & Diagnose</a>
          <a href="#">History</a>
          <a href="#">About</a>
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt style={{ marginRight: '6px' }} />
            Log Out
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
