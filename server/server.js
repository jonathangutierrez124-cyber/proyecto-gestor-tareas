const express = require('express');
const cors = require('cors');
const pool = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET todas los proyectos
app.get('/api/proyectos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proyectos');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET tareas por proyecto
app.get('/api/tareas/:proyecto_id', async (req, res) => {
  try {
    const { proyecto_id } = req.params;
    const result = await pool.query('SELECT * FROM tareas WHERE proyecto_id = $1', [proyecto_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear proyecto
app.post('/api/proyectos', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const result = await pool.query('INSERT INTO proyectos (nombre, descripcion) VALUES ($1, $2) RETURNING *', 
      [nombre, descripcion]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear tarea
app.post('/api/tareas', async (req, res) => {
  try {
    const { proyecto_id, titulo, descripcion, estado } = req.body;
    const result = await pool.query('INSERT INTO tareas (proyecto_id, titulo, descripcion, estado) VALUES ($1, $2, $3, $4) RETURNING *', 
      [proyecto_id, titulo, descripcion, estado]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar tarea
app.put('/api/tareas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, estado } = req.body;
    const result = await pool.query('UPDATE tareas SET titulo = $1, descripcion = $2, estado = $3 WHERE id = $4 RETURNING *', 
      [titulo, descripcion, estado, id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE tarea
app.delete('/api/tareas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tareas WHERE id = $1', [id]);
    res.json({ message: 'Tarea eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
