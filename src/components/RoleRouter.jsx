// src/components/RoleRouter.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import JuezDashboard from '../pages/JuezDashboard';

export default function RoleRouter() {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <h1>Cargando perfil de usuario...</h1>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!userProfile) {
    console.error("Usuario autenticado pero sin perfil encontrado en RoleRouter.");
    return <h1>Error: Perfil de usuario no encontrado. Contacta al soporte.</h1>;
  }

  // --- SWITCH SIMPLIFICADO ---
  switch (userProfile.rol) {
    case 'superadmin':
      // Redirige al dashboard de superadmin
      return <Navigate to="/superadmin/festivales" replace />;

    case 'juez':
      // Muestra el dashboard del juez en la ruta raíz
      return <JuezDashboard />;

    default:
      // Cualquier otro rol (incluyendo 'admin' si quedó alguno)
      // se tratará como un Juez o se enviará a login.
      console.warn(`Rol no reconocido: ${userProfile.rol}, mostrando JuezDashboard.`);
      return <JuezDashboard />;
    // O si prefieres más seguridad:
    // return <Navigate to="/login" replace />;
  }
  // --- FIN SWITCH ---
}