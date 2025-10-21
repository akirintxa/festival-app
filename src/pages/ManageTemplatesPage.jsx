// src/pages/ManageTemplatesPage.jsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import CategoryCard from '../components/templates/CategoryCard';
import AddCategoryModal from '../components/modals/AddCategoryModal';
import './ManageTemplatesPage.css';

export default function ManageTemplatesPage() {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const templateId = "v1";

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      try {
        const templateDocRef = doc(db, 'plantillaEvaluacion', templateId);
        const docSnap = await getDoc(templateDocRef);
        if (docSnap.exists()) {
          setTemplate(docSnap.data());
        } else {
          setTemplate({ categorias: [] });
        }
      } catch (error) {
        console.error("Error al obtener la plantilla:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, []);

  const handleAddCategory = (newCategory) => {
    const updatedCategories = [...(template.categorias || []), newCategory];
    setTemplate({ ...template, categorias: updatedCategories });
    setIsModalOpen(false);
  };

  const handleDeleteCategory = (categoryIndex) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría y todo su contenido?')) {
      const updatedCategories = template.categorias.filter((_, index) => index !== categoryIndex);
      setTemplate({ ...template, categorias: updatedCategories });
    }
  };

  const handleSaveChanges = async () => {
    try {
      const templateDocRef = doc(db, 'plantillaEvaluacion', templateId);
      await setDoc(templateDocRef, template);
      alert('¡Plantilla guardada con éxito!');
    } catch (error) {
      console.error("Error al guardar la plantilla:", error);
      alert('Hubo un error al guardar la plantilla.');
    }
  };

  const handleUpdateCategory = (categoryIndex, updatedCategory) => {
    const updatedCategories = [...template.categorias];
    updatedCategories[categoryIndex] = updatedCategory;
    setTemplate({ ...template, categorias: updatedCategories });
  };

  if (loading) {
    return <h2>Cargando plantilla de evaluación...</h2>;
  }

  return (
    <div className="manage-templates-container">
      <div className="page-header">
        <h1>Gestionar Plantilla de Evaluación</h1>
        <button className="save-template-button" onClick={handleSaveChanges}>
          Guardar Cambios
        </button>
      </div>

      <div className="categories-list">
        {template && Array.isArray(template.categorias) ? (
          template.categorias.map((category, index) => (
            <CategoryCard
              key={index}
              category={category}
              // 👇 ARREGLO: El nombre de la prop ahora es 'onUpdate'
              onUpdate={(updatedCategory) => handleUpdateCategory(index, updatedCategory)}
              onDelete={() => handleDeleteCategory(index)}
            />
          ))
        ) : (
          <p>No hay categorías definidas en la plantilla.</p>
        )}
        <button className="button-add-full" onClick={() => setIsModalOpen(true)}>
          + Añadir Nueva Categoría
        </button>
      </div>

      {isModalOpen && (
        <AddCategoryModal 
          onSave={handleAddCategory} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}