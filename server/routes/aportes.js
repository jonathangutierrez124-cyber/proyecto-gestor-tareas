const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// GET /api/aportes?tarea_id=X
router.get('/', (req, res) => {
  try {
    const { tarea_id } = req.query;
    const rows = tarea_id
      ? db.prepare('SELECT * FROM aportes WHERE tarea_id = ? ORDER BY created_at ASC').all(tarea_id)
      : db.prepare('SELECT * FROM aportes ORDER BY created_at DESC LIMIT 50').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/aportes
router.post('/', (req, res) => {
  const { tarea_id, contenido, autor } = req.body;
  if (!tarea_id || !contenido?.trim() || !autor) {
    return res.status(400).json({ error: 'tarea_id, contenido y autor son obligatorios' });
  }
  try {
    const tarea = db.prepare(`
      SELECT t.nombre, p.nombre as proyecto_nombre
      FROM tareas t JOIN proyectos p ON t.proyecto_id = p.id WHERE t.id = ?
    `).get(tarea_id);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    const result = db.prepare('INSERT INTO aportes (tarea_id, contenido, autor) VALUES (?, ?, ?)').run(tarea_id, contenido.trim(), autor);

    db.prepare(`
      INSERT INTO historial (tarea_id, tarea_nombre, proyecto_nombre, tipo_cambio, campo, valor_anterior, valor_nuevo, usuario)
      VALUES (?, ?, ?, 'aporte', 'Aportes', '', ?, ?)
    `).run(tarea_id, tarea.nombre, tarea.proyecto_nombre, contenido.trim(), autor);

    res.status(201).json(db.prepare('SELECT * FROM aportes WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
