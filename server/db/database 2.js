const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'gestor_tareas.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Base de datos conectada');
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {
    // Tabla de proyectos
    db.run(`
      CREATE TABLE IF NOT EXISTS proyectos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de tareas
    db.run(`
      CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proyecto_id INTEGER NOT NULL,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        estado TEXT DEFAULT 'pendiente',
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id)
      )
    `, () => {
      seedDatabase();
    });
  });
}

function seedDatabase() {
  db.get("SELECT COUNT(*) as count FROM proyectos", (err, row) => {
    if (err) {
      console.error('Error al verificar proyectos:', err);
      return;
    }

    if (row.count === 0) {
      db.serialize(() => {
        db.run("INSERT INTO proyectos (nombre, descripcion) VALUES (?, ?)", 
          ['Proyecto A', 'Descripción del Proyecto A']);
        db.run("INSERT INTO proyectos (nombre, descripcion) VALUES (?, ?)", 
          ['Proyecto B', 'Descripción del Proyecto B']);
        db.run("INSERT INTO tareas (proyecto_id, titulo, descripcion, estado) VALUES (?, ?, ?, ?)", 
          [1, 'Tarea 1', 'Descripción Tarea 1', 'pendiente']);
        db.run("INSERT INTO tareas (proyecto_id, titulo, descripcion, estado) VALUES (?, ?, ?, ?)", 
          [1, 'Tarea 2', 'Descripción Tarea 2', 'completada']);
        db.run("INSERT INTO tareas (proyecto_id, titulo, descripcion, estado) VALUES (?, ?, ?, ?)", 
          [2, 'Tarea 3', 'Descripción Tarea 3', 'pendiente']);
      });
    }
  });
}

module.exports = db;
