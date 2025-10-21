// src/pages/FestivalDetailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import ManageSchools from '../components/festivals/ManageSchools';
import ManageJudges from '../components/festivals/ManageJudges';
import ManagePenalties from '../components/festivals/ManagePenalties';
import ResultsPanel from '../components/festivals/ResultsPanel';
import EditFestivalModal from '../components/modals/EditFestivalModal';
import AssignJudgeModal from '../components/modals/AssignJudgeModal';
import './FestivalDetailPage.css';

export default function FestivalDetailPage() {
  const [festival, setFestival] = useState(null);
  const [schools, setSchools] = useState([]);
  const [assignedJudges, setAssignedJudges] = useState([]);
  const [plantilla, setPlantilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [recalcTrigger, setRecalcTrigger] = useState(0); 
  const { festivalId } = useParams();
  
  // Estado para saber si los jueces están "bloqueados"
  const judgesAreLocked = festival?.estatus !== 'proximo';

  useEffect(() => {
    const fetchFestivalData = async () => {
      if (!festivalId) return;
      setLoading(true);
      try {
        const festivalDocRef = doc(db, 'festivales', festivalId);
        const festivalSnap = await getDoc(festivalDocRef);

        if (festivalSnap.exists()) {
          const festivalData = { id: festivalSnap.id, ...festivalSnap.data() };
          setFestival(festivalData);
          setSchools(festivalData.colegios || []);
          setAssignedJudges(festivalData.juecesAsignadosData || []);
        } else {
          console.error("No se encontró el festival.");
        }

        const templateSnap = await getDoc(doc(db, "plantillaEvaluacion", "v1"));
        if (templateSnap.exists()) {
          setPlantilla(templateSnap.data());
        } else {
          console.error("No se encontró la plantilla de evaluación.");
        }

      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFestivalData();
  }, [festivalId]);

  // --- LÓGICA DE GESTIÓN DEL FESTIVAL ---
  const handleStatusChange = async (newStatus) => {
    if (!festival) return;
    
    // Alerta si se intenta bloquear jueces con cambios pendientes
    if (newStatus !== 'proximo' && festival.estatus === 'proximo') {
         if (!window.confirm("¡Atención! Al cambiar el estatus a 'Activo' o superior, se bloqueará la asignación de jueces. ¿Deseas continuar?")) {
            return; // El usuario canceló
         }
    }
    
    try {
      const festivalDocRef = doc(db, 'festivales', festival.id);
      await updateDoc(festivalDocRef, { estatus: newStatus });
      setFestival({ ...festival, estatus: newStatus });
      alert('¡Estatus actualizado con éxito!');
    } catch (error) {
      console.error("Error al actualizar el estatus:", error);
    }
  };

  const handleSaveFestival = async (updatedData) => {
    try {
        const festivalDocRef = doc(db, 'festivales', festivalId);
        await updateDoc(festivalDocRef, updatedData);
        setFestival({ ...festival, ...updatedData });
        setIsEditModalOpen(false);
        alert('¡Datos del festival actualizados!');
    } catch (error) {
        console.error("Error al actualizar el festival:", error);
    }
  };

  // --- LÓGICA DE GESTIÓN DE COLEGIOS ---
  const handleOrderChange = (newOrder) => setSchools(newOrder);

  const handleSchoolAdd = (schoolName) => {
    const newSchool = { id: `colegio_${Date.now()}`, nombre: schoolName };
    setSchools([...schools, newSchool]);
  };
  
  const handleDeleteSchool = (schoolIdToDelete) => {
    if (window.confirm("¿Seguro que quieres eliminar este colegio del festival?")) {
        setSchools(schools.filter(school => school.id !== schoolIdToDelete));
    }
  };

  // --- LÓGICA DE GESTIÓN DE JUECES ---
  const handleAssignJudge = (newJudge) => {
    if (judgesAreLocked) {
        alert("Error: No se pueden asignar jueces porque el festival ya no está en estatus 'Próximo'.");
        return;
    }
    setAssignedJudges([...assignedJudges, newJudge]);
    setIsJudgeModalOpen(false);
  };
  
  const handleDeleteJudge = (judgeIdToDelete) => {
    if (judgesAreLocked) {
        alert("Error: No se pueden eliminar jueces porque el festival ya no está en estatus 'Próximo'.");
        return;
    }
    if (window.confirm("¿Seguro que quieres desasignar a este juez del festival?")) {
        setAssignedJudges(assignedJudges.filter(j => j.juezId !== judgeIdToDelete));
    }
  };

  // --- LÓGICA DE GUARDADO GENERAL (MODIFICADA) ---
  const handleSaveChanges = async () => {
    try {
      const festivalDocRef = doc(db, 'festivales', festivalId);
      
      let dataToUpdate = {
        colegios: schools, // Los colegios siempre se guardan (para el orden)
      };

      // ¡BLOQUEO! Solo actualizamos jueces si el festival está "Próximo"
      if (!judgesAreLocked) {
        const judgeIds = assignedJudges.map(j => j.juezId);
        dataToUpdate.juecesAsignadosData = assignedJudges;
        dataToUpdate.juecesAsignadosIds = judgeIds;
        alert('¡Cambios en Colegios y Jueces guardados con éxito!');
      } else {
        alert('¡Cambios en Colegios guardados con éxito! (La asignación de jueces está bloqueada).');
      }

      await updateDoc(festivalDocRef, dataToUpdate);
      
    } catch (error) {
      console.error("Error al guardar:", error);
      alert('Hubo un error al guardar los cambios.');
    }
  };

  // --- LÓGICA PARA RECALCULAR RESULTADOS ---
  const handlePenaltiesChanged = () => {
    setRecalcTrigger(prev => prev + 1); 
  };

  if (loading || !plantilla) return <h2>Cargando festival...</h2>;

  if (!festival) {
    return (
      <div className="manage-templates-container">
        <div className="page-header"><h2>Festival no encontrado</h2></div>
        <Link to="/superadmin/festivales" className="back-button">← Volver a la lista</Link>
      </div>
    );
  }

  return (
    <div className="festival-detail-container">
      <div className="detail-page-controls">
        <Link to="/superadmin/festivales" className="back-button">← Volver a la lista</Link>
        <div className="main-actions">
            <button className="edit-festival-button" onClick={() => setIsEditModalOpen(true)}>Editar Festival</button>
            <button className="save-all-button" onClick={handleSaveChanges}>Guardar Cambios</button>
        </div>
      </div>

      <div className="page-header">
        <h1>{festival.nombre}</h1>
        <div className="status-selector-wrapper">
          <label htmlFor="status-select">Estatus:</label>
          <select 
            id="status-select"
            value={festival.estatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`status-select status-${festival.estatus}`}
          >
            <option value="proximo">Próximo</option>
            <option value="activo">Activo</option>
            <option value="en-revision">En Revisión</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>
      </div>
      <p><strong>Fecha:</strong> {new Date(festival.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
      <p><strong>Lugar:</strong> {festival.lugar}</p>
      
      <div className="festival-management-sections">
        <ManageSchools 
            schools={schools} 
            onOrderChange={handleOrderChange}
            onSchoolAdd={handleSchoolAdd}
            onDeleteSchool={handleDeleteSchool}
        />
        <ManageJudges 
            assignedJudges={assignedJudges}
            plantilla={plantilla}
            onAssign={() => setIsJudgeModalOpen(true)}
            onDelete={handleDeleteJudge}
            // 👇 PASAMOS EL PROP DE BLOQUEO
            isLocked={judgesAreLocked} 
        />
        
        {festival.estatus === 'en-revision' && (
          <ManagePenalties 
            festival={festival} 
            colegios={schools} 
            onPenaltiesChanged={handlePenaltiesChanged}
          />
        )}
        
        {(festival.estatus === 'en-revision' || festival.estatus === 'finalizado') && (
          <ResultsPanel 
            festival={festival} 
            plantilla={plantilla} 
            recalcTrigger={recalcTrigger}
          />
        )}
      </div>

      {isEditModalOpen && (
        <EditFestivalModal
            festival={festival}
            onSave={handleSaveFestival}
            onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {isJudgeModalOpen && (
        <AssignJudgeModal
          alreadyAssignedIds={assignedJudges.map(j => j.juezId)}
          onSave={handleAssignJudge}
          onClose={() => setIsJudgeModalOpen(false)}
        />
      )}
    </div>
  );
}