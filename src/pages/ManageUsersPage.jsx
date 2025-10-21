// src/pages/ManageUsersPage.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import CreateUserModal from '../components/modals/CreateUserModal';
import EditUserRoleModal from '../components/modals/EditUserRoleModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import './ManageUsersPage.css';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  // Estados para controlar cada modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // --- LECTURA DE DATOS (READ) ---
  const fetchUsers = async () => {
    try {
      const usersCollectionRef = collection(db, 'usuarios');
      // 👇 LA CORRECCIÓN ESTÁ EN ESTA LÍNEA 👇
      const querySnapshot = await getDocs(usersCollectionRef);
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error al obtener los usuarios: ", error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- LÓGICA DE EDICIÓN (UPDATE) ---
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (userId, updatedData) => {
    try {
      const userDocRef = doc(db, 'usuarios', userId);
      await updateDoc(userDocRef, updatedData);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, ...updatedData } : user
      ));
      handleCloseEditModal();
    } catch (error) {
      console.error("Error al actualizar el usuario: ", error);
    }
  };

  // --- LÓGICA DE BORRADO (DELETE) ---
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete = async (userId) => {
    try {
      await deleteDoc(doc(db, 'usuarios', userId));
      setUsers(users.filter(user => user.id !== userId));
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error al eliminar el usuario: ", error);
    }
  };

  if (loading) {
    return <h2>Cargando usuarios...</h2>;
  }

  return (
    <div className="manage-users-container">
      <div className="page-header">
        <h1>Gestionar Usuarios</h1>
        <button className="create-user-button" onClick={() => setIsCreateModalOpen(true)}>
          + Crear Usuario
        </button>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo Electrónico</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.nombre}</td>
              <td>{user.email}</td>
              <td>{user.rol}</td>
              <td>
                <button
                  className="action-button edit"
                  onClick={() => handleEditClick(user)}
                >
                  Editar
                </button>
                <button
                  className="action-button delete"
                  onClick={() => handleDeleteClick(user)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isCreateModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateModalOpen(false)}
          onUserCreated={fetchUsers}
        />
      )}

      {isEditModalOpen && (
        <EditUserRoleModal
          user={selectedUser}
          onSave={handleSaveUser}
          onClose={handleCloseEditModal}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          user={selectedUser}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseDeleteModal}
        />
      )}
    </div>
  );
}