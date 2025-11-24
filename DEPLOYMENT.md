# Guía de Despliegue a Producción

Esta guía detalla cómo llevar tu aplicación **App Festivales** a un entorno de producción utilizando Firebase Hosting.

## 1. Estrategia de Base de Datos

La primera decisión es si usar la misma base de datos de desarrollo o crear una nueva.

### Opción A: Proyecto Separado (RECOMENDADO)
Crear un nuevo proyecto en Firebase (ej. `app-festivales-prod`).
*   **Pros**: Seguridad total. Si borras datos en pruebas, no afectas a producción. Configuración limpia.
*   **Contras**: Requiere copiar la configuración (`firebaseConfig`) y volver a crear usuarios/datos iniciales.

### Opción B: Mismo Proyecto
Usar el mismo proyecto que tienes ahora.
*   **Pros**: Despliegue inmediato. Todos los datos actuales ya están ahí.
*   **Contras**: **ALTO RIESGO**. Cualquier prueba o error en desarrollo puede borrar datos reales de usuarios.

> [!IMPORTANT]
> **Recomendación**: Para una aplicación real con jueces y votaciones, usa la **Opción A (Proyecto Separado)**.

---

## 2. Preparación del Entorno

Asegúrate de tener las herramientas de Firebase instaladas y logueadas:

```bash
npm install -g firebase-tools
firebase login
```

---

## 3. Configuración para Producción (Opción A)

Si decides crear un proyecto nuevo:

1.  Ve a [Firebase Console](https://console.firebase.google.com/) y crea un nuevo proyecto.
2.  Habilita **Authentication** y **Firestore Database**.
3.  Copia las reglas de seguridad de tu archivo `firestore.rules` y pégalas en la consola del nuevo proyecto.
4.  **Registra tu app web**:
    *   En la vista general del proyecto (Project Overview), haz clic en el icono de **Web** (`</>`).
    *   Ponle un nombre (ej. "App Festivales Prod").
    *   Haz clic en **Registrar app**.
    *   Firebase te mostrará un código con `const firebaseConfig = { ... }`.
    *   **Copia solo el objeto** dentro de las llaves (apiKey, authDomain, etc.).
5.  **Actualiza tu código**:
    *   Abre `src/firebaseConfig.js` en tu editor.
    *   Reemplaza los valores actuales con los que acabas de copiar del proyecto de producción.
    *   *(Opcional pero recomendado)*: Usa variables de entorno (`.env.production`) para no tener que cambiar el código manualmente cada vez.

---

## 4. Construcción (Build)

Antes de desplegar, necesitas convertir tu código React en archivos estáticos optimizados.

Ejecuta en tu terminal:

```bash
npm run build
```

Esto creará una carpeta `dist/` con tu aplicación lista.

---

## 5. Despliegue (Deploy)

### Paso 1: Inicializar (Solo la primera vez)
Si es un proyecto nuevo o cambiaste de proyecto:

```bash
firebase init hosting
```
*   Selecciona: **Use an existing project** (y elige tu proyecto de producción).
*   Public directory: `dist` (¡Importante!).
*   Configure as a single-page app? **Yes**.
*   Automatic builds and deploys with GitHub? **No** (por ahora).
*   Overwrite index.html? **No** (si ya hiciste el build).

### Paso 2: Subir a Internet
Una vez configurado y con el build hecho:

```bash
firebase deploy
```

Firebase te dará una URL (ej. `https://app-festivales-prod.web.app`) donde tu aplicación ya está funcionando en vivo.

---

## Resumen Rápido

1.  **Decide**: ¿Mismo proyecto o nuevo? (Vota por nuevo).
2.  **Build**: `npm run build`.
3.  **Deploy**: `firebase deploy`.

---

## 6. Crear el Primer Superadmin

Al ser una base de datos nueva, no hay usuarios. Sigue estos pasos para crear tu cuenta de Superadmin:

1.  Abre tu aplicación desplegada (ej. `https://tu-app.web.app`).
2.  Ve a `/register` y crea una cuenta normal.
3.  Ve a la **Firebase Console** > **Firestore Database**.
4.  Entra en la colección `usuarios`.
5.  Busca el documento con tu ID de usuario (el que acabas de crear).
6.  Cambia el campo `rol` de `"juez"` a `"superadmin"`.
7.  Recarga la página de tu aplicación. ¡Ya eres Superadmin!
