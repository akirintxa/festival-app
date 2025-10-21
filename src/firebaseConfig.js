// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <--- 1. Agrega esta línea

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDxsIVi9_n1BonzYMNgd3_6RcdsuG2B4To",
  authDomain: "festival-gaitas-app.firebaseapp.com",
  projectId: "festival-gaitas-app",
  storageBucket: "festival-gaitas-app.appspot.com",
  messagingSenderId: "280953708023",
  appId: "1:280953708023:web:cc559ea37abc30e8a462f2"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

