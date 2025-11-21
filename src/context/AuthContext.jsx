import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, firebaseConfig } from '../firebaseConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para que un usuario se registre a sí mismo (Público)
  async function registerSelf(email, password, nombre) {
    try {
      // 1. Crear usuario en Firebase Auth (loguea automáticamente)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Crear perfil en Firestore
      const profileData = {
        uid: user.uid,
        email: user.email,
        nombre: nombre,
        rol: "juez", // Rol por defecto para registros públicos
      };
      await setDoc(doc(db, "usuarios", user.uid), profileData);

      // 3. Actualizar estado local
      setUserProfile(profileData);
      return userCredential;
    } catch (error) {
      console.error("Error en auto-registro:", error);
      throw error;
    }
  }

  // Función para que un Admin cree otro usuario (Privado)
  async function createUserByAdmin(email, password, nombre, rol = "juez") {
    let secondaryApp = null;
    try {
      // 1. Inicializar app secundaria
      secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Crear usuario sin cerrar sesión actual
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const user = userCredential.user;

      // 3. Crear perfil en Firestore
      const profileData = {
        uid: user.uid,
        email: user.email,
        nombre: nombre,
        rol: rol, // Usar el rol pasado por argumento
      };
      await setDoc(doc(db, "usuarios", user.uid), profileData);

      // 4. Cerrar sesión en secundaria
      await signOut(secondaryAuth);

      return userCredential;
    } catch (error) {
      console.error("Error al crear usuario por admin:", error);
      throw error;
    } finally {
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
    }
  }

  function login(email, password) {
    // Limpiamos el perfil anterior antes de intentar iniciar sesión
    setUserProfile(null);
    setLoading(true); // Ponemos loading en true al iniciar login
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth State Changed. User:", user ? user.uid : 'No user'); // LOG 1

      if (user) {
        // EVITAR CONDICIÓN DE CARRERA:
        // 1. Ponemos loading en true PRIMERO.
        setLoading(true);
        // 2. Limpiamos perfil anterior.
        setUserProfile(null);
        // 3. FINALMENTE establecemos el usuario. Esto dispara los re-renders (como RoleRouter).
        // Al estar loading=true, RoleRouter mostrará el spinner en vez de error.
        setCurrentUser(user);

        // Comentado temporalmente para aislar el problema
        // try {
        //   await getIdTokenResult(user, true);
        // } catch (error) {
        //   console.error("Error al forzar el refresco del token:", error);
        // }

        try {
          const userDocRef = doc(db, "usuarios", user.uid);
          console.log(`Intentando leer perfil para UID: ${user.uid} desde ${userDocRef.path}`); // LOG 2

          // Creamos una promesa con timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Tiempo de espera agotado al obtener perfil")), 10000)
          );

          // Usamos Promise.race para competir entre la lectura de Firestore y el timeout
          const docSnap = await Promise.race([
            getDoc(userDocRef),
            timeoutPromise
          ]);

          if (docSnap.exists()) {
            console.log("Perfil encontrado:", docSnap.data()); // LOG 3
            setUserProfile(docSnap.data());
          } else {
            console.error(`¡Error Crítico! No se encontró el documento de perfil para el usuario ${user.uid} en Firestore.`); // LOG 4
            setUserProfile(null);
          }
        } catch (error) {
          console.error(`Error al intentar leer el perfil del usuario ${user.uid} desde Firestore:`, error.message); // LOG 5
          setUserProfile(null);
        } finally {
          setLoading(false);
          console.log("Loading puesto en false después de intentar leer perfil."); // LOG 6
        }

      } else {
        setUserProfile(null);
        setCurrentUser(null);
        setLoading(false);
        console.log("No hay usuario, loading puesto en false."); // LOG 7
      }
    });

    return unsubscribe;
  }, []);


  const value = {
    currentUser,
    userProfile,
    loading, // Exponer loading es útil
    registerSelf,
    createUserByAdmin,
    login,
    logout
  };

  // No renderizamos el resto de la aplicación hasta que la carga inicial
  // del estado de autenticación y el perfil de usuario haya terminado.
  // Esto previene que los componentes protegidos se rendericen con datos
  // incompletos (ej. currentUser existe pero userProfile es todavía null).
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}