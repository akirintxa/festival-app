// src/components/festivals/ManageSchools.jsx
import React, { useState } from 'react'; // Importamos useState
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './ManageSchools.css';

const SchoolItem = ({ school, index, onDelete }) => (
  <Draggable draggableId={school.id} index={index}>
    {(provided) => (
      <div
        className="school-item"
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
      >
        <span className="school-order">{index + 1}.</span>
        <span className="school-name">{school.nombre}</span>
        <button onClick={() => onDelete(school.id)} className="delete-button">🗑️</button>
      </div>
    )}
  </Draggable>
);

export default function ManageSchools({ schools, onOrderChange, onSchoolAdd, onDeleteSchool }) {
  const [newSchoolName, setNewSchoolName] = useState('');
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(schools);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onOrderChange(items);
  };

const handleAddClick = () => {
    if (newSchoolName.trim() === '') return;
    onSchoolAdd(newSchoolName.trim());
    setNewSchoolName('');
  };

  return (
    <div className="manage-schools-container">
      <h3>Colegios Participantes</h3>

      <div className="add-school-form">
        <input
          type="text"
          value={newSchoolName}
          onChange={(e) => setNewSchoolName(e.target.value)}
          placeholder="Nombre del nuevo colegio"
          onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
        />
        <button onClick={handleAddClick}>+ Añadir</button>
      </div>

      <p className="instructions">Arrastra y suelta para definir el orden de presentación.</p>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="schools">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="schools-list">
              {schools.map((school, index) => (
                <SchoolItem key={school.id} school={school} index={index} onDelete={onDeleteSchool} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* 👇 El div con el botón de guardar ha sido eliminado de aquí 👇 */}
    </div>
  );
}