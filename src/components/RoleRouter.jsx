// src/components/RoleRouter.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import JuezDashboard from '../pages/JuezDashboard';

export default function RoleRouter() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <h1>Cargando perfil...</h1>;
  }

  switch (userProfile.rol) {
    case 'superadmin':
      return <Navigate to="/superadmin/festivales" />; // <-- LÍNEA NUEVA

    case 'juez':
      return <JuezDashboard />;
    // case 'admin': ...
    default:
      return <h1>Acceso Denegado</h1>;
  }
}