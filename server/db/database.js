const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Error en la conexión a la BD:', err);
});

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS proyectos (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tareas (
        id SERIAL PRIMARY KEY,
        proyecto_id INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        estado TEXT DEFAULT 'pendiente',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await seedDatabase();
    console.log('Base de datos inicializada');
  } catch (err) {
    console.error('Error al inicializar BD:', err);
  }
}

async function seedDatabase() {
  try {
    const count = await pool.query('SELECT COUNT(*) FROM proyectos');
    
    if (count.rows[0].count === 0) {
      await pool.query("INSERT INTO proyectos (nombre, descripcion) VALUES ($1, $2)", 
        ['Proyecto A', 'Descripción del Proyecto A']);
      await pool.query("INSERT INTO proyectos (nombre, descripcion) VALUES ($1, $2)", 
        ['Proyecto B', 'Descripción del Proyecto B']);
      await pool.query("INSERT INTO tareas (proyecto_id, titulo, descripcion, estado) VALUES ($1, $2, $3, $4)", 
        [1, 'Tarea 1', 'Descripción Tarea 1', 'pendiente']);
      await pool.query("INSERT INTO tareas (proyecto_id, titulo, descripcion, estado) VALUES ($1, $2, $3, $4)", 
        [1, 'Tarea 2', 'Descripción Tarea 2', 'completada']);
      await pool.query("INSERT INTO tareas (proyecto_id, titulo, descripcion, estado) VALUES ($1, $2, $3, $4)", 
        [2, 'Tarea 3', 'Descripción Tarea 3', 'pendiente']);
      
      console.log('Datos de prueba insertados');
    }
  } catch (err) {
    console.error('Error al hacer seed:', err);
  }
}

initDatabase();

module.exports = pool;
