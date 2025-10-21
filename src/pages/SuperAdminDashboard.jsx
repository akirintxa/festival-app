import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function SuperAdminDashboard() {
  const { logout } = useAuth();
  return (
    <div className="dashboard-container">
      <h1>Panel del Superadministrador</h1>
      <p>Aquí gestionarás toda la aplicación.</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}