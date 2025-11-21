// src/pages/JuezDashboard.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
// --- 1. Importar iconos ---
import { BsCalendarEvent } from "react-icons/bs";
import { IoMdLogOut } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import '../styles/SharedStyles.css';
import './JuezDashboard.css';

// --- 2. Helper para formatear el estatus ---
const formatStatus = (status) => {
  if (!status) return '';
  // Reemplaza 'en-revision' por 'En Revisión'
  const formatted = status.replace('-', ' ');
  // Pone en mayúscula la primera letra de cada palabra
  return formatted.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function JuezDashboard() {
  const [assignedFestivals, setAssignedFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedFestivals = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const assignmentsQuery = query(
          collection(db, "festivales"),
          where("juecesAsignadosIds", "array-contains", currentUser.uid)
        );

        const querySnapshot = await getDocs(assignmentsQuery);
        const festivals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Ordenar festivales por fecha, los más nuevos primero
        festivals.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setAssignedFestivals(festivals);

      } catch (error) {
        console.error("Error al obtener los festivales asignados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedFestivals();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Fallo al cerrar sesión', error);
    }
  };

  if (loading) {
    return <div className="dashboard-container"><h2>Cargando tus festivales...</h2></div>;
  }

  return (
    <div className="juez-dashboard-container">
      <div className="juez-header">
        <div className="header-info">
          <h1>Mis Festivales</h1>
          <span className="judge-name-display">{userProfile?.nombre || userProfile?.email}</span>
        </div>
        {/* --- 3. Añadir icono al botón --- */}
        <button onClick={handleLogout} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IoMdLogOut /> Cerrar Sesión
        </button>
      </div>

      {assignedFestivals.length > 0 ? (
        <div className="data-grid">
          {assignedFestivals.map(festival => (
            <Link to={`/festival/${festival.id}`} key={festival.id} className="data-card" style={{ borderLeft: '4px solid #007aff', textDecoration: 'none', color: 'inherit' }}>

              {/* --- 4. Contenido principal de la tarjeta --- */}
              <div className="data-card-body">
                <h3>{festival.nombre}</h3>
                <p className="card-date">
                  <BsCalendarEvent />
                  {new Date(festival.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                </p>
              </div>

              {/* --- 5. Pie de la tarjeta (estatus y flecha) --- */}
              <div className="data-card-footer" style={{ justifyContent: 'space-between' }}>
                <span className={`status-badge status-${festival.estatus}`}>
                  {formatStatus(festival.estatus)}
                </span>
                <span className="card-arrow">
                  <IoIosArrowForward />
                </span>
              </div>

            </Link>
          ))}
        </div>
      ) : (
        <div className="no-festivals-message">
          <h2>¡Bienvenido!</h2>
          <p>Aún no has sido asignado a ningún festival. Por favor, contacta a un administrador.</p>
        </div>
      )}
    </div>
  );
}