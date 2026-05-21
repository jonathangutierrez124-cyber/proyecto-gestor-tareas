const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// GET /api/historial?tarea_id=X&limite=50
router.get('/', (req, res) => {
  try {
    const { tarea_id, limite = 100 } = req.query;
    const rows = tarea_id
      ? db.prepare('SELECT * FROM historial WHERE tarea_id = ? ORDER BY created_at DESC').all(tarea_id)
      : db.prepare('SELECT * FROM historial ORDER BY created_at DESC LIMIT ?').all(Number(limite));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
