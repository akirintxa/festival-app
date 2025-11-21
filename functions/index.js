// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializa el SDK de Admin de Firebase (usa las credenciales del proyecto automáticamente)
admin.initializeApp();

/**
 * Cloud Function invocable por un usuario 'admin' o 'superadmin' para crear un nuevo usuario 'juez'.
 * Espera datos: { email: string, password: string, nombre: string }
 * Requiere que el usuario que llama esté autenticado.
 */
exports.createJudgeUser = functions.https.onCall(async (data, context) => {
  // 1. Verificar que el llamador está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Autenticación requerida.",
    );
  }

  // 2. Verificar que el llamador tiene el rol 'admin' o 'superadmin'
  //    (Leer desde Firestore es más simple si no tienes Custom Claims configurados aún)
  const callerUid = context.auth.uid;
  let callerRole = null;
  try {
      const callerDoc = await admin.firestore().collection("usuarios").doc(callerUid).get();
      if (callerDoc.exists) {
          callerRole = callerDoc.data()?.rol;
      }
  } catch (dbError) {
      console.error("Error al leer el rol del llamador desde Firestore:", dbError);
      throw new functions.https.HttpsError("internal", "Error al verificar permisos del llamador.");
  }

  if (callerRole !== 'admin' && callerRole !== 'superadmin') {
     throw new functions.https.HttpsError(
        "permission-denied",
        "Solo usuarios Admin o Superadmin pueden crear jueces.",
     );
  }


  // 3. Validar los datos de entrada
  const { email, password, nombre } = data;
  if (!email || !password || !nombre) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Se requieren email, contraseña y nombre.",
    );
  }
  if (password.length < 6) {
     throw new functions.https.HttpsError(
        "invalid-argument",
        "La contraseña debe tener al menos 6 caracteres.",
     );
  }


  // 4. Crear el usuario en Firebase Authentication
  let newUserRecord;
  try {
    newUserRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: nombre, // Opcional: establece el nombre visible en Auth
    });
    console.log("Usuario de autenticación creado exitosamente:", newUserRecord.uid);
  } catch (error) {
    console.error("Error creando usuario de autenticación:", error);
    // Manejar errores específicos como 'email-ya-existe'
    if (error.code === 'auth/email-already-exists') {
       throw new functions.https.HttpsError('already-exists', 'El email ya está en uso.');
    }
    throw new functions.https.HttpsError("internal", "Error al crear usuario de autenticación.");
  }

  // 5. Crear el perfil del usuario en Firestore
  const profileData = {
    uid: newUserRecord.uid,
    email: email,
    nombre: nombre,
    rol: "juez", // Asigna explícitamente el rol 'juez'
  };
  try {
    // Usa el UID del nuevo usuario como ID del documento
    await admin.firestore().collection("usuarios").doc(newUserRecord.uid).set(profileData);
    console.log("Perfil de Firestore creado exitosamente para el usuario:", newUserRecord.uid);
  } catch (error) {
     console.error("Error creando perfil en Firestore:", error);
     // Considera la limpieza: ¿Deberíamos borrar el usuario de Auth si Firestore falla?
     // Por ahora, solo reportamos el error. Una opción sería lanzar una excepción
     // para que el cliente sepa que la creación fue incompleta.
      throw new functions.https.HttpsError("internal", "Error al crear perfil de usuario en base de datos.");
  }

  // 6. Devolver éxito
  return {
    message: `¡Juez '${nombre}' (${email}) creado exitosamente!`,
    uid: newUserRecord.uid, // Devuelve el UID por si el cliente lo necesita
  };
});

// Puedes añadir más funciones aquí si las necesitas
// exports.otraFuncion = functions.https.onCall(async (data, context) => { ... });