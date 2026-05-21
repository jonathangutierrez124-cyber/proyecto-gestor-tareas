import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

const POLL_MS = 5000

function pct(completadas, total) {
  if (!total) return 0
  return Math.round((completadas / total) * 100)
}

function MetricCard({ label, value, cls }) {
  return (
    <div className={`metric-card ${cls}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value ?? 0}</div>
    </div>
  )
}

function ProjectCard({ p }) {
  const total = p.total_tareas || 0
  const done  = p.completadas  || 0
  const pct_  = pct(done, total)
  return (
    <div className="project-card">
      <div className="project-card-name">{p.nombre}</div>
      <div className="project-pill-row">
        {p.en_progreso > 0 && <span className="project-pill pill-en-progreso">🔵 {p.en_progreso} en progreso</span>}
        {p.completadas > 0 && <span className="project-pill pill-completado">🟢 {p.completadas} completadas</span>}
        {p.pendientes  > 0 && <span className="project-pill pill-pendiente">🟡 {p.pendientes} pendientes</span>}
        {p.bloqueadas  > 0 && <span className="project-pill pill-bloqueado">🔴 {p.bloqueadas} bloqueadas</span>}
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct_}%` }} />
      </div>
      <div className="progress-label">
        <span>{total} tareas totales</span>
        <span>{pct_}% completado</span>
      </div>
    </div>
  )
}

export default function Dashboard({ refreshKey }) {
  const [metricas, setMetricas] = useState(null)
  const [historial, setHistorial] = useState([])

  const load = useCallback(async () => {
    try {
      const [m, h] = await Promise.all([
        api.get('/metricas'),
        api.get('/historial?limite=8'),
      ])
      setMetricas(m)
      setHistorial(h)
    } catch { /* silently ignore on poll */ }
  }, [])

  useEffect(() => { load() }, [load, refreshKey])

  // Polling every 5 s
  useEffect(() => {
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [load])

  if (!metricas) return <div className="loading">⏳ Cargando dashboard…</div>

  const t = metricas.totales

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">📊 Dashboard</div>
          <div className="page-sub">Resumen general del equipo · Actualización automática cada 5 s</div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="metrics-grid">
        <MetricCard label="Total tareas"  value={t.total}       cls="m-total" />
        <MetricCard label="En progreso"   value={t.en_progreso} cls="m-en-progreso" />
        <MetricCard label="Completadas"   value={t.completadas} cls="m-completadas" />
        <MetricCard label="Pendientes"    value={t.pendientes}  cls="m-pendientes" />
        <MetricCard label="Bloqueadas"    value={t.bloqueadas}  cls="m-bloqueadas" />
      </div>

      {/* Project cards */}
      <div style={{ marginBottom: 24 }}>
        <div className="card-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📁 Proyectos</div>
        <div className="project-cards">
          {metricas.por_proyecto.map(p => <ProjectCard key={p.id} p={p} />)}
        </div>
      </div>

      {/* Workload quick-view */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">👥 Carga por miembro</div>
        {metricas.por_miembro.map(m => {
          const total = m.total || 1
          return (
            <div key={m.asignado} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                <strong>{m.asignado}</strong>
                <span style={{ color: 'var(--text-muted)' }}>{m.completadas}/{m.total} completadas</span>
              </div>
              <div style={{ display: 'flex', height: 8, gap: 3, borderRadius: 999, overflow: 'hidden' }}>
                {m.en_progreso > 0 && <div style={{ flex: m.en_progreso, background: '#2563eb', minWidth: 4 }} />}
                {m.completadas > 0 && <div style={{ flex: m.completadas, background: '#16a34a', minWidth: 4 }} />}
                {m.pendientes  > 0 && <div style={{ flex: m.pendientes,  background: '#d97706', minWidth: 4 }} />}
                {m.bloqueadas  > 0 && <div style={{ flex: m.bloqueadas,  background: '#dc2626', minWidth: 4 }} />}
                {m.total === 0      && <div style={{ flex: 1, background: 'var(--border)' }} />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent history */}
      <div className="card">
        <div className="card-title">🕐 Actividad reciente</div>
        {historial.length === 0
          ? <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin actividad reciente.</div>
          : historial.map(h => (
              <div key={h.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <strong style={{ color: 'var(--primary)' }}>{h.usuario}</strong>
                {h.tipo_cambio === 'creacion' && <> creó <em>{h.tarea_nombre}</em></>}
                {h.tipo_cambio === 'edicion'  && <> editó {h.campo} en <em>{h.tarea_nombre}</em></>}
                {h.tipo_cambio === 'aporte'   && <> agregó aporte a <em>{h.tarea_nombre}</em></>}
                <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 8 }}>
                  {new Date(h.created_at).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
        }
      </div>
    </>
  )
}
