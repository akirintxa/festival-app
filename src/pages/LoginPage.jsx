// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      // 👇 Redirigimos a la ruta principal para que RoleRouter decida qué mostrar
      navigate('/');
    } catch (err) {
      setError('Fallo al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="form-container">
      <h1 className="main-title">Sistema de Votación para Festivales Gaiteros</h1>
      <h2>Iniciar Sesión</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Ingresar</button>
      </form>
      <p className="form-switch-link">
        ¿Quieres ser juez? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
}