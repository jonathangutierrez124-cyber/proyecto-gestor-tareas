import { useState, useEffect } from 'react'
import { api } from '../api'

const TIPO_ICON  = { creacion: '🆕', edicion: '✏️', aporte: '💬', estado: '🔄' }
const TIPO_LABEL = { creacion: 'Creación', edicion: 'Edición', aporte: 'Aporte', estado: 'Estado' }
const MEMBERS    = ['', 'Jonathan', 'Bessy', 'Aura', 'Ana Isabel', 'Sistema']

function fmtFull(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function HistItem({ h }) {
  return (
    <div className="hist-item">
      <div className="hist-icon">{TIPO_ICON[h.tipo_cambio] || '📝'}</div>
      <div className="hist-body">
        <div className="hist-line">
          <strong>{h.usuario}</strong>
          {h.tipo_cambio === 'creacion' && <> creó la tarea <em>"{h.tarea_nombre}"</em></>}
          {h.tipo_cambio === 'edicion'  && <> cambió <strong style={{ color: 'var(--text)' }}>{h.campo}</strong> en <em>"{h.tarea_nombre}"</em>: <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>"{h.valor_anterior}"</span> → <span style={{ color: 'var(--primary)' }}>"{h.valor_nuevo}"</span></>}
          {h.tipo_cambio === 'aporte'   && <> agregó aporte a <em>"{h.tarea_nombre}"</em>: <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>"{h.valor_nuevo?.substring(0, 80)}{h.valor_nuevo?.length > 80 ? '…' : ''}"</span></>}
          {h.tipo_cambio === 'estado'   && <> cambió estado en <em>"{h.tarea_nombre}"</em> a <strong>{h.valor_nuevo}</strong></>}
        </div>
        <div className="hist-meta">
          📁 {h.proyecto_nombre} &nbsp;·&nbsp; {fmtFull(h.created_at)}
        </div>
      </div>
    </div>
  )
}

export default function Historial({ refreshKey }) {
  const [rows,      setRows]      = useState([])
  const [filterM,   setFilterM]   = useState('')
  const [filterT,   setFilterT]   = useState('')
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    api.get('/historial?limite=200')
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [refreshKey])

  const filtered = rows.filter(h => {
    const matchM = !filterM || h.usuario === filterM
    const matchT = !filterT || h.tipo_cambio === filterT
    return matchM && matchT
  })

  if (loading) return <div className="loading">⏳ Cargando historial…</div>

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">🕐 Historial de Cambios</div>
          <div className="page-sub">Registro completo de toda la actividad del equipo</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <select value={filterM} onChange={e => setFilterM(e.target.value)}>
          <option value="">👤 Todos los miembros</option>
          {MEMBERS.filter(Boolean).map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={filterT} onChange={e => setFilterT(e.target.value)}>
          <option value="">📂 Todos los tipos</option>
          {Object.entries(TIPO_LABEL).map(([k, v]) => <option key={k} value={k}>{TIPO_ICON[k]} {v}</option>)}
        </select>
        {(filterM || filterT) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterM(''); setFilterT('') }}>✕ Limpiar</button>
        )}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length} entradas
        </span>
      </div>

      <div className="card">
        {filtered.length === 0
          ? <div className="empty-state"><div className="empty-icon">🕐</div><div className="empty-text">Sin entradas en el historial</div></div>
          : filtered.map(h => <HistItem key={h.id} h={h} />)
        }
      </div>
    </>
  )
}
