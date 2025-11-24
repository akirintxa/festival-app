// src/components/modals/AssignJudgeModal.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './EditUserRoleModal.css';

export default function AssignJudgeModal({ onSave, onClose, alreadyAssignedIds, existingAssignments = [], plantilla }) {
  const [allJudges, setAllJudges] = useState([]);
  // const [template, setTemplate] = useState(null); // Ya no necesitamos estado local para template
  const [selectedJudgeId, setSelectedJudgeId] = useState('');
  const [assignedSubcatIds, setAssignedSubcatIds] = useState(existingAssignments);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // 1. Obtener jueces
      const judgesQuery = query(collection(db, "usuarios"), where("rol", "==", "juez"));
      const judgesSnap = await getDocs(judgesQuery);
      const availableJudges = judgesSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(j => !alreadyAssignedIds.includes(j.id));
      setAllJudges(availableJudges);
    };
    fetchData();
  }, [alreadyAssignedIds]);

  const handleSubcategoryToggle = (subcategoryId) => {
    setAssignedSubcatIds(prev =>
      prev.includes(subcategoryId)
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const handleSave = () => {
    if (!selectedJudgeId || assignedSubcatIds.length === 0) {
      setError('Debes seleccionar un juez y al menos una subcategoría.');
      return;
    }
    const selectedJudge = allJudges.find(j => j.id === selectedJudgeId);

    const assignedSubcatNames = plantilla.categorias
      .flatMap(c => c.subcategorias)
      .filter(sc => assignedSubcatIds.includes(sc.id))
      .map(sc => sc.nombre);

    onSave({
      juezId: selectedJudge.id,
      nombre: selectedJudge.nombre,
      email: selectedJudge.email,
      subcategoriasAsignadasIds: assignedSubcatIds, // 👈 El campo ID
      subcategoriasAsignadas: assignedSubcatNames, // El campo Nombre (para UI)
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Asignar Juez a Festival</h2>
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Seleccionar Juez:</label>
          <select value={selectedJudgeId} onChange={(e) => setSelectedJudgeId(e.target.value)}>
            <option value="">-- Elige un juez --</option>
            {allJudges.map(judge => (
              <option key={judge.id} value={judge.id}>{judge.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Asignar Subcategorías a Evaluar:</label>
          {plantilla?.categorias.map(cat => (
            <div key={cat.id} className="category-group">
              <h4>{cat.nombre}</h4>
              <div className="checkbox-group">
                {cat.subcategorias.map(subcat => (
                  <div key={subcat.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`subcat-${subcat.id}`}
                      checked={assignedSubcatIds.includes(subcat.id)}
                      onChange={() => handleSubcategoryToggle(subcat.id)}
                    />
                    <label htmlFor={`subcat-${subcat.id}`}>{subcat.nombre}</label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="button-cancel">Cancelar</button>
          <button onClick={handleSave} className="button-save">Asignar</button>
        </div>
      </div>
    </div>
  );
}