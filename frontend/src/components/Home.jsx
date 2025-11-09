import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleStartDiagnosis = () => {
    navigate('/dyslexia-check');
  };

  return (
    <div className="home-container">
      <section className="cta-section">
        <div className="cta-content">
          <h2>Start a new diagnosis</h2>
          <p>Get an MRI or fMRI to check for potential dyslexia.</p>
          <button onClick={handleStartDiagnosis} className="cta-button">
            Start a new Diagnosis
          </button>
        </div>
      </section>

      
    </div>
  );
}

export default Home;
