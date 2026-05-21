const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'gestor_tareas.sqlite');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS proyectos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tareas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proyecto_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT DEFAULT '',
    asignado TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Pendiente',
    fecha_limite DATE,
    notas TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS aportes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tarea_id INTEGER NOT NULL,
    contenido TEXT NOT NULL,
    autor TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tarea_id INTEGER,
    tarea_nombre TEXT NOT NULL,
    proyecto_nombre TEXT NOT NULL,
    tipo_cambio TEXT NOT NULL,
    campo TEXT,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    usuario TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed data only if DB is empty
const count = db.prepare('SELECT COUNT(*) as c FROM proyectos').get();
if (count.c === 0) {
  const insP = db.prepare('INSERT INTO proyectos (nombre, descripcion) VALUES (?, ?)');
  const p1 = insP.run('Cargar publicaciones a redes sociales', 'Gestión de contenido para redes sociales corporativas');
  const p2 = insP.run('Elaborar presentación ponencia', 'Preparación de material para ponencia académica/profesional');
  const p3 = insP.run('Gestionar contacto con Cluvi para herramientas IA', 'Coordinación con Cluvi para implementación de herramientas de IA');

  const insT = db.prepare(`
    INSERT INTO tareas (proyecto_id, nombre, descripcion, asignado, estado, fecha_limite, notas)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const t1 = insT.run(p1.lastInsertRowid, 'Diseñar contenido visual', 'Crear gráficas para publicaciones', 'Bessy', 'En progreso', '2026-05-28', 'Usar paleta corporativa');
  const t2 = insT.run(p1.lastInsertRowid, 'Redactar copy', 'Escribir textos para redes', 'Aura', 'En progreso', '2026-05-27', 'Tono profesional informal');
  const t3 = insT.run(p2.lastInsertRowid, 'Recopilar datos', 'Investigación y estadísticas', 'Ana Isabel', 'Pendiente', '2026-05-30', 'Enfoque en tributaria');
  const t4 = insT.run(p2.lastInsertRowid, 'Diseñar diapositivas', 'Estructura visual de presentación', 'Jonathan', 'Pendiente', '2026-05-31', '');
  const t5 = insT.run(p3.lastInsertRowid, 'Contacto inicial', 'Email de presentación a Cluvi', 'Jonathan', 'Completado', '2026-05-22', 'Respuesta pendiente');

  const insH = db.prepare(`
    INSERT INTO historial (tarea_id, tarea_nombre, proyecto_nombre, tipo_cambio, campo, valor_anterior, valor_nuevo, usuario)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insH.run(t1.lastInsertRowid, 'Diseñar contenido visual', 'Cargar publicaciones a redes sociales', 'creacion', null, null, 'Tarea creada', 'Sistema');
  insH.run(t2.lastInsertRowid, 'Redactar copy', 'Cargar publicaciones a redes sociales', 'creacion', null, null, 'Tarea creada', 'Sistema');
  insH.run(t3.lastInsertRowid, 'Recopilar datos', 'Elaborar presentación ponencia', 'creacion', null, null, 'Tarea creada', 'Sistema');
  insH.run(t4.lastInsertRowid, 'Diseñar diapositivas', 'Elaborar presentación ponencia', 'creacion', null, null, 'Tarea creada', 'Sistema');
  insH.run(t5.lastInsertRowid, 'Contacto inicial', 'Gestionar contacto con Cluvi para herramientas IA', 'estado', 'estado', 'Pendiente', 'Completado', 'Jonathan');

  const insA = db.prepare('INSERT INTO aportes (tarea_id, contenido, autor) VALUES (?, ?, ?)');
  insA.run(t5.lastInsertRowid, 'Se envió email formal el 20 de mayo. Quedamos en esperar respuesta en 3 días hábiles.', 'Jonathan');
}

module.exports = db;
