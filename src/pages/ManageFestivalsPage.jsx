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