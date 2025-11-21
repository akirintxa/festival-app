// src/pages/CreateJudgePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from "firebase/functions"; // Import Firebase Functions
import './CreateFestivalPage.css'; // Reutilizamos estilos del otro formulario

export default function CreateJudgePage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Para mensaje de éxito
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!nombre || !email || !password) {
      setError('Todos los campos son obligatorios.');
      return;
    }
     if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // Prepara la llamada a la Cloud Function
      const functions = getFunctions();
      const createJudgeUser = httpsCallable(functions, 'createJudgeUser'); // Nombre exacto de tu CF

      // Llama a la función con los datos del formulario
      const result = await createJudgeUser({ nombre, email, password });

      setSuccess(result.data.message || '¡Juez creado con éxito!'); // Muestra mensaje de éxito
      // Limpia el formulario
      setNombre('');
      setEmail('');
      setPassword('');
      // Opcional: Redirigir después de un tiempo o dejar al admin crear otro
      // setTimeout(() => navigate('/admin/dashboard'), 2000);

    } catch (err) {
      console.error("Error al llamar a createJudgeUser:", err);
      // Muestra el mensaje de error que viene de la Cloud Function (más amigable)
      setError(err.message || 'Error desconocido al crear el juez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Reutilizamos clases del contenedor de Crear Festival
    <div className="create-festival-container">
      <div className="page-header">
        <h1>Crear Nuevo Juez</h1>
      </div>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>} {/* Mensaje de éxito */}
      <form onSubmit={handleSubmit} className="create-festival-form"> {/* Reutilizamos clase */}
        <div className="form-group">
          <label htmlFor="nombre">Nombre del Juez:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6" // Validación básica HTML
            disabled={loading}
          />
        </div>
        <div className="form-actions">
           {/* Botón para volver al dashboard si es necesario */}
          <button type="button" onClick={() => navigate('/admin/dashboard')} className="button-cancel" disabled={loading}>
            Volver
          </button>
          <button type="submit" className="button-save" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Juez'}
          </button>
        </div>
      </form>
    </div>
  );
}