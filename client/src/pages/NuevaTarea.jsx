import { useState, useEffect } from 'react'
import { api } from '../api'

const ESTADOS  = ['Pendiente', 'En progreso', 'Bloqueado', 'Completado']
const MEMBERS  = ['Jonathan', 'Bessy', 'Aura', 'Ana Isabel']

const EMPTY = { proyecto_id: '', nombre: '', descripcion: '', asignado: 'Jonathan', estado: 'Pendiente', fecha_limite: '', notas: '' }

export default function NuevaTarea({ currentUser, showToast, onCreated }) {
  const [form,       setForm]       = useState({ ...EMPTY, asignado: currentUser })
  const [proyectos,  setProyectos]  = useState([])
  const [errors,     setErrors]     = useState({})
  const [saving,     setSaving]     = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [newProj,    setNewProj]    = useState(false)
  const [newProjName, setNewProjName] = useState('')

  useEffect(() => {
    api.get('/proyectos').then(setProyectos).catch(() => {})
  }, [])

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.proyecto_id) e.proyecto_id = 'Selecciona un proyecto'
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.asignado) e.asignado = 'Asigna a alguien'
    return e
  }

  const createProject = async () => {
    if (!newProjName.trim()) return
    try {
      const p = await api.post('/proyectos', { nombre: newProjName.trim() })
      setProyectos(prev => [...prev, p])
      set('proyecto_id', String(p.id))
      setNewProj(false)
      setNewProjName('')
      showToast(`Proyecto "${p.nombre}" creado`)
    } catch (e) { showToast(e.message, 'error') }
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await api.post('/tareas', { ...form, usuario: currentUser })
      showToast('✅ Tarea creada exitosamente')
      setSuccess(true)
      setForm({ ...EMPTY, asignado: currentUser })
      setTimeout(() => { setSuccess(false); onCreated() }, 1500)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">➕ Nueva Tarea</div>
          <div className="page-sub">Completa los campos y haz clic en Crear tarea</div>
        </div>
      </div>

      {success && (
        <div className="alert alert-success" style={{ fontSize: 15, fontWeight: 600 }}>
          ✅ ¡Tarea creada! Redirigiendo a la vista de tareas…
        </div>
      )}

      <div className="card" style={{ maxWidth: 680 }}>
        <form onSubmit={submit}>
          {/* Proyecto */}
          <div className="form-group">
            <label className="form-label">Proyecto <span className="req">*</span></label>
            {newProj ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="Nombre del nuevo proyecto…"
                  value={newProjName}
                  onChange={e => setNewProjName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), createProject())}
                  autoFocus
                />
                <button type="button" className="btn btn-primary btn-sm" onClick={createProject}>Crear</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setNewProj(false)}>Cancelar</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  className="form-select"
                  value={form.proyecto_id}
                  onChange={e => set('proyecto_id', e.target.value)}
                >
                  <option value="">— Seleccionar proyecto —</option>
                  {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setNewProj(true)} title="Crear proyecto nuevo">+ Nuevo</button>
              </div>
            )}
            {errors.proyecto_id && <div className="form-error">{errors.proyecto_id}</div>}
          </div>

          {/* Nombre */}
          <div className="form-group">
            <label className="form-label">Nombre de la tarea <span className="req">*</span></label>
            <input className="form-input" placeholder="Ej: Redactar informe tributario" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            {errors.nombre && <div className="form-error">{errors.nombre}</div>}
          </div>

          {/* Descripcion */}
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" placeholder="Detalla el alcance de la tarea…" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
          </div>

          {/* Asignado + Estado */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Asignado a <span className="req">*</span></label>
              <select className="form-select" value={form.asignado} onChange={e => set('asignado', e.target.value)}>
                {MEMBERS.map(m => <option key={m}>{m}</option>)}
              </select>
              {errors.asignado && <div className="form-error">{errors.asignado}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Estado inicial</label>
              <select className="form-select" value={form.estado} onChange={e => set('estado', e.target.value)}>
                {ESTADOS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Fecha */}
          <div className="form-group">
            <label className="form-label">Fecha límite</label>
            <input type="date" className="form-input" value={form.fecha_limite} onChange={e => set('fecha_limite', e.target.value)} />
          </div>

          {/* Notas */}
          <div className="form-group">
            <label className="form-label">Notas / Aportes iniciales</label>
            <textarea className="form-textarea" placeholder="Contexto, instrucciones especiales…" value={form.notas} onChange={e => set('notas', e.target.value)} />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setForm({ ...EMPTY, asignado: currentUser })}>
              Limpiar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Creando…' : '✅ Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
