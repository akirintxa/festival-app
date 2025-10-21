// src/components/modals/EditPenaltyTemplateModal.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Importamos updateDoc
import './EditUserRoleModal.css'; // Reutilizamos estilos

// Recibe la plantilla a editar (templateToEdit)
export default function EditPenaltyTemplateModal({ templateToEdit, onClose, onSave }) {
  
  // Pre-llenamos los campos con los datos de la plantilla existente
  const [nombre, setNombre] = useState(templateToEdit.nombre);
  const [deducciones, setDeducciones] = useState(templateToEdit.deducciones);
  
  const [error, setError] = useState('');
  const [templateCategories, setTemplateCategories] = useState([]);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [puntos, setPuntos] = useState(0);

  // Carga las categorías de la plantilla de evaluación (igual que en AddModal)
  useEffect(() => {
    const fetchTemplate = async () => {
      setLoadingTemplate(true);
      try {
        const templateSnap = await getDoc(doc(db, "plantillaEvaluacion", "v1"));
        if (templateSnap.exists()) {
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

  // Funciones para manejar las deducciones (igual que en AddModal)
  const handleAddDeduccion = () => {
    if (!selectedCategoria || puntos === 0) {
      alert("Debes seleccionar una categoría y los puntos (ej. -12).");
      return;
    }
    const catObj = JSON.parse(selectedCategoria);
    setDeducciones([...deducciones, { 
      categoriaId: catObj.id,
      categoriaNombre: catObj.nombre,
      puntos: Number(puntos) 
    }]);
    setSelectedCategoria('');
    setPuntos(0);
  };

  const handleRemoveDeduccion = (index) => {
    setDeducciones(deducciones.filter((_, i) => i !== index));
  };

  // Función de guardado (usa updateDoc)
  const handleSave = async () => {
    if (!nombre || deducciones.length === 0) {
      setError('El nombre y al menos una deducción son obligatorios.');
      return;
    }
    try {
      // Apunta al documento específico usando el ID de templateToEdit
      const templateDocRef = doc(db, "plantillasPenalizacion", templateToEdit.id);
      // Actualiza el documento con los nuevos datos
      await updateDoc(templateDocRef, { nombre, deducciones });
      
      onSave(); // Refresca la lista en la página padre
      onClose();
    } catch (err) {
      setError('Error al actualizar la plantilla: ' + err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Editar Plantilla de Penalización</h2> {/* Título cambiado */}
        {error && <p className="error-message">{error}</p>}
        
        <div className="form-group">
          <label>Nombre de la Penalización:</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>

        {/* El resto del formulario es idéntico al de Añadir */}
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
          <button onClick={handleSave} className="button-save">Guardar Cambios</button> {/* Texto del botón cambiado */}
        </div>
      </div>
    </div>
  );
}