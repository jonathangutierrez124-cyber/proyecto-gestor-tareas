const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// GET /api/proyectos — all projects with task stats
router.get('/', (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT p.*,
        COUNT(t.id) as total_tareas,
        SUM(CASE WHEN t.estado = 'Completado'  THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN t.estado = 'En progreso' THEN 1 ELSE 0 END) as en_progreso,
        SUM(CASE WHEN t.estado = 'Pendiente'   THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN t.estado = 'Bloqueado'   THEN 1 ELSE 0 END) as bloqueadas
      FROM proyectos p
      LEFT JOIN tareas t ON t.proyecto_id = p.id
      GROUP BY p.id
      ORDER BY p.nombre
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/proyectos
router.post('/', (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre del proyecto es obligatorio' });
  try {
    const result  = db.prepare('INSERT INTO proyectos (nombre, descripcion) VALUES (?, ?)').run(nombre.trim(), descripcion || '');
    const proyecto = db.prepare('SELECT * FROM proyectos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(proyecto);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Ya existe un proyecto con ese nombre' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/proyectos/:id
router.put('/:id', (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    db.prepare('UPDATE proyectos SET nombre = ?, descripcion = ? WHERE id = ?').run(nombre, descripcion, req.params.id);
    res.json(db.prepare('SELECT * FROM proyectos WHERE id = ?').get(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/proyectos/:id
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM proyectos WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
