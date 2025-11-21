// src/components/modals/EditFestivalModal.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './EditUserRoleModal.css'; // Reutilizamos estilos

export default function EditFestivalModal({ festival, onSave, onClose }) {
  // Inicializamos el estado con los datos existentes del festival
  const [nombre, setNombre] = useState(festival.nombre);
  const [fecha, setFecha] = useState(festival.fecha);
  const [lugar, setLugar] = useState(festival.lugar);
  const [plantillaId, setPlantillaId] = useState(festival.plantillaId || '');
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'plantillaEvaluacion'));
        const templatesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          nombre: doc.data().nombre || `Plantilla sin nombre (${doc.id})`
        }));
        setTemplates(templatesList);
      } catch (error) {
        console.error("Error al cargar plantillas:", error);
      }
    };
    fetchTemplates();
  }, []);

  const handleSave = () => {
    if (!nombre || !fecha || !lugar || !plantillaId) {
      setError('Todos los campos son obligatorios, incluyendo la plantilla.');
      return;
    }

    const selectedTemplate = templates.find(t => t.id === plantillaId);

    // Pasamos solo los datos que pueden cambiar
    onSave({
      nombre,
      fecha,
      lugar,
      plantillaId,
      plantillaNombre: selectedTemplate?.nombre || 'Desconocida'
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Editar Festival</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Nombre del Festival:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Lugar:</label>
          <input
            type="text"
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Plantilla de Evaluación:</label>
          <select
            value={plantillaId}
            onChange={(e) => setPlantillaId(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">-- Seleccionar Plantilla --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="button-cancel">Cancelar</button>
          <button onClick={handleSave} className="button-save">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
}