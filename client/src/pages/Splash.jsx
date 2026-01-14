import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Splash.css';

const Splash = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    // Navigăm după 3 secunde
    const timer = setTimeout(() => {
      navigate('/landing');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Setăm dimensiunile
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const fontSize = 14; 
    const columns = canvas.width / fontSize;

    const drops = [];
    // AICI ESTE SCHIMBAREA PENTRU EFECTUL DE "SEPARARE"
    for (let i = 0; i < columns; i++) {
      // Setăm o poziție de start aleatorie între -100 și 0
      // Valorile negative înseamnă că sunt deasupra ecranului și vor intra pe rând
      drops[i] = Math.floor(Math.random() * -100);
    }

    const draw = () => {
      // 1. Efectul de ștergere (FADE) - Alb semi-transparent
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // Puțin mai opac pentru curățare rapidă
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Culoarea textului - Gri FOARTE deschis
      ctx.fillStyle = '#d1d1d1'; // Un gri foarte deschis, subtil
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        // Alegem un caracter random
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        
        // Desenăm caracterul doar dacă a ajuns pe ecran (y > 0)
        // Asta previne desenarea deasupra canvasului
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Resetăm picătura când ajunge jos, cu un element de random
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        // Incrementăm poziția Y
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35); // Viteza animației

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="splash-container">
      <canvas ref={canvasRef} className="matrix-canvas"></canvas>
      <div className="loading-text">LOADING...</div>
    </div>
  );
};

export default Splash;