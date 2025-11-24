// src/pages/FestivalDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // No necesitamos useNavigate aquí
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
// Ya no necesitamos useAuth aquí
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

  // --- PERMISOS SIMPLIFICADOS ---
  // Quien ve esta página es Superadmin, pero aún respetamos el estatus
  const canManageParticipants = festival?.estatus === 'proximo';
  const canManagePenalties = festival?.estatus === 'en-revision';
  const canViewResults = ['en-revision', 'finalizado'].includes(festival?.estatus);
  // --- FIN PERMISOS ---

  // --- useEffect SIMPLIFICADO ---
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

          // 2. Obtener la plantilla asociada (AHORA DENTRO DEL IF)
          const templateId = festivalData.plantillaId || "v1";
          const templateSnap = await getDoc(doc(db, "plantillaEvaluacion", templateId));

          if (templateSnap.exists()) {
            setPlantilla({ id: templateSnap.id, ...templateSnap.data() });
          } else {
            console.error(`No se encontró la plantilla de evaluación con ID: ${templateId}`);
            // Opcional: Mostrar alerta al usuario
          }
        } else {
          console.error("No se encontró el festival.");
          alert("Festival no encontrado.");
          // navigate a /superadmin/festivales (ya no es dinámico)
          // No podemos usar navigate sin el hook, pero Link funcionará
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFestivalData();
  }, [festivalId]); // Dependencias simplificadas
  // --- FIN useEffect ---

  // --- LÓGICA DE GESTIÓN (SIN CHEQUEOS DE ROL) ---

  const handleStatusChange = async (newStatus) => {
    if (!festival) return;
    if (newStatus !== 'proximo' && festival.estatus === 'proximo') {
      if (!window.confirm("¡Atención! Al cambiar el estatus, se bloqueará la gestión de colegios y jueces. ¿Deseas continuar?")) return;
    }
    try {
      const festivalDocRef = doc(db, 'festivales', festival.id);
      await updateDoc(festivalDocRef, { estatus: newStatus });
      setFestival({ ...festival, estatus: newStatus });
      alert('¡Estatus actualizado con éxito!');
    } catch (error) { console.error("Error al actualizar el estatus:", error); }
  };

  const handleSaveFestival = async (updatedData) => {
    try {
      const festivalDocRef = doc(db, 'festivales', festivalId);
      await updateDoc(festivalDocRef, updatedData);
      setFestival({ ...festival, ...updatedData });
      setIsEditModalOpen(false);
      alert('¡Datos del festival actualizados!');
    } catch (error) { console.error("Error al actualizar el festival:", error); }
  };

  // Colegios
  const handleOrderChange = (newOrder) => setSchools(newOrder);
  const handleSchoolAdd = (schoolName) => {
    if (!canManageParticipants) {
      alert("No se pueden añadir colegios en este estado del festival.");
      return;
    }
    const newSchool = { id: `colegio_${Date.now()}`, nombre: schoolName };
    setSchools([...schools, newSchool]);
  };
  const handleDeleteSchool = (schoolIdToDelete) => {
    if (!canManageParticipants) {
      alert("No se pueden eliminar colegios en este estado del festival.");
      return;
    }
    if (window.confirm("¿Seguro que quieres eliminar este colegio del festival?")) {
      setSchools(schools.filter(school => school.id !== schoolIdToDelete));
    }
  };

  // Jueces
  const handleAssignJudge = (newJudge) => {
    if (!canManageParticipants) {
      alert("Error: No se pueden asignar jueces en este estado del festival.");
      return;
    }
    setAssignedJudges([...assignedJudges, newJudge]);
    setIsJudgeModalOpen(false);
  };
  const handleDeleteJudge = (judgeIdToDelete) => {
    if (!canManageParticipants) {
      alert("Error: No se pueden eliminar jueces en este estado del festival.");
      return;
    }
    if (window.confirm("¿Seguro que quieres desasignar a este juez del festival?")) {
      setAssignedJudges(assignedJudges.filter(j => j.juezId !== judgeIdToDelete));
    }
  };

  // Guardado General
  const handleSaveChanges = async () => {
    try {
      const festivalDocRef = doc(db, 'festivales', festivalId);
      let dataToUpdate = { colegios: schools };
      if (canManageParticipants) {
        const judgeIds = assignedJudges.map(j => j.juezId);
        dataToUpdate.juecesAsignadosData = assignedJudges;
        dataToUpdate.juecesAsignadosIds = judgeIds;
        alert('¡Cambios en Colegios y Jueces guardados con éxito!');
      } else {
        alert('¡Cambios en Colegios guardados con éxito! (La gestión de jueces está bloqueada).');
      }
      await updateDoc(festivalDocRef, dataToUpdate);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert('Hubo un error al guardar los cambios.');
    }
  };

  const handlePenaltiesChanged = () => setRecalcTrigger(prev => prev + 1);

  // --- Renderizado ---
  if (loading || !plantilla) return <h2>Cargando festival...</h2>;
  if (!festival) return <h2>Festival no encontrado.</h2>;

  // Enlace "Volver" fijo para Superadmin
  const backLink = "/superadmin/festivales";

  return (
    <div className="festival-detail-container">
      <div className="detail-page-controls">
        <Link to={backLink} className="back-button">← Volver</Link>
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
          // El selector ahora siempre está habilitado
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
      {festival.createdBy && <p><small>Creado por UID: {festival.createdBy}</small></p>} {/* Mantenemos esto como info útil */}

      <div className="festival-management-sections">
        <ManageSchools
          schools={schools}
          onOrderChange={handleOrderChange}
          onSchoolAdd={handleSchoolAdd}
          onDeleteSchool={handleDeleteSchool}
          isLocked={!canManageParticipants}
        />
        <ManageJudges
          assignedJudges={assignedJudges}
          plantilla={plantilla}
          onAssign={() => setIsJudgeModalOpen(true)}
          onDelete={handleDeleteJudge}
          isLocked={!canManageParticipants}
        />
        {canManagePenalties && (
          <ManagePenalties
            festival={festival}
            colegios={schools}
            onPenaltiesChanged={handlePenaltiesChanged}
          />
        )}
        {canViewResults && (
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

      {isJudgeModalOpen && canManageParticipants && (
        <AssignJudgeModal
          plantilla={plantilla} // 👈 Pasamos la plantilla correcta
          alreadyAssignedIds={assignedJudges.map(j => j.juezId)}
          onSave={handleAssignJudge}
          onClose={() => setIsJudgeModalOpen(false)}
        />
      )}
    </div>
  );
}