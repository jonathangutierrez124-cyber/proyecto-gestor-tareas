import { useState, useEffect } from 'react'
import { api } from '../api'
import Avatar from '../components/Avatar'
import StatusBadge from '../components/StatusBadge'
import TaskModal from '../components/TaskModal'

const ESTADOS  = ['Pendiente', 'En progreso', 'Bloqueado', 'Completado']
const MEMBERS  = ['', 'Jonathan', 'Bessy', 'Aura', 'Ana Isabel']
const DOT = { 'Pendiente': '🟡', 'En progreso': '🔵', 'Bloqueado': '🔴', 'Completado': '🟢' }

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

function isOverdue(fecha) {
  if (!fecha) return false
  return new Date(fecha + 'T23:59:59') < new Date()
}

export default function Tareas({ currentUser, showToast, refresh, refreshKey }) {
  const [tareas,     setTareas]     = useState([])
  const [proyectos,  setProyectos]  = useState([])
  const [search,     setSearch]     = useState('')
  const [filterP,    setFilterP]    = useState('')
  const [filterM,    setFilterM]    = useState('')
  const [selected,   setSelected]   = useState(null) // tareaId for modal
  const [loading,    setLoading]    = useState(true)

  const load = async () => {
    try {
      const [t, p] = await Promise.all([api.get('/tareas'), api.get('/proyectos')])
      setTareas(t)
      setProyectos(p)
    } catch (e) { showToast(e.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [refreshKey])

  const changeEstado = async (id, estado) => {
    try {
      await api.put(`/tareas/${id}`, { estado, usuario: currentUser })
      showToast(`Estado actualizado: ${estado}`)
      load()
      refresh()
    } catch (e) { showToast(e.message, 'error') }
  }

  const filtered = tareas.filter(t => {
    const q = search.toLowerCase()
    const matchQ = !q || t.nombre.toLowerCase().includes(q) || t.descripcion?.toLowerCase().includes(q)
    const matchP = !filterP || t.proyecto_nombre === filterP
    const matchM = !filterM || t.asignado === filterM
    return matchQ && matchP && matchM
  })

  const byEstado = (estado) => filtered.filter(t => t.estado === estado)

  if (loading) return <div className="loading">⏳ Cargando tareas…</div>

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">📋 Tareas</div>
          <div className="page-sub">Vista por estado · {filtered.length} tareas</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          placeholder="🔍 Buscar tarea…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={filterP} onChange={e => setFilterP(e.target.value)}>
          <option value="">📁 Todos los proyectos</option>
          {proyectos.map(p => <option key={p.id}>{p.nombre}</option>)}
        </select>
        <select value={filterM} onChange={e => setFilterM(e.target.value)}>
          <option value="">👤 Todos los miembros</option>
          {MEMBERS.filter(Boolean).map(m => <option key={m}>{m}</option>)}
        </select>
        {(search || filterP || filterM) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterP(''); setFilterM('') }}>✕ Limpiar</button>
        )}
      </div>

      {/* Columns */}
      <div className="status-cols">
        {ESTADOS.map(estado => {
          const items = byEstado(estado)
          return (
            <div key={estado} className="status-col">
              <div className="status-col-head">
                <div className="status-col-title">
                  <span>{DOT[estado]}</span>
                  {estado}
                </div>
                <span className="count-chip">{items.length}</span>
              </div>

              {items.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '12px 0', textAlign: 'center' }}>
                  Sin tareas
                </div>
              )}

              {items.map(t => (
                <div key={t.id} className={`task-card bc-${t.estado}`} style={isOverdue(t.fecha_limite) && t.estado !== 'Completado' ? { borderTop: '2px solid var(--s-bloqueado)' } : {}}>
                  <div className="task-header">
                    <div>
                      <div className="task-project">📁 {t.proyecto_nombre}</div>
                      <div className="task-name">{t.nombre}</div>
                    </div>
                    <Avatar name={t.asignado} size={26} />
                  </div>

                  {t.descripcion && <div className="task-desc">{t.descripcion}</div>}

                  <div className="task-meta" style={{ marginTop: 6 }}>
                    <span className="task-meta-item">
                      📅 {fmt(t.fecha_limite)}
                      {isOverdue(t.fecha_limite) && t.estado !== 'Completado' && (
                        <span style={{ color: 'var(--s-bloqueado)', fontWeight: 700, marginLeft: 4 }}>VENCIDA</span>
                      )}
                    </span>
                    <span className="task-meta-item">👤 {t.asignado}</span>
                  </div>

                  {t.notas && <div className="task-notes">{t.notas}</div>}

                  <div className="task-actions">
                    <select
                      className="estado-inline"
                      value={t.estado}
                      onChange={e => changeEstado(t.id, e.target.value)}
                      title="Cambiar estado"
                    >
                      {ESTADOS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelected(t.id)}>
                      Ver / Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {selected && (
        <TaskModal
          tareaId={selected}
          onClose={() => setSelected(null)}
          currentUser={currentUser}
          showToast={showToast}
          onRefresh={() => { load(); refresh() }}
        />
      )}
    </>
  )
}
