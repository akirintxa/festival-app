// src/pages/ManageFestivalsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AddFestivalModal from '../components/modals/AddFestivalModal';
import '../styles/SharedStyles.css';

export default function ManageFestivalsPage() {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFestivals = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'festivales'));
      const festivalsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Ordenar festivales
      const statusPriority = {
        'activo': 1,
        'en_revision': 2,
        'proximo': 3,
        'finalizado': 4
      };

      festivalsList.sort((a, b) => {
        const priorityA = statusPriority[a.estatus] || 99;
        const priorityB = statusPriority[b.estatus] || 99;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Mismo estatus, ordenar por fecha
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);

        if (a.estatus === 'proximo') {
          // Ascendente (el más cercano primero)
          return dateA - dateB;
        } else {
          // Descendente (el más reciente primero) para activos, revisión y finalizados
          return dateB - dateA;
        }
      });

      setFestivals(festivalsList);
    } catch (error) {
      console.error("Error al obtener los festivales: ", error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  const handleCreateFestival = async (festivalData) => {
    try {
      await addDoc(collection(db, "festivales"), festivalData);
      setIsModalOpen(false);
      fetchFestivals();
    } catch (error) { // 👇 ARREGLO: Añadidas las llaves que faltaban
      console.error("Error al crear el festival: ", error);
      alert('Hubo un error al crear el festival.');
    }
  };

  const handleDeleteFestival = async (festivalId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este festival? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      // 1. Verificar si hay votos asociados
      const votesQuery = query(collection(db, "evaluaciones"), where("festivalId", "==", festivalId));
      const votesSnapshot = await getDocs(votesQuery);

      if (!votesSnapshot.empty) {
        alert("No se puede eliminar este festival porque ya tiene votos registrados. Esto causaría pérdida de datos.");
        return;
      }

      // 2. Si no hay votos, proceder a eliminar
      await deleteDoc(doc(db, "festivales", festivalId));

      // 3. Actualizar la lista local
      setFestivals(festivals.filter(f => f.id !== festivalId));
      alert("Festival eliminado correctamente.");

    } catch (error) {
      console.error("Error al eliminar el festival:", error);
      alert("Hubo un error al intentar eliminar el festival.");
    }
  };

  if (loading) {
    return <h2>Cargando lista de festivales...</h2>;
  }

  return (
    <div className="page-container">
      <div className="page-header-container">
        <h1>Gestionar Festivales</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Crear Festival
        </button>
      </div>

      <div className="data-grid">
        {festivals.map(festival => (
          <div key={festival.id} className="data-card">
            <div className="data-card-header">
              <h3>{festival.nombre}</h3>
              <span className={`status-badge status-${festival.estatus}`}>
                {festival.estatus}
              </span>
            </div>
            <div className="data-card-body">
              <p><strong>Fecha:</strong> {new Date(festival.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
              <p><strong>Lugar:</strong> {festival.lugar}</p>
              <p><strong>Colegios invitados:</strong> {festival.colegios?.length || 0}</p>
              {festival.estatus === 'finalizado' && festival.ganador && (
                <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#0284c7', fontWeight: 'bold' }}>🏆 Mejor agrupación:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f172a' }}>{festival.ganador.nombre}</span>
                </div>
              )}
            </div>
            <div className="data-card-footer">
              <Link to={`/superadmin/festival/${festival.id}`} className="btn btn-sm btn-outline-primary">
                Gestionar
              </Link>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteFestival(festival.id)}
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <AddFestivalModal
          onSave={handleCreateFestival}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}