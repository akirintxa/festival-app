// src/pages/ManageFestivalsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AddFestivalModal from '../components/modals/AddFestivalModal';
import './ManageFestivalsPage.css';

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
        if(loading) setLoading(false);
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

  if (loading) {
    return <h2>Cargando festivales...</h2>;
  }

  return (
    <div className="manage-festivals-container">
      <div className="page-header">
        <h1>Gestionar Festivales</h1>
        <button className="create-festival-button" onClick={() => setIsModalOpen(true)}>
          + Crear Festival
        </button>
      </div>

      <div className="festivals-list">
        {festivals.map(festival => (
          <div key={festival.id} className="festival-card">
            <div className="festival-card-header">
              <h3>{festival.nombre}</h3>
              <span className={`status-badge status-${festival.estatus}`}>
                {festival.estatus}
              </span>
            </div>
            <div className="festival-card-body">
              <p><strong>Fecha:</strong> {new Date(festival.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
              <p><strong>Lugar:</strong> {festival.lugar}</p>
            </div>
            <div className="festival-card-footer">
              <Link to={`/superadmin/festival/${festival.id}`} className="manage-button">
                Gestionar
              </Link>
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