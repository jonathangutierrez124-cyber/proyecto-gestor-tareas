const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// GET /api/metricas — dashboard stats
router.get('/', (_req, res) => {
  try {
    const totales = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'Completado'  THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN estado = 'En progreso' THEN 1 ELSE 0 END) as en_progreso,
        SUM(CASE WHEN estado = 'Pendiente'   THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'Bloqueado'   THEN 1 ELSE 0 END) as bloqueadas
      FROM tareas
    `).get();

    const por_miembro = db.prepare(`
      SELECT
        asignado,
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'Completado'  THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN estado = 'En progreso' THEN 1 ELSE 0 END) as en_progreso,
        SUM(CASE WHEN estado = 'Pendiente'   THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'Bloqueado'   THEN 1 ELSE 0 END) as bloqueadas
      FROM tareas GROUP BY asignado ORDER BY asignado
    `).all();

    const por_proyecto = db.prepare(`
      SELECT
        p.id, p.nombre,
        COUNT(t.id) as total_tareas,
        SUM(CASE WHEN t.estado = 'Completado'  THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN t.estado = 'En progreso' THEN 1 ELSE 0 END) as en_progreso,
        SUM(CASE WHEN t.estado = 'Pendiente'   THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN t.estado = 'Bloqueado'   THEN 1 ELSE 0 END) as bloqueadas
      FROM proyectos p
      LEFT JOIN tareas t ON t.proyecto_id = p.id
      GROUP BY p.id ORDER BY p.nombre
    `).all();

    res.json({ totales, por_miembro, por_proyecto });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
