import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home'; // Make sure path is correct

function Dashboard() {
  return (
    <>
      <Navbar />
      <Home /> {/* Main content (like CTA) goes here */}
      <Footer />
    </>
  );
}

export default Dashboard;
