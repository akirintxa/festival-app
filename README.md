# 🏆 App Festivales

Plataforma web para la gestión integral y evaluación en tiempo real de festivales de gaitas y talentos escolares.

## 🚀 Características Principales

*   **Gestión de Festivales:** Creación y configuración de eventos (fecha, lugar, estatus).
*   **Plantillas de Evaluación Dinámicas:**
    *   Crea plantillas reutilizables (ej. "Gaitas 2025").
    *   Define categorías (Música, Coreografía) y sus pesos %.
    *   Configura subcategorías, criterios y penalizaciones.
*   **Roles de Usuario:**
    *   **Superadmin:** Control total, gestión de usuarios, colegios y resultados.
    *   **Juez:** Interfaz móvil optimizada para evaluar en tiempo real.
*   **Sistema de Votación:**
    *   Evaluación por rubros asignados específicamente a cada juez.
    *   Cálculo automático de puntajes y penalizaciones.
*   **Resultados y Reportes:**
    *   Tablero de ganadores en tiempo real.
    *   Generación de PDFs oficiales (Resultados Generales, Matriz de Puntos, Auditoría de Votos).

## 🛠️ Tecnologías

*   **Frontend:** React + Vite
*   **Estilos:** CSS3 (Variables, Flexbox, Grid)
*   **Backend / BaaS:** Firebase (Authentication, Firestore, Hosting)
*   **Utilidades:** `jspdf` (Reportes), `react-router-dom` (Navegación), `@hello-pangea/dnd` (Drag & Drop).

## 📋 Requisitos Previos

*   Node.js (v18 o superior)
*   Cuenta de Google (para Firebase)

## ⚙️ Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repo>
    cd app-festivales
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env.development` en la raíz del proyecto con tus credenciales de Firebase:
    ```env
    VITE_FIREBASE_API_KEY=tu_api_key
    VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=tu_proyecto
    VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
    VITE_FIREBASE_APP_ID=tu_app_id
    ```

4.  **Ejecutar en local:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

## 📚 Documentación Adicional

*   **[Guía de Uso (Manual de Usuario)](./GUIA_DE_USO.md):** Instrucciones detalladas para Administradores y Jueces sobre cómo operar la plataforma durante un evento.
*   **[Guía de Despliegue](./DEPLOYMENT.md):** Pasos para compilar y subir la aplicación a producción (Firebase Hosting).
*   **[Plan de Implementación](./IMPLEMENTATION_PLAN.md):** Historial técnico de cambios y estructura del proyecto.

## 📦 Scripts Disponibles

*   `npm run dev`: Inicia el servidor de desarrollo.
*   `npm run build`: Compila la aplicación para producción en la carpeta `dist`.
*   `npm run preview`: Vista previa local de la compilación de producción.

---
Desarrollado para la gestión eficiente de festivales escolares.
