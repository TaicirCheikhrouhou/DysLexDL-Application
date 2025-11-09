import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AnalyzeForm from './components/AnalyzeForm'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/*" element={<Dashboard />} />
        <Route path="/dyslexia-check" element={<AnalyzeForm />} />
      </Routes>
    </Router>
  );
}

export default App;
