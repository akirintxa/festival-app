// src/components/templates/CategoryCard.jsx
import React, { useState } from 'react';
import AddSubcategoryModal from '../modals/AddSubcategoryModal';
import AddCriterionModal from '../modals/AddCriterionModal';
import EditTemplateItemModal from '../modals/EditTemplateItemModal'; // Importamos el modal de edición

// --- Componente para Criterio ---
const CriterionItem = ({ criterion, onUpdate, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="criterion-item">
      <span>{criterion.nombre}</span>
      <div className="item-actions">
        <span className="criterion-score">{criterion.puntajeMaximo} pts</span>
        <button onClick={() => setIsEditModalOpen(true)} className="button-action edit">✏️</button>
        <button onClick={onDelete} className="button-action delete">🗑️</button>
      </div>
      {isEditModalOpen && (
        <EditTemplateItemModal
          item={criterion}
          itemType="criterio"
          onSave={onUpdate}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

// --- Componente para Subcategoría ---
const SubcategoryCard = ({ subcategory, onUpdate, onDelete }) => {
  const [isCriterionModalOpen, setIsCriterionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleAddCriterion = (newCriterion) => {
    const updatedCriteria = [...(subcategory.criterios || []), newCriterion];
    onUpdate({ ...subcategory, criterios: updatedCriteria });
    setIsCriterionModalOpen(false);
  };

  const handleUpdateCriterion = (index, updatedCriterion) => {
    const updatedCriteria = [...subcategory.criterios];
    updatedCriteria[index] = updatedCriterion;
    onUpdate({ ...subcategory, criterios: updatedCriteria });
  };

  const handleDeleteCriterion = (index) => {
    if (window.confirm('¿Seguro que quieres eliminar este criterio?')) {
      const updatedCriteria = subcategory.criterios.filter((_, i) => i !== index);
      onUpdate({ ...subcategory, criterios: updatedCriteria });
    }
  };

  return (
    <div className="subcategory-card">
      <div className="card-header">
        <h4>{subcategory.nombre}</h4>
        <div className="item-actions">
            <span>Peso: {subcategory.peso}%</span>
            <button onClick={() => setIsEditModalOpen(true)} className="button-action edit">✏️</button>
            <button onClick={onDelete} className="button-action delete">🗑️</button>
        </div>
      </div>
      <div className="card-content">
        {subcategory.criterios?.map((criterion, index) => (
          <CriterionItem
            key={index}
            criterion={criterion}
            onUpdate={(updatedCriterion) => handleUpdateCriterion(index, updatedCriterion)}
            onDelete={() => handleDeleteCriterion(index)}
          />
        ))}
        <button className="button-add-small" onClick={() => setIsCriterionModalOpen(true)}>+ Añadir Criterio</button>
      </div>
      {isCriterionModalOpen && <AddCriterionModal onSave={handleAddCriterion} onClose={() => setIsCriterionModalOpen(false)} />}
      {isEditModalOpen && <EditTemplateItemModal item={subcategory} itemType="subcategoría" onSave={onUpdate} onClose={() => setIsEditModalOpen(false)} />}
    </div>
  );
};

// --- Componente para Categoría ---
export default function CategoryCard({ category, onUpdate, onDelete }) {
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleAddSubcategory = (newSubcategory) => {
    const updatedSubcategories = [...(category.subcategorias || []), newSubcategory];
    onUpdate({ ...category, subcategorias: updatedSubcategories });
    setIsSubcategoryModalOpen(false);
  };

  const handleUpdateSubcategory = (index, updatedSubcategory) => {
    const updatedSubcategories = [...category.subcategorias];
    updatedSubcategories[index] = updatedSubcategory;
    onUpdate({ ...category, subcategorias: updatedSubcategories });
  };

  const handleDeleteSubcategory = (index) => {
      if(window.confirm('¿Seguro que quieres eliminar esta subcategoría y todos sus criterios?')){
          const updatedSubcategories = category.subcategorias.filter((_, i) => i !== index);
          onUpdate({ ...category, subcategorias: updatedSubcategories });
      }
  };

  return (
    <div className="category-card">
      <div className="card-header">
        <h3>{category.nombre}</h3>
        <div className="item-actions">
            <span>Peso Total: {category.peso}%</span>
            <button onClick={() => setIsEditModalOpen(true)} className="button-action edit">✏️</button>
            <button onClick={onDelete} className="button-action delete">🗑️</button>
        </div>
      </div>
      <div className="card-content">
        {category.subcategorias?.map((subcat, index) => (
          <SubcategoryCard
            key={index}
            subcategory={subcat}
            onUpdate={(updatedSubcat) => handleUpdateSubcategory(index, updatedSubcat)}
            onDelete={() => handleDeleteSubcategory(index)}
          />
        ))}
        <button className="button-add-small" onClick={() => setIsSubcategoryModalOpen(true)}>+ Añadir Subcategoría</button>
      </div>
      {isSubcategoryModalOpen && <AddSubcategoryModal onSave={handleAddSubcategory} onClose={() => setIsSubcategoryModalOpen(false)} />}
      {isEditModalOpen && <EditTemplateItemModal item={category} itemType="categoría" onSave={onUpdate} onClose={() => setIsEditModalOpen(false)} />}
    </div>
  );
}