import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  // Folosim 'username' în loc de 'email'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Trimitem username și parola la server
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Salvăm token-ul și ID-ul
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        
        // Mergem la pagina principală
        navigate('/landing');
      } else {
        setError(data.message || 'Eroare la autentificare');
      }
    } catch (err) {
      console.error(err);
      setError('Nu s-a putut conecta la server.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Autentificare</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          {/* AICI ESTE SCHIMBAREA: Username */}
          <label>Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
            placeholder="NumeUtilizator"
          />
        </div>

        <div className="form-group">
          <label>Parolă</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            placeholder="******"
          />
        </div>

        <button type="submit" className="btn-auth">Intră în cont</button>
      </form>

      <p className="switch-auth">
        Nu ai cont? <span onClick={() => navigate('/register')}>Înregistrează-te</span>
      </p>
    </div>
  );
};

export default Login;