import React, { useState } from 'react';
import axios from 'axios';
import "../assets/css/LoginPage.css"; // custom styles
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });
      setMessage(response.data.message);
      setError(false);
      navigate('/*');
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.error);
        setError(true);
      } else {
        setMessage('Erreur serveur.');
        setError(true);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="decor-left"></div>
      <div className="decor-right"></div>
      <div className="login-box">
        <h2>Login</h2>

        {message && (
          <div className={`message ${error ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email ID or Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>

          <div className="login-actions">
            <button type="submit">Login</button>
            <a href="#">Forgot password?</a>
          </div>

          <p className="create-account">
            Don’t have an account? <a href="#">Create new</a>
          </p>

          <div className="divider">Or Login with</div>

          <button type="button" className="google-btn">
            <img
              src="https://img.icons8.com/color/16/000000/google-logo.png"
              alt="Google"
            />
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
