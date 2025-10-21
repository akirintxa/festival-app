// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdTokenResult // 👈 IMPORTACIÓN CLAVE AÑADIDA
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Importamos getDoc
import { auth, db } from '../firebaseConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Estado para el perfil de Firestore
  const [loading, setLoading] = useState(true);

  // Función de registro
  async function signup(email, password, nombre) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Crea el documento del perfil en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        email: user.email,
        nombre: nombre,
        rol: "juez", // Asigna el rol "juez" por defecto al registrarse
      });

      return userCredential;
    } catch (error) {
      console.error("Error al registrar y crear perfil:", error);
      throw error;
    }
  }

  // Función de inicio de sesión
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Función de cierre de sesión
  function logout() {
    setUserProfile(null); // Limpiamos el perfil al cerrar sesión
    return signOut(auth);
  }

  // Efecto para manejar el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // --- 💡 INICIO DE LA CORRECCIÓN ---
        // Forzamos que el token se refresque para obtener los Custom Claims (ej: admin: true).
        // Sin esto, las Reglas de Firestore no sabrán que eres admin
        // hasta que el token se refresque automáticamente (hasta 1 hora después).
        try {
          await getIdTokenResult(user, true); // El 'true' fuerza el refresco
        } catch (error) {
          console.error("Error al forzar el refresco del token:", error);
        }
        // --- 💡 FIN DE LA CORRECCIÓN ---

        // Si hay un usuario, buscamos su documento de perfil en Firestore
        const userDocRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          // Si el documento existe, guardamos los datos en nuestro estado 'userProfile'
          setUserProfile(docSnap.data());
        } else {
          // Esto puede pasar si un usuario se borra de Firestore pero no de Auth
          console.error("No se encontró el perfil del usuario en Firestore.");
          setUserProfile(null);
        }
      } else {
        // Si no hay usuario, limpiamos el perfil
        setUserProfile(null);
      }
      setLoading(false);
    });

    // Limpia la suscripción al desmontar el componente
    return unsubscribe;
  }, []); // El array vacío asegura que esto solo se ejecute una vez


  // Valor proporcionado por el contexto
  const value = {
    currentUser,
    userProfile, // Exponemos el perfil para que la app lo use (ej: RoleRouter)
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}