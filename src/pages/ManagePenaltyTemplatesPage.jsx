// src/pages/ManagePenaltyTemplatesPage.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AddPenaltyTemplateModal from '../components/modals/AddPenaltyTemplateModal';
import EditPenaltyTemplateModal from '../components/modals/EditPenaltyTemplateModal';
import '../styles/SharedStyles.css';

export default function ManagePenaltyTemplatesPage() {
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Renombrado de isModalOpen

  // 👇 2. Estados para controlar el modal de EDICIÓN
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTemplateToEdit, setCurrentTemplateToEdit] = useState(null); // Guarda la plantilla a editar

  // Función para cargar las plantillas (sin cambios)
  const fetchPlantillas = async () => {
    setLoading(true);
    try {
      const plantillasSnap = await getDocs(collection(db, "plantillasPenalizacion"));
      setPlantillas(plantillasSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error al obtener plantillas de penalización:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantillas();
  }, []);

  // Función para borrar (sin cambios)
  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres borrar esta plantilla de penalización?")) {
      try {
        await deleteDoc(doc(db, "plantillasPenalizacion", id));
        fetchPlantillas();
      } catch (error) {
        console.error("Error al borrar:", error);
      }
    }
  };

  // 👇 3. Nueva función para ABRIR el modal de EDICIÓN
  const handleOpenEditModal = (template) => {
    setCurrentTemplateToEdit(template); // Guarda la plantilla que se clickeó
    setIsEditModalOpen(true);          // Abre el modal de edición
  };

  // Función para formatear las deducciones (sin cambios)
  const formatDeducciones = (deducciones) => {
    if (!deducciones) return 'N/A';
    return deducciones.map(d => `${d.puntos} pts a ${d.categoriaNombre}`).join(', ');
  };

  if (loading) {
    return <h2>Cargando plantillas de penalización...</h2>;
  }

  return (
    <div className="page-container">
      <div className="page-header-container">
        <h1>Gestionar Penalizaciones</h1>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>+ Crear Penalización</button>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre de la Penalización</th>
              <th>Deducciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {plantillas.map(plantilla => (
              <tr key={plantilla.id}>
                <td>{plantilla.nombre}</td>
                <td>{formatDeducciones(plantilla.deducciones)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleOpenEditModal(plantilla)}
                    style={{ marginRight: '5px' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(plantilla.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para AÑADIR */}
      {isAddModalOpen && (
        <AddPenaltyTemplateModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={fetchPlantillas}
        />
      )}

      {/* 👇 5. Renderiza el modal de EDICIÓN condicionalmente */}
      {isEditModalOpen && currentTemplateToEdit && (
        <EditPenaltyTemplateModal
          templateToEdit={currentTemplateToEdit} // Pasa la plantilla guardada en el estado
          onClose={() => setIsEditModalOpen(false)}
          onSave={fetchPlantillas} // Llama a la misma función para refrescar la lista
        />
      )}
    </div>
  );
}