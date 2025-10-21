// src/pages/DashboardPage.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Fallo al cerrar sesión', error);
    }
  };

  return (
    <div>
      <h1>¡Bienvenido al Dashboard!</h1>
      <p><strong>Correo:</strong> {currentUser?.email}</p>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
}