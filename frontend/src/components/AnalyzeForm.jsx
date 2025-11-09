import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; 
import FMRIForm from './FMRIForm';
import MRIForm from './MRIForm';
import "../assets/css/LoginPage.css";

function AnalyzeForm() {
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate('/*'); 
  };

  return (
    <div className="form-container">
      {/* Retour Button */}
      <button onClick={handleReturn}  className="icon-retour-btn" title="Retour">
        <FaArrowLeft />
      </button>

      {/* Diagnostic Forms */}
      <FMRIForm />
      <MRIForm />
    </div>
  );
}

export default AnalyzeForm;
