// src/layouts/SuperAdminLayout.jsx
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SuperAdminLayout.css'; // Crearemos este archivo CSS ahora

const Sidebar = () => {
  const { logout } = useAuth();
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
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Panel Superadmin</h3>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/superadmin/festivales">Festivales</NavLink>
        <NavLink to="/superadmin/usuarios">Usuarios</NavLink>
        <NavLink to="/superadmin/plantillas">Plantilla de Evaluación</NavLink>
        <NavLink to="/superadmin/penalizaciones">Penalizaciones</NavLink>
        <NavLink to="/superadmin/dashboard">Dashboard</NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default function SuperAdminLayout() {
  return (
    <div className="superadmin-layout">
      <Sidebar />
      <main className="superadmin-content">
        <Outlet /> {/* Aquí se renderizará el contenido de la ruta activa */}
      </main>
    </div>
  );
}