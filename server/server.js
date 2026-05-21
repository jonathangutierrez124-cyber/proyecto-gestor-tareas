const express = require('express');
const cors = require('cors');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET todas los proyectos
app.get('/api/proyectos', (req, res) => {
  db.all('SELECT * FROM proyectos', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// GET tareas por proyecto
app.get('/api/tareas/:proyecto_id', (req, res) => {
  const { proyecto_id } = req.params;
  db.all('SELECT * FROM tareas WHERE proyecto_id = ?', [proyecto_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// POST crear proyecto
app.post('/api/proyectos', (req, res) => {
  const { nombre, descripcion } = req.body;
  db.run('INSERT INTO proyectos (nombre, descripcion) VALUES (?, ?)', 
    [nombre, descripcion], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, nombre, descripcion });
      }
    });
});

// POST crear tarea
app.post('/api/tareas', (req, res) => {
  const { proyecto_id, titulo, descripcion, estado } = req.body;
  db.run('INSERT INTO tareas (proyecto_id, titulo, descripcion, estado) VALUES (?, ?, ?, ?)', 
    [proyecto_id, titulo, descripcion, estado],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, proyecto_id, titulo, descripcion, estado });
      }
    });
});

// PUT actualizar tarea
app.put('/api/tareas/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, estado } = req.body;
  db.run('UPDATE tareas SET titulo = ?, descripcion = ?, estado = ? WHERE id = ?', 
    [titulo, descripcion, estado, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Tarea actualizada' });
      }
    });
});

// DELETE tarea
app.delete('/api/tareas/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tareas WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Tarea eliminada' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
