import { useState, useEffect } from 'react'
import { api } from '../api'
import Avatar from './Avatar'
import StatusBadge from './StatusBadge'

const ESTADOS  = ['Pendiente', 'En progreso', 'Bloqueado', 'Completado']
const MEMBERS  = ['Jonathan', 'Bessy', 'Aura', 'Ana Isabel']

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtFull(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const TIPO_ICON = { creacion: '🆕', edicion: '✏️', aporte: '💬', estado: '🔄' }

export default function TaskModal({ tareaId, onClose, currentUser, showToast, onRefresh }) {
  const [tarea,    setTarea]    = useState(null)
  const [editing,  setEditing]  = useState(false)
  const [form,     setForm]     = useState({})
  const [aporte,   setAporte]   = useState('')
  const [saving,   setSaving]   = useState(false)
  const [tab,      setTab]      = useState('detalle') // detalle | historial

  const load = async () => {
    try {
      const data = await api.get(`/tareas/${tareaId}`)
      setTarea(data)
      setForm({
        nombre:      data.nombre,
        descripcion: data.descripcion,
        asignado:    data.asignado,
        estado:      data.estado,
        fecha_limite: data.fecha_limite || '',
        notas:       data.notas,
      })
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  useEffect(() => { load() }, [tareaId])

  const save = async () => {
    setSaving(true)
    try {
      await api.put(`/tareas/${tareaId}`, { ...form, usuario: currentUser })
      showToast('Tarea actualizada')
      setEditing(false)
      await load()
      onRefresh()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const addAporte = async () => {
    if (!aporte.trim()) return
    setSaving(true)
    try {
      await api.post('/aportes', { tarea_id: tareaId, contenido: aporte.trim(), autor: currentUser })
      setAporte('')
      showToast('Aporte agregado')
      await load()
      onRefresh()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!tarea) return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="loading">Cargando…</div>
      </div>
    </div>
  )

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-head">
          <div style={{ flex: 1, paddingRight: 12 }}>
            {editing
              ? <input className="form-input" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={{ fontWeight: 700, fontSize: 16 }} />
              : <div className="modal-title">{tarea.nombre}</div>
            }
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              📁 {tarea.proyecto_nombre}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
            {['detalle', 'historial'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ background: 'none', border: 'none', fontWeight: tab === t ? 700 : 400, color: tab === t ? 'var(--primary)' : 'var(--text-muted)', fontSize: 13, padding: '4px 8px', borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer' }}>
                {t === 'detalle' ? '📋 Detalle' : '🕐 Historial'}
              </button>
            ))}
          </div>

          {tab === 'detalle' && (
            <>
              {/* Fields */}
              {editing ? (
                <>
                  <div className="grid-2" style={{ marginBottom: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Estado</label>
                      <select className="form-select" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                        {ESTADOS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Asignado a</label>
                      <select className="form-select" value={form.asignado} onChange={e => setForm(f => ({ ...f, asignado: e.target.value }))}>
                        {MEMBERS.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fecha límite</label>
                    <input type="date" className="form-input" value={form.fecha_limite} onChange={e => setForm(f => ({ ...f, fecha_limite: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-textarea" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Notas</label>
                    <textarea className="form-textarea" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
                    <StatusBadge estado={tarea.estado} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar name={tarea.asignado} size={22} />
                      <span style={{ fontSize: 13 }}>{tarea.asignado}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📅 {fmt(tarea.fecha_limite)}</span>
                  </div>
                  {tarea.descripcion && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>{tarea.descripcion}</p>}
                  {tarea.notas && (
                    <div className="task-notes" style={{ marginBottom: 12 }}>
                      <strong style={{ fontSize: 11, color: 'var(--primary)' }}>NOTAS: </strong>{tarea.notas}
                    </div>
                  )}
                </>
              )}

              {/* Edit / Save buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                {editing ? (
                  <>
                    <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Guardando…' : '💾 Guardar'}</button>
                    <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancelar</button>
                  </>
                ) : (
                  <button className="btn btn-outline" onClick={() => setEditing(true)}>✏️ Editar tarea</button>
                )}
              </div>

              <hr className="divider" />

              {/* Aportes */}
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>💬 Aportes ({tarea.aportes?.length || 0})</div>

              {tarea.aportes?.length > 0
                ? tarea.aportes.map(a => (
                    <div key={a.id} className="aporte-item">
                      <div className="aporte-autor">{a.autor}</div>
                      <div className="aporte-text">{a.contenido}</div>
                      <div className="aporte-date">{fmtFull(a.created_at)}</div>
                    </div>
                  ))
                : <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Sin aportes aún.</div>
              }

              <div style={{ marginTop: 10 }}>
                <textarea
                  className="form-textarea"
                  placeholder="Agregar un aporte o actualización…"
                  value={aporte}
                  onChange={e => setAporte(e.target.value)}
                  style={{ minHeight: 70 }}
                />
                <button className="btn btn-primary btn-sm" style={{ marginTop: 6 }} onClick={addAporte} disabled={saving || !aporte.trim()}>
                  {saving ? 'Enviando…' : '➕ Agregar aporte'}
                </button>
              </div>
            </>
          )}

          {tab === 'historial' && (
            <>
              {(!tarea.historial || tarea.historial.length === 0)
                ? <div className="empty-state"><div className="empty-icon">🕐</div><div className="empty-text">Sin historial todavía</div></div>
                : tarea.historial.map(h => (
                    <div key={h.id} className="hist-item">
                      <div className="hist-icon">{TIPO_ICON[h.tipo_cambio] || '📝'}</div>
                      <div className="hist-body">
                        <div className="hist-line">
                          <strong>{h.usuario}</strong>
                          {h.tipo_cambio === 'creacion' && ' creó esta tarea'}
                          {h.tipo_cambio === 'edicion'  && ` cambió ${h.campo}: "${h.valor_anterior}" → "${h.valor_nuevo}"`}
                          {h.tipo_cambio === 'aporte'   && ` agregó aporte: "${h.valor_nuevo}"`}
                          {h.tipo_cambio === 'estado'   && ` cambió estado a ${h.valor_nuevo}`}
                        </div>
                        <div className="hist-meta">{fmtFull(h.created_at)}</div>
                      </div>
                    </div>
                  ))
              }
            </>
          )}
        </div>
      </div>
    </div>
  )
}
