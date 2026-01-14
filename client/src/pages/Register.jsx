import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Parolele nu coincid!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Eroare la înregistrare');
      }
    } catch {
      setError('Nu s-a putut conecta la server.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Creează Cont</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          {/* AICI ESTE MODIFICAREA: Username în loc de Email */}
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

        <div className="form-group">
          <label>Confirmă Parola</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
            placeholder="******"
          />
        </div>

        <button type="submit" className="btn-auth">Înregistrează-te</button>
      </form>

      <p className="switch-auth">
        Ai deja cont? <span onClick={() => navigate('/login')}>Autentifică-te</span>
      </p>
    </div>
  );
};

export default Register;