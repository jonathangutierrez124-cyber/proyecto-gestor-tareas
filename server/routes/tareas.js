const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

const WITH_PROJECT = `
  SELECT t.*, p.nombre as proyecto_nombre
  FROM tareas t
  JOIN proyectos p ON t.proyecto_id = p.id
`;

// GET /api/tareas
router.get('/', (_req, res) => {
  try {
    const tareas = db.prepare(`${WITH_PROJECT} ORDER BY t.fecha_limite ASC, t.created_at DESC`).all();
    res.json(tareas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tareas/:id  (with aportes)
router.get('/:id', (req, res) => {
  try {
    const tarea = db.prepare(`${WITH_PROJECT} WHERE t.id = ?`).get(req.params.id);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
    tarea.aportes  = db.prepare('SELECT * FROM aportes WHERE tarea_id = ? ORDER BY created_at ASC').all(req.params.id);
    tarea.historial = db.prepare('SELECT * FROM historial WHERE tarea_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(tarea);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tareas
router.post('/', (req, res) => {
  const { proyecto_id, nombre, descripcion, asignado, estado, fecha_limite, notas, usuario } = req.body;
  if (!proyecto_id || !nombre?.trim() || !asignado) {
    return res.status(400).json({ error: 'Proyecto, nombre y asignado son obligatorios' });
  }
  try {
    const result = db.prepare(`
      INSERT INTO tareas (proyecto_id, nombre, descripcion, asignado, estado, fecha_limite, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(proyecto_id, nombre.trim(), descripcion || '', asignado, estado || 'Pendiente', fecha_limite || null, notas || '');

    const tarea = db.prepare(`${WITH_PROJECT} WHERE t.id = ?`).get(result.lastInsertRowid);

    db.prepare(`
      INSERT INTO historial (tarea_id, tarea_nombre, proyecto_nombre, tipo_cambio, campo, valor_anterior, valor_nuevo, usuario)
      VALUES (?, ?, ?, 'creacion', NULL, NULL, 'Tarea creada', ?)
    `).run(tarea.id, tarea.nombre, tarea.proyecto_nombre, usuario || 'Sistema');

    res.status(201).json(tarea);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tareas/:id
router.put('/:id', (req, res) => {
  const { nombre, descripcion, asignado, estado, fecha_limite, notas, usuario } = req.body;
  try {
    const actual = db.prepare(`${WITH_PROJECT} WHERE t.id = ?`).get(req.params.id);
    if (!actual) return res.status(404).json({ error: 'Tarea no encontrada' });

    const campos = { nombre, descripcion, asignado, estado, fecha_limite, notas };
    const labels = { nombre: 'Nombre', descripcion: 'Descripción', asignado: 'Asignado a', estado: 'Estado', fecha_limite: 'Fecha límite', notas: 'Notas' };

    db.prepare(`
      UPDATE tareas SET
        nombre       = ?,
        descripcion  = ?,
        asignado     = ?,
        estado       = ?,
        fecha_limite = ?,
        notas        = ?,
        updated_at   = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      nombre       ?? actual.nombre,
      descripcion  ?? actual.descripcion,
      asignado     ?? actual.asignado,
      estado       ?? actual.estado,
      fecha_limite ?? actual.fecha_limite,
      notas        ?? actual.notas,
      req.params.id
    );

    const insH = db.prepare(`
      INSERT INTO historial (tarea_id, tarea_nombre, proyecto_nombre, tipo_cambio, campo, valor_anterior, valor_nuevo, usuario)
      VALUES (?, ?, ?, 'edicion', ?, ?, ?, ?)
    `);
    for (const [campo, val] of Object.entries(campos)) {
      if (val !== undefined && val !== actual[campo]) {
        insH.run(actual.id, actual.nombre, actual.proyecto_nombre, labels[campo], actual[campo] ?? '', val ?? '', usuario || 'Sistema');
      }
    }

    res.json(db.prepare(`${WITH_PROJECT} WHERE t.id = ?`).get(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tareas/:id
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tareas WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
