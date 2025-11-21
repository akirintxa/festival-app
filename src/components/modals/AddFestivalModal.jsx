// src/components/modals/AddFestivalModal.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import '../modals/Modal.css';

export default function AddFestivalModal({ onSave, onClose }) {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('');
  const [plantillaId, setPlantillaId] = useState('');
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'plantillaEvaluacion'));
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          nombre: doc.data().nombre || `Plantilla (${doc.id})`
        }));
        setTemplates(list);

        // Seleccionar la primera por defecto si existe
        if (list.length > 0) {
          setPlantillaId(list[0].id);
        }
      } catch (error) {
        console.error("Error cargando plantillas:", error);
      }
    };
    fetchTemplates();
  }, []);

  const handleSave = () => {
    if (!nombre || !fecha || !lugar || !plantillaId) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    const selectedTemplate = templates.find(t => t.id === plantillaId);

    onSave({
      nombre,
      fecha,
      lugar,
      estatus: 'proximo',
      plantillaId,
      plantillaNombre: selectedTemplate?.nombre || 'Desconocida'
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Nuevo Festival</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label>Nombre del Festival:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Festival de Gaitas 2025"
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
              placeholder="Ej. Aula Magna"
            />
          </div>

          <div className="form-group">
            <label>Plantilla de Evaluación:</label>
            <select
              value={plantillaId}
              onChange={(e) => setPlantillaId(e.target.value)}
            >
              <option value="" disabled>Selecciona una plantilla</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">Cancelar</button>
          <button onClick={handleSave} className="btn btn-primary">Crear</button>
        </div>
      </div>
    </div>
  );
}