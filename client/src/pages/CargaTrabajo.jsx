import { useState, useEffect } from 'react'
import { api } from '../api'
import Avatar from '../components/Avatar'

const OVERLOAD_THRESHOLD = 4

export default function CargaTrabajo({ refreshKey }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/metricas').then(setData).catch(() => {})
  }, [refreshKey])

  if (!data) return <div className="loading">⏳ Cargando…</div>

  const allMembers = ['Jonathan', 'Bessy', 'Aura', 'Ana Isabel']
  const byMember = {}
  for (const m of allMembers) {
    byMember[m] = data.por_miembro.find(x => x.asignado === m) || {
      asignado: m, total: 0, completadas: 0, en_progreso: 0, pendientes: 0, bloqueadas: 0
    }
  }

  const maxTotal = Math.max(...Object.values(byMember).map(m => m.total), 1)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">👥 Carga de Trabajo</div>
          <div className="page-sub">Distribución de tareas por miembro del equipo</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Leyenda de estados</div>
        <div className="wl-legend">
          <div className="wl-legend-item"><div className="wl-dot" style={{ background: '#2563eb' }} /> En progreso</div>
          <div className="wl-legend-item"><div className="wl-dot" style={{ background: '#16a34a' }} /> Completado</div>
          <div className="wl-legend-item"><div className="wl-dot" style={{ background: '#d97706' }} /> Pendiente</div>
          <div className="wl-legend-item"><div className="wl-dot" style={{ background: '#dc2626' }} /> Bloqueado</div>
        </div>
      </div>

      <div className="card">
        {allMembers.map(name => {
          const m       = byMember[name]
          const total   = m.total
          const pctDone = total ? Math.round((m.completadas / total) * 100) : 0
          const overload = m.en_progreso + m.pendientes >= OVERLOAD_THRESHOLD

          return (
            <div key={name} className="wl-item">
              <div className="wl-head">
                <div className="wl-name">
                  <Avatar name={name} size={34} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{name}</div>
                    {overload && <div style={{ fontSize: 11, color: 'var(--s-bloqueado)', fontWeight: 600 }}>⚠️ Sobrecargado</div>}
                  </div>
                </div>
                <div className="wl-numbers">
                  {pctDone}% completado &nbsp;|&nbsp; {total} tarea{total !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Stacked bar */}
              <div style={{ height: 14, display: 'flex', gap: 3, borderRadius: 999, overflow: 'hidden', background: 'var(--border)' }}>
                {total === 0
                  ? <div style={{ flex: 1, background: 'var(--border)' }} />
                  : <>
                      {m.en_progreso > 0 && <div style={{ flex: m.en_progreso, background: '#2563eb', minWidth: 6 }} title={`En progreso: ${m.en_progreso}`} />}
                      {m.completadas > 0 && <div style={{ flex: m.completadas, background: '#16a34a', minWidth: 6 }} title={`Completadas: ${m.completadas}`} />}
                      {m.pendientes  > 0 && <div style={{ flex: m.pendientes,  background: '#d97706', minWidth: 6 }} title={`Pendientes: ${m.pendientes}`} />}
                      {m.bloqueadas  > 0 && <div style={{ flex: m.bloqueadas,  background: '#dc2626', minWidth: 6 }} title={`Bloqueadas: ${m.bloqueadas}`} />}
                    </>
                }
              </div>

              {/* Breakdown pills */}
              <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                {m.en_progreso > 0 && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#dbeafe', color: '#1e40af', fontWeight: 600 }}>🔵 {m.en_progreso} en progreso</span>}
                {m.completadas > 0 && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#dcfce7', color: '#166534', fontWeight: 600 }}>🟢 {m.completadas} completadas</span>}
                {m.pendientes  > 0 && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>🟡 {m.pendientes} pendientes</span>}
                {m.bloqueadas  > 0 && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#fee2e2', color: '#991b1b', fontWeight: 600 }}>🔴 {m.bloqueadas} bloqueadas</span>}
                {total === 0       && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sin tareas asignadas</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary table */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title">Resumen comparativo</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Miembro</th>
              <th style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Total</th>
              <th style={{ padding: '8px 12px', color: '#2563eb', fontWeight: 600, textAlign: 'center' }}>En progreso</th>
              <th style={{ padding: '8px 12px', color: '#16a34a', fontWeight: 600, textAlign: 'center' }}>Completadas</th>
              <th style={{ padding: '8px 12px', color: '#d97706', fontWeight: 600, textAlign: 'center' }}>Pendientes</th>
              <th style={{ padding: '8px 12px', color: '#dc2626', fontWeight: 600, textAlign: 'center' }}>Bloqueadas</th>
            </tr>
          </thead>
          <tbody>
            {allMembers.map(name => {
              const m = byMember[name]
              return (
                <tr key={name} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={name} size={22} />{name}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{m.total}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{m.en_progreso || 0}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{m.completadas || 0}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{m.pendientes || 0}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{m.bloqueadas || 0}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
