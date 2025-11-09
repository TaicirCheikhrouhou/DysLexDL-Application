import React from "react";
import "../assets/css/LoginPage.css"; // custom styles
import logo from '../assets/Logo.jpg';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <img src={logo} alt="DYSLEXDL Logo" width="150" />
      </div>

      <div className="footer-contact">
        <div><FaPhoneAlt /> +216 50708097</div>
        <div><FaEnvelope /> dyslexdl@company.com</div>
        <div><FaMapMarkerAlt /> Sfax, Route soukra km 3.5</div>
      </div>
    </footer>
  );
}

export default Footer;
