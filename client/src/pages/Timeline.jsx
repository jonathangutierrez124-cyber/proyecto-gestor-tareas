import { useState, useEffect } from 'react'
import { api } from '../api'
import Avatar from '../components/Avatar'
import StatusBadge from '../components/StatusBadge'
import TaskModal from '../components/TaskModal'

function diffDays(fecha) {
  if (!fecha) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const d = new Date(fecha + 'T00:00:00'); d.setHours(0,0,0,0)
  return Math.round((d - today) / 86400000)
}

function DaysChip({ fecha, estado }) {
  if (!fecha || estado === 'Completado') return null
  const diff = diffDays(fecha)
  if (diff < 0)  return <span className="days-chip dc-vencido">Venció hace {Math.abs(diff)} día{Math.abs(diff) !== 1 ? 's' : ''}</span>
  if (diff === 0) return <span className="days-chip dc-urgente">Vence hoy</span>
  if (diff <= 3)  return <span className="days-chip dc-urgente">Vence en {diff} días</span>
  if (diff <= 7)  return <span className="days-chip dc-ok">Esta semana</span>
  return <span className="days-chip dc-future">En {diff} días</span>
}

function fmtDate(dt) {
  if (!dt) return '—'
  return new Date(dt + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' })
}

export default function Timeline({ currentUser, showToast, refresh, refreshKey }) {
  const [tareas,  setTareas]  = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/tareas')
      .then(setTareas)
      .catch(e => showToast(e.message, 'error'))
  }, [refreshKey])

  // Group into: vencidas | hoy | esta semana | próximas | sin fecha
  const today = new Date(); today.setHours(0,0,0,0)
  const in7   = new Date(today); in7.setDate(today.getDate() + 7)

  const groups = [
    { key: 'vencidas',   label: '🔴 Vencidas',       items: [] },
    { key: 'hoy',        label: '🟠 Vence hoy',       items: [] },
    { key: 'semana',     label: '🟡 Esta semana',      items: [] },
    { key: 'proximas',   label: '🟢 Próximas',         items: [] },
    { key: 'sin-fecha',  label: '⚪ Sin fecha límite', items: [] },
  ]

  const sorted = [...tareas].sort((a, b) => {
    if (!a.fecha_limite && !b.fecha_limite) return 0
    if (!a.fecha_limite) return 1
    if (!b.fecha_limite) return -1
    return a.fecha_limite.localeCompare(b.fecha_limite)
  })

  for (const t of sorted) {
    if (!t.fecha_limite) { groups[4].items.push(t); continue }
    const d = diffDays(t.fecha_limite)
    if (t.estado === 'Completado') { groups[3].items.push(t); continue }
    if (d < 0)  groups[0].items.push(t)
    else if (d === 0) groups[1].items.push(t)
    else if (d <= 7)  groups[2].items.push(t)
    else              groups[3].items.push(t)
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">📅 Timeline</div>
          <div className="page-sub">Tareas ordenadas por fecha límite</div>
        </div>
      </div>

      {groups.map(g => (
        g.items.length === 0 ? null : (
          <div key={g.key}>
            <div className="timeline-group-label">{g.label} <span className="count-chip">{g.items.length}</span></div>
            {g.items.map((t, i) => (
              <div key={t.id} className="tl-row">
                <div className="tl-date">{fmtDate(t.fecha_limite)}</div>
                <div className="tl-line">
                  <div className="tl-dot" style={{ borderColor: t.estado === 'Completado' ? 'var(--s-completado)' : t.estado === 'Bloqueado' ? 'var(--s-bloqueado)' : 'var(--primary)' }} />
                  {i < g.items.length - 1 && <div className="tl-connector" />}
                </div>
                <div className="tl-card" style={{ cursor: 'pointer' }} onClick={() => setSelected(t.id)}>
                  <div className="tl-name">{t.nombre}</div>
                  <div className="tl-meta">
                    <StatusBadge estado={t.estado} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Avatar name={t.asignado} size={18} />{t.asignado}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>📁 {t.proyecto_nombre}</span>
                    <DaysChip fecha={t.fecha_limite} estado={t.estado} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ))}

      {tareas.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div className="empty-text">No hay tareas registradas</div>
        </div>
      )}

      {selected && (
        <TaskModal
          tareaId={selected}
          onClose={() => setSelected(null)}
          currentUser={currentUser}
          showToast={showToast}
          onRefresh={() => { api.get('/tareas').then(setTareas); refresh() }}
        />
      )}
    </>
  )
}
