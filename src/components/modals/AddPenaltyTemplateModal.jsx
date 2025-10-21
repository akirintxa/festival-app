// src/components/modals/AddPenaltyTemplateModal.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import './EditUserRoleModal.css';

export default function AddPenaltyTemplateModal({ onClose, onSave }) {
  const [nombre, setNombre] = useState('');
  const [deducciones, setDeducciones] = useState([]);
  const [error, setError] = useState('');
  const [templateCategories, setTemplateCategories] = useState([]);
  const [loadingTemplate, setLoadingTemplate] = useState(true);

  // Estados para el sub-formulario
  const [selectedCategoria, setSelectedCategoria] = useState(''); // Guardará el objeto {id, nombre}
  const [puntos, setPuntos] = useState(0);

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoadingTemplate(true);
      try {
        const templateSnap = await getDoc(doc(db, "plantillaEvaluacion", "v1"));
        if (templateSnap.exists()) {
          // Guardamos el ID y el Nombre de cada categoría
          const categories = templateSnap.data().categorias.map(cat => ({ id: cat.id, nombre: cat.nombre }));
          setTemplateCategories(categories);
        }
      } catch (err) {
        console.error("Error al cargar categorías de la plantilla:", err);
      } finally {
        setLoadingTemplate(false);
      }
    };
    fetchTemplate();
  }, []);

  const handleAddDeduccion = () => {
    if (!selectedCategoria || puntos === 0) {
      alert("Debes seleccionar una categoría y los puntos (ej. -12).");
      return;
    }
    const catObj = JSON.parse(selectedCategoria);
    setDeducciones([...deducciones, { 
      categoriaId: catObj.id, // 👈 Guardamos el ID
      categoriaNombre: catObj.nombre, // Guardamos el nombre para mostrarlo fácil
      puntos: Number(puntos) 
    }]);
    setSelectedCategoria('');
    setPuntos(0);
  };

  const handleRemoveDeduccion = (index) => {
    setDeducciones(deducciones.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!nombre || deducciones.length === 0) {
      setError('El nombre y al menos una deducción son obligatorios.');
      return;
    }
    try {
      await addDoc(collection(db, "plantillasPenalizacion"), { nombre, deducciones });
      onSave();
      onClose();
    } catch (err) {
      setError('Error al guardar la plantilla: ' + err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Crear Plantilla de Penalización</h2>
        {error && <p className="error-message">{error}</p>}
        
        <div className="form-group">
          <label>Nombre de la Penalización:</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Definir Deducciones:</label>
          <div className="deduccion-list">
            {deducciones.map((d, i) => (
              <div key={i} className="deduccion-item">
                <span>{d.puntos} pts a "{d.categoriaNombre}"</span>
                <button onClick={() => handleRemoveDeduccion(i)}>Quitar</button>
              </div>
            ))}
          </div>
          
          {loadingTemplate ? <p>Cargando categorías...</p> : (
            <div className="deduccion-form">
              <select 
                value={selectedCategoria} 
                onChange={(e) => setSelectedCategoria(e.target.value)}
              >
                <option value="">-- Selecciona Categoría --</option>
                {templateCategories.map(cat => (
                  // Guardamos el objeto entero como string para tener ID y Nombre
                  <option key={cat.id} value={JSON.stringify(cat)}>{cat.nombre}</option>
                ))}
              </select>
              <input type="number" placeholder="-12" value={puntos} onChange={(e) => setPuntos(e.target.value)} />
              <button type="button" onClick={handleAddDeduccion} className="button-add-small">Añadir</button>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="button-cancel">Cancelar</button>
          <button onClick={handleSave} className="button-save">Guardar Plantilla</button>
        </div>
      </div>
    </div>
  );
}