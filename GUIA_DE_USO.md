# 📘 Guía de Uso - App Festivales

Esta guía está dividida en dos secciones según el rol del usuario:
1.  **Superadministrador:** Organizador encargado de la logística, configuración y resultados.
2.  **Juez:** Evaluador encargado de calificar a las agrupaciones.

---

# 🛠️ PARTE 1: Manual para Superadministradores

Como administrador, tienes el control total del evento. El flujo de trabajo ideal es cronológico:

## 1. Preparación (Antes del Evento)

### A. Crear una Plantilla de Evaluación
Lo primero es definir **cómo** se va a evaluar. Esto se hace una sola vez y se puede reutilizar.
1.  Ve al menú lateral **"Gestionar Plantillas"**.
2.  Haz clic en **"+ Nueva Plantilla"**.
3.  Dale un nombre (ej. *"Gaitas Primaria 2025"*).
4.  **Añadir Categorías:** Crea los grandes bloques (ej. *Música, Coreografía*). Asigna un peso % a cada una (la suma debe dar 100%).
5.  **Añadir Subcategorías y Criterios:** Dentro de cada categoría, detalla qué se evalúa (ej. *Afinación, Ritmo*) y el puntaje máximo de cada ítem.
6.  **Reglas de Penalización:** Define las infracciones (ej. *"Exceso de tiempo"*) y cuántos puntos restan.

### B. Crear el Festival
1.  Ve a **"Gestionar Festivales"**.
2.  Clic en **"+ Crear Festival"**.
3.  Llena los datos (Nombre, Fecha, Lugar).
4.  **IMPORTANTE:** Selecciona la **Plantilla de Evaluación** que creaste en el paso anterior.
5.  El festival aparecerá con estatus **"Próximo"**.

### C. Configurar Participantes y Jueces
Entra al detalle del festival (botón "Gestionar").

*   **Colegios:** Añade los nombres de las agrupaciones participantes. Puedes reordenarlos arrastrando y soltando para definir el orden de presentación.
*   **Jueces:**
    1.  Primero, asegúrate de que los jueces existan en el sistema (Menú **"Gestionar Usuarios"** -> Crear Usuario con rol "Juez").
    2.  En el detalle del festival, clic en **"+ Asignar Juez"**.
    3.  Selecciona al juez de la lista.
    4.  **CRÍTICO:** Marca las casillas de las **Subcategorías** que este juez debe evaluar. *Si no marcas ninguna, el juez verá el festival vacío.*

---

## 2. Durante el Evento

### A. Activar el Festival
Cuando el evento vaya a comenzar:
1.  En el detalle del festival, cambia el estatus de "Próximo" a **"Activo"**.
2.  Esto habilita a los jueces para entrar y votar.

### B. Monitoreo
*   Puedes ver en tiempo real cómo van entrando los votos en el panel de **Resultados**.
*   Si hay penalizaciones (ej. se pasaron del tiempo), ve a la sección "Penalizaciones" y aplícalas al colegio correspondiente.

---

## 3. Cierre del Evento

### A. Finalizar y Resultados
1.  Cuando terminen todas las presentaciones, cambia el estatus a **"Finalizado"**.
2.  Esto bloquea la edición de votos de los jueces.
3.  Ve a la sección de Resultados y haz clic en **"Resultados Generales"** para calcular los ganadores.

### B. Exportar Informes
Genera los PDFs oficiales para la premiación:
*   **Resultados Generales:** Ranking de ganadores y por categoría.
*   **Matriz de Puntos:** Tabla detallada con todos los puntajes desglosados.
*   **Votos por Juez:** Auditoría detallada de qué votó cada quién.

---
---

# ⚖️ PARTE 2: Manual para Jueces

Tu trabajo es evaluar las presentaciones desde tu dispositivo móvil o tablet.

## 1. Acceso
1.  Ingresa a la aplicación con tu correo y contraseña.
2.  Verás una lista de festivales.
3.  Busca el festival que dice **"Activo"** y pulsa **"Evaluar"**.

## 2. Proceso de Votación
Dentro del festival verás la lista de colegios en orden de presentación.

1.  **Seleccionar Colegio:** Toca el nombre del colegio que está presentándose.
2.  **Evaluar:** Se abrirá un formulario **solo con las categorías que te asignaron**.
    *   Ingresa el puntaje en cada casilla (ej. 18/20).
    *   No puedes poner un número mayor al máximo permitido.
    *   Puedes dejar comentarios opcionales al final.
3.  **Guardar:** Al terminar, pulsa el botón **"Guardar Cambios"**.
    *   Verás un "check" verde ✅ al lado del colegio indicando que ya votaste.

## 3. Correcciones
*   Si te equivocaste, puedes volver a tocar el nombre del colegio y corregir tu nota.
*   Esto es posible **mientras el festival siga "Activo"**. Una vez que el administrador lo finalice, no podrás cambiar nada.

---

## 🆘 Solución de Problemas Comunes

*   **"No veo subcategorías para evaluar":** El administrador no te ha asignado ninguna categoría específica. Pídele que revise la "Asignación de Jueces" en el festival.
*   **"No puedo entrar al festival":** Verifica que el estatus del festival sea "Activo". Si dice "Próximo", el evento aún no comienza.
*   **"Se borraron mis datos":** Asegúrate de tener conexión a internet. La aplicación guarda automáticamente al pulsar "Guardar", pero requiere conexión.
