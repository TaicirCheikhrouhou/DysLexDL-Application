import React, { useState } from 'react';
import ClipLoader from "react-spinners/ClipLoader";

function FMRIForm() {
  const [funcFile, setFuncFile] = useState(null);
  const [anatFile, setAnatFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doPreprocess, setDoPreprocess] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');

  const handleFuncChange = (e) => setFuncFile(e.target.files[0]);
  const handleAnatChange = (e) => setAnatFile(e.target.files[0]);
  const handleToggle = () => setDoPreprocess(!doPreprocess);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!funcFile) return;

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', funcFile);
    if (doPreprocess && anatFile) {
      formData.append('anat_file', anatFile);
    }

    try {
      if (doPreprocess) {
        const preprocessResponse = await fetch('http://localhost:5000/preprocess_fmri', {
          method: 'POST',
          body: formData,
        });

        const preprocessData = await preprocessResponse.json();
        if (!preprocessResponse.ok) throw new Error(preprocessData.error || 'Erreur lors du prétraitement');

        formData.delete('file');
        formData.append('filename', preprocessData.filename);
      }

      const response = await fetch('http://localhost:5000/analyze_fmri', {
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
      <h1 className="form-title">Prediction of Dyslexia from fMRI Analysis</h1>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="fmri-file" className="input-label">Select a Functional MRI file</label>
        <input
          type="file"
          accept=".nii,.nii.gz"
          onChange={handleFuncChange}
          className="file-input"
          id="fmri-file"
        />

        <div className="checkbox-row">
          <input
            type="checkbox"
            id="fmri-preprocess"
            checked={doPreprocess}
            onChange={handleToggle}
          />
          <label htmlFor="fmri-preprocess">Preprocess before Diagnosis</label>
        </div>

        {doPreprocess && (
          <div className="input-container">
            <label htmlFor="anat-file" className="input-label">Select an Anatomical MRI file</label>
            <input
              id="anat-file"
              type="file"
              accept=".nii,.nii.gz"
              onChange={handleAnatChange}
              className="file-input"
            />
          </div>
        )}

        <button type="submit" disabled={!funcFile || loading} className="submit-btn">
        {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipLoader color="#ffffff" size={20} />
            Analysis in progress...
            </span>
        ) : (
            'fMRI Analysis'
        )}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="result-box">
          <p><strong>Prediction: </strong>{result.prediction === 1 ? 'Dyslexique (DL)' : 'Typique (TD)'}</p>
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
                    result: result.prediction,
                    doctor_name: doctorName,
                    notes: notes,
                    model_name: "CNN_LSTM-fMRI-v1"
                }),
                });

                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'rapport_fmri.pdf';
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

export default FMRIForm;
