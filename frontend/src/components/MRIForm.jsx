import React, { useState } from 'react';
import ClipLoader from "react-spinners/ClipLoader";

function MRIForm() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doPreprocess, setDoPreprocess] = useState(false); // NEW toggle state
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleToggle = () => {
    setDoPreprocess(!doPreprocess);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Optionally preprocess first
      if (doPreprocess) {
        const preprocessResponse = await fetch('http://localhost:5000/preprocess_mri', {
          method: 'POST',
          body: formData,
        });

        const preprocessData = await preprocessResponse.json();
        if (!preprocessResponse.ok) throw new Error(preprocessData.error || 'Erreur lors du prétraitement');
        
        // If preprocessing is done, use the returned filename
        formData.delete('file'); // remove old file
        formData.append('filename', preprocessData.filename);
    }

      // Then analyze
      const response = await fetch('http://localhost:5000/analyze_mri', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur inconnue');

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h1 className="form-title">Prediction of Dyslexia from MRI Analysis</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="input-container">
          <label htmlFor="mri-file" className="input-label">Select an Anatomical MRI file</label>
          <input
            id="mri-file"
            type="file"
            accept=".nii,.nii.gz"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>

        <div className="checkbox-row">
          <input
            type="checkbox"
            id="mri-preprocess"
            checked={doPreprocess}
            onChange={handleToggle}
          />
          <label htmlFor="mri-preprocess">Preprocess before analysis</label>
        </div>

        <button type="submit" disabled={!file || loading} className="submit-btn">
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClipLoader color="#ffffff" size={20} />
              Analysis in progress...
            </span>
          ) : (
            'MRI Analysis'
          )}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="result-box">
        <p><strong>Prediction: </strong>{result.result}</p>
        <div className="input-container">
            <label>Doctor's Name:</label>
            <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="text-input"
            />
        </div>
        <div className="input-container">
            <label>Notes:</label>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-input"
                rows={3}
            />
        </div>
        <button
            className="submit-btn"
            disabled={!doctorName || !notes}
            onClick={async () => {
                const res = await fetch('http://localhost:5000/generate_report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    result: result.result,
                    doctor_name: doctorName,
                    notes: notes,
                    model_name: "CNN-MRI-v1"
                }),
                });

                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'rapport_mri.pdf';
                a.click();
                a.remove();
            }}
          >
            Download Report (PDF)
          </button>        
       </div>
      )}
    </div>
  );
}

export default MRIForm;
