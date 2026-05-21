# Gestor de Tareas — Equipo Legal & Tributario

Aplicación web colaborativa para gestión de proyectos y tareas del equipo.

## Stack
- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Base de datos**: SQLite (archivo local, no requiere instalación externa)

## Instalación y arranque

### 1. Instalar dependencias

```bash
# Servidor
cd server && npm install

# Cliente
cd ../client && npm install
```

### 2. Arrancar el servidor (puerto 3001)

```bash
cd server
node server.js
# o para desarrollo con recarga automática:
npx nodemon server.js
```

### 3. Arrancar el cliente (puerto 5173)

```bash
cd client
npm run dev
```

### 4. Abrir en el navegador

```
http://localhost:5173
```

> La primera vez que arranca el servidor, SQLite crea la base de datos y carga los 5 datos de ejemplo automáticamente.

---

## Funcionalidades

| Vista | Descripción |
|---|---|
| **Dashboard** | Métricas globales, tarjetas de proyecto con % completado, carga rápida por miembro, actividad reciente. Auto-refresh cada 5 s. |
| **Tareas** | Vista Kanban por estado (Pendiente / En progreso / Bloqueado / Completado). Cambio de estado inline, búsqueda y filtros. |
| **Timeline** | Tareas agrupadas por urgencia (vencidas → hoy → esta semana → próximas). |
| **Carga de Trabajo** | Barras por miembro con desglose visual de estados. Alerta de sobrecarga. |
| **Nueva Tarea** | Formulario completo con validación. Permite crear proyectos nuevos al vuelo. |
| **Historial** | Log completo de creaciones, ediciones, cambios de estado y aportes. Filtrable por miembro y tipo. |

## Estructura de carpetas

```
proyecto-gestor/
├── client/
│   ├── src/
│   │   ├── components/   # Header, Avatar, StatusBadge, Toast, TaskModal
│   │   ├── pages/        # Dashboard, Tareas, Timeline, CargaTrabajo, NuevaTarea, Historial
│   │   ├── api.js        # Helper fetch → /api
│   │   ├── App.jsx
│   │   └── index.css
│   ├── vite.config.js    # Proxy /api → localhost:3001
│   └── package.json
├── server/
│   ├── routes/           # proyectos, tareas, aportes, historial, metricas
│   ├── db/
│   │   ├── database.js   # Setup SQLite + seed data
│   │   └── gestor_tareas.sqlite   # Creado automáticamente
│   ├── server.js
│   └── package.json
└── README.md
```

## API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/proyectos` | Listar proyectos con estadísticas |
| POST | `/api/proyectos` | Crear proyecto |
| GET | `/api/tareas` | Listar todas las tareas |
| GET | `/api/tareas/:id` | Tarea con aportes e historial |
| POST | `/api/tareas` | Crear tarea |
| PUT | `/api/tareas/:id` | Editar tarea (registra cambios en historial) |
| DELETE | `/api/tareas/:id` | Eliminar tarea |
| POST | `/api/aportes` | Agregar aporte a una tarea |
| GET | `/api/historial` | Historial de cambios |
| GET | `/api/metricas` | Métricas para el dashboard |

## Miembros del equipo

- **Jonathan** — Líder / Coordinador
- **Bessy** — Coordinadora contable
- **Aura** — Abogada junior
- **Ana Isabel** — Directora jurídica

## Datos precargados

5 tareas de ejemplo en 3 proyectos:
1. Cargar publicaciones a redes sociales
2. Elaborar presentación ponencia
3. Gestionar contacto con Cluvi para herramientas IA
