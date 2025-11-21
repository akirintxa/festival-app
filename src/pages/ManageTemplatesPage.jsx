// src/pages/ManageTemplatesPage.jsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import CategoryCard from '../components/templates/CategoryCard';
import AddCategoryModal from '../components/modals/AddCategoryModal';
import AddPenaltyRuleModal from '../components/modals/AddPenaltyRuleModal';
import AddTemplateModal from '../components/modals/AddTemplateModal';
import '../styles/SharedStyles.css';

export default function ManageTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'plantillaEvaluacion'));
      const templatesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre || `Plantilla sin nombre(${doc.id})`,
        ...doc.data()
      }));
      setTemplates(templatesList);
    } catch (error) {
      console.error("Error al obtener las plantillas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (name, sourceId) => {
    try {
      let initialCategories = [];
      let initialPenalties = [];

      if (sourceId) {
        const sourceTemplate = templates.find(t => t.id === sourceId);
        if (sourceTemplate) {
          if (sourceTemplate.categorias) {
            initialCategories = JSON.parse(JSON.stringify(sourceTemplate.categorias));
          }
          if (sourceTemplate.penalizaciones) {
            initialPenalties = JSON.parse(JSON.stringify(sourceTemplate.penalizaciones));
          }
        }
      }

      const newTemplateData = {
        nombre: name,
        categorias: initialCategories,
        penalizaciones: initialPenalties
      };
      const docRef = await addDoc(collection(db, 'plantillaEvaluacion'), newTemplateData);

      const newTemplate = { id: docRef.id, ...newTemplateData };
      setTemplates([...templates, newTemplate]);
      setSelectedTemplate(newTemplate);
      setIsCreating(false);
    } catch (error) {
      console.error("Error al crear plantilla:", error);
      alert("Error al crear la plantilla.");
    }
  };

  const handleDeleteTemplate = async (e, templateId) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de eliminar esta plantilla?')) return;

    try {
      const festivalsQuery = query(collection(db, 'festivales'), where('plantillaId', '==', templateId));
      const festivalsSnapshot = await getDocs(festivalsQuery);

      if (!festivalsSnapshot.empty) {
        alert('No se puede eliminar esta plantilla porque está asignada a uno o más festivales.');
        return;
      }

      await deleteDoc(doc(db, 'plantillaEvaluacion', templateId));
      setTemplates(templates.filter(t => t.id !== templateId));
      if (selectedTemplate?.id === templateId) setSelectedTemplate(null);
    } catch (error) {
      console.error("Error al eliminar plantilla:", error);
      alert("Error al eliminar.");
    }
  };

  const handleAddCategory = (newCategory) => {
    const updatedCategories = [...(selectedTemplate.categorias || []), newCategory];
    setSelectedTemplate({ ...selectedTemplate, categorias: updatedCategories });
    setIsModalOpen(false);
  };

  const handleDeleteCategory = (categoryIndex) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría y todo su contenido?')) {
      const updatedCategories = selectedTemplate.categorias.filter((_, index) => index !== categoryIndex);
      setSelectedTemplate({ ...selectedTemplate, categorias: updatedCategories });
    }
  };

  const handleUpdateCategory = (categoryIndex, updatedCategory) => {
    const updatedCategories = [...selectedTemplate.categorias];
    updatedCategories[categoryIndex] = updatedCategory;
    setSelectedTemplate({ ...selectedTemplate, categorias: updatedCategories });
  };

  const handleAddPenalty = (newPenalty) => {
    const updatedPenalties = [...(selectedTemplate.penalizaciones || []), newPenalty];
    setSelectedTemplate({ ...selectedTemplate, penalizaciones: updatedPenalties });
    setIsPenaltyModalOpen(false);
  };

  const handleDeletePenalty = (penaltyIndex) => {
    if (window.confirm('¿Estás seguro de eliminar esta regla de penalización?')) {
      const updatedPenalties = selectedTemplate.penalizaciones.filter((_, index) => index !== penaltyIndex);
      setSelectedTemplate({ ...selectedTemplate, penalizaciones: updatedPenalties });
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedTemplate) return;

    const totalCategoryWeight = (selectedTemplate.categorias || []).reduce((sum, cat) => sum + (Number(cat.peso) || 0), 0);
    if (totalCategoryWeight !== 100) {
      alert(`Error: La suma de los pesos de las categorías es ${totalCategoryWeight}%. Debe ser exactamente 100%.`);
      return;
    }

    for (const cat of (selectedTemplate.categorias || [])) {
      if (cat.subcategorias && cat.subcategorias.length > 0) {
        const totalSubcatWeight = cat.subcategorias.reduce((sum, sub) => sum + (Number(sub.peso) || 0), 0);
        if (totalSubcatWeight !== 100) {
          alert(`Error en categoría "${cat.nombre}": La suma de los pesos de las subcategorías es ${totalSubcatWeight}%. Debe ser exactamente 100%.`);
          return;
        }
      }
    }

    try {
      const templateDocRef = doc(db, 'plantillaEvaluacion', selectedTemplate.id);
      await setDoc(templateDocRef, selectedTemplate);
      alert('¡Plantilla guardada con éxito!');
      setTemplates(templates.map(t => t.id === selectedTemplate.id ? selectedTemplate : t));
    } catch (error) {
      console.error("Error al guardar la plantilla:", error);
      alert('Hubo un error al guardar la plantilla.');
    }
  };

  if (loading) {
    return <div className="page-container"><h2>Cargando plantillas...</h2></div>;
  }

  // --- VISTA: LISTA DE PLANTILLAS ---
  if (!selectedTemplate) {
    return (
      <div className="page-container">
        <div className="page-header-container">
          <h1>Plantillas de Evaluación</h1>
          <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
            + Nueva Plantilla
          </button>
        </div>

        {isCreating && (
          <AddTemplateModal
            templates={templates}
            onSave={handleCreateTemplate}
            onClose={() => setIsCreating(false)}
          />
        )}

        <div className="data-grid">
          {templates.map(template => (
            <div
              key={template.id}
              className="data-card"
              onClick={() => setSelectedTemplate(template)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            >
              <div className="data-card-header">
                <h3>{template.nombre}</h3>
              </div>
              <div className="data-card-body">
                <p><strong>Categorías:</strong> {template.categorias?.length || 0}</p>
                <p style={{ fontSize: '0.8rem', color: '#888' }}>ID: {template.id}</p>
              </div>
              <div className="data-card-footer">
                <button className="btn btn-sm btn-outline-primary">Editar</button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={(e) => handleDeleteTemplate(e, template.id)}
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VISTA: EDITOR DE PLANTILLA (Detalle) ---
  return (
    <div className="page-container">
      <div className="page-header-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="btn btn-secondary" onClick={() => setSelectedTemplate(null)}>
            ← Volver
          </button>
          <div>
            <h1 style={{ margin: 0 }}>{selectedTemplate.nombre}</h1>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>Editando plantilla</span>
          </div>
        </div>
        <button className="btn btn-success" onClick={handleSaveChanges}>
          Guardar Cambios
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

        {/* SECCIÓN 1: CATEGORÍAS DE EVALUACIÓN */}
        <div>
          <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>1. Criterios de Evaluación</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {selectedTemplate.categorias && selectedTemplate.categorias.length > 0 ? (
              selectedTemplate.categorias.map((category, index) => (
                <CategoryCard
                  key={index}
                  category={category}
                  onUpdate={(updatedCategory) => handleUpdateCategory(index, updatedCategory)}
                  onDelete={() => handleDeleteCategory(index)}
                />
              ))
            ) : (
              <p className="no-data-message">Esta plantilla aún no tiene categorías.</p>
            )}

            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ width: '100%' }}>
              + Añadir Nueva Categoría
            </button>
          </div>
        </div>

        {/* SECCIÓN 2: REGLAS DE PENALIZACIÓN */}
        <div>
          <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>2. Reglas de Penalización</h2>
          <div className="data-grid">
            {selectedTemplate.penalizaciones && selectedTemplate.penalizaciones.length > 0 ? (
              selectedTemplate.penalizaciones.map((penalty, index) => (
                <div key={index} className="data-card" style={{ cursor: 'default' }}>
                  <div className="data-card-header">
                    <h3>{penalty.nombre}</h3>
                  </div>
                  <div className="data-card-body">
                    <p>{penalty.descripcion || 'Sin descripción'}</p>
                    <ul style={{ marginTop: '10px', paddingLeft: '20px', fontSize: '0.9rem' }}>
                      {penalty.deducciones.map((d, i) => (
                        <li key={i}>
                          <strong>-{d.puntos} pts</strong> en <em>{d.categoriaNombre}</em>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="data-card-footer">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeletePenalty(index)}
                    >
                      Eliminar Regla
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data-message" style={{ gridColumn: '1 / -1' }}>No hay reglas de penalización definidas.</p>
            )}
          </div>
          <button className="btn btn-secondary" onClick={() => setIsPenaltyModalOpen(true)} style={{ width: '100%', marginTop: '20px' }}>
            + Añadir Regla de Penalización
          </button>
        </div>

      </div>

      {isModalOpen && (
        <AddCategoryModal
          onSave={handleAddCategory}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isPenaltyModalOpen && (
        <AddPenaltyRuleModal
          categories={selectedTemplate.categorias || []}
          onSave={handleAddPenalty}
          onClose={() => setIsPenaltyModalOpen(false)}
        />
      )}
    </div>
  );
}