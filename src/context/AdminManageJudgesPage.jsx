// src/pages/AdminManageJudgesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import CreateUserModal from '../components/modals/CreateUserModal';
import './ManageUsersPage.css'; // Reutilizamos los estilos

export default function AdminManageJudgesPage() {
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Usamos useCallback para evitar que la función se recree en cada render
  const fetchJudges = useCallback(async () => {
    setLoading(true);
    try {
      // Query para traer solo usuarios con rol 'juez'
      const usersCollectionRef = collection(db, 'usuarios');
      const q = query(usersCollectionRef, where("rol", "==", "juez"));
      const querySnapshot = await getDocs(q);
      
      const judgesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Ordenamos por nombre para una mejor visualización
      judgesList.sort((a, b) => a.nombre.localeCompare(b.nombre));

      setJudges(judgesList);
    } catch (error) {
      console.error("Error al obtener los jueces: ", error);
      alert("No se pudieron cargar los jueces. Revisa los permisos de Firestore.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJudges();
  }, [fetchJudges]);

  if (loading) {
    return <div className="manage-users-container"><h2>Cargando jueces...</h2></div>;
  }

  return (
    <div className="manage-users-container">
      <div className="page-header">
        <h1>Gestionar Jueces</h1>
        <button className="create-user-button" onClick={() => setIsCreateModalOpen(true)}>
          + Crear Nuevo Juez
        </button>
      </div>

      {judges.length > 0 ? (
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo Electrónico</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {judges.map(user => (
              <tr key={user.id}>
                <td>{user.nombre}</td>
                <td>{user.email}</td>
                <td><span className="role-badge role-juez">{user.rol}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No se han encontrado jueces. ¡Crea el primero!</p>
      )}

      {isCreateModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateModalOpen(false)}
          onUserCreated={fetchJudges} // Refresca la lista al crear un juez
          defaultRole="juez" // Forzamos que el rol sea 'juez'
          allowedRoles={['juez']} // Solo permitimos crear jueces
        />
      )}
    </div>
  );
}