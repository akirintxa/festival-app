// src/components/templates/CategoryCard.jsx
import React, { useState } from 'react';
import AddSubcategoryModal from '../modals/AddSubcategoryModal';
import AddCriterionModal from '../modals/AddCriterionModal';
import EditTemplateItemModal from '../modals/EditTemplateItemModal';
import '../../styles/SharedStyles.css';

// --- Componente para Criterio ---
const CriterionItem = ({ criterion, onUpdate, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '5px' }}>
      <span>{criterion.nombre}</span>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', color: '#007aff' }}>{criterion.puntajeMaximo} pts</span>
        <button onClick={() => setIsEditModalOpen(true)} className="btn btn-sm btn-outline-primary">Editar</button>
        <button onClick={onDelete} className="btn btn-sm btn-danger">Borrar</button>
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
    <div className="data-card" style={{ marginBottom: '15px', border: '1px solid #dee2e6', boxShadow: 'none' }}>
      <div className="data-card-header" style={{ backgroundColor: '#f1f3f5' }}>
        <h4>{subcategory.nombre}</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontWeight: '500', color: '#555' }}>Peso: {subcategory.peso}%</span>
          <button onClick={() => setIsEditModalOpen(true)} className="btn btn-sm btn-outline-primary">Editar</button>
          <button onClick={onDelete} className="btn btn-sm btn-danger">Borrar</button>
        </div>
      </div>
      <div className="data-card-body">
        {subcategory.criterios?.map((criterion, index) => (
          <CriterionItem
            key={index}
            criterion={criterion}
            onUpdate={(updatedCriterion) => handleUpdateCriterion(index, updatedCriterion)}
            onDelete={() => handleDeleteCriterion(index)}
          />
        ))}
        <button className="btn btn-sm btn-primary" onClick={() => setIsCriterionModalOpen(true)} style={{ marginTop: '10px' }}>+ Añadir Criterio</button>
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
    if (window.confirm('¿Seguro que quieres eliminar esta subcategoría y todos sus criterios?')) {
      const updatedSubcategories = category.subcategorias.filter((_, i) => i !== index);
      onUpdate({ ...category, subcategorias: updatedSubcategories });
    }
  };

  return (
    <div className="data-card">
      <div className="data-card-header">
        <h3>{category.nombre}</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontWeight: '500', color: '#555' }}>Peso Total: {category.peso}%</span>
          <button onClick={() => setIsEditModalOpen(true)} className="btn btn-sm btn-outline-primary">Editar</button>
          <button onClick={onDelete} className="btn btn-sm btn-danger">Borrar</button>
        </div>
      </div>
      <div className="data-card-body">
        {category.subcategorias?.map((subcat, index) => (
          <SubcategoryCard
            key={index}
            subcategory={subcat}
            onUpdate={(updatedSubcat) => handleUpdateSubcategory(index, updatedSubcat)}
            onDelete={() => handleDeleteSubcategory(index)}
          />
        ))}
        <button className="btn btn-sm btn-primary" onClick={() => setIsSubcategoryModalOpen(true)} style={{ marginTop: '10px' }}>+ Añadir Subcategoría</button>
      </div>
      {isSubcategoryModalOpen && <AddSubcategoryModal onSave={handleAddSubcategory} onClose={() => setIsSubcategoryModalOpen(false)} />}
      {isEditModalOpen && <EditTemplateItemModal item={category} itemType="categoría" onSave={onUpdate} onClose={() => setIsEditModalOpen(false)} />}
    </div>
  );
}