const express = require('express');
const cors = require('cors');

require('./db/database'); // initialize and seed DB on startup

const proyectosRouter = require('./routes/proyectos');
const tareasRouter    = require('./routes/tareas');
const aportesRouter   = require('./routes/aportes');
const historialRouter = require('./routes/historial');
const metricasRouter  = require('./routes/metricas');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.use('/api/proyectos', proyectosRouter);
app.use('/api/tareas',    tareasRouter);
app.use('/api/aportes',   aportesRouter);
app.use('/api/historial', historialRouter);
app.use('/api/metricas',  metricasRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
