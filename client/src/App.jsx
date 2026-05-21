import { useState, useCallback } from 'react'
import Header from './components/Header'
import Toast  from './components/Toast'
import Dashboard    from './pages/Dashboard'
import Tareas       from './pages/Tareas'
import Timeline     from './pages/Timeline'
import CargaTrabajo from './pages/CargaTrabajo'
import NuevaTarea   from './pages/NuevaTarea'
import Historial    from './pages/Historial'

const TABS = [
  { id: 'dashboard', label: 'Dashboard',        icon: '📊' },
  { id: 'tareas',    label: 'Tareas',            icon: '📋' },
  { id: 'timeline',  label: 'Timeline',          icon: '📅' },
  { id: 'carga',     label: 'Carga de Trabajo',  icon: '👥' },
  { id: 'nueva',     label: 'Nueva Tarea',        icon: '➕' },
  { id: 'historial', label: 'Historial',          icon: '🕐' },
]

export default function App() {
  const [activeTab,   setActiveTab]   = useState('dashboard')
  const [currentUser, setCurrentUser] = useState('Jonathan')
  const [toasts,      setToasts]      = useState([])
  const [refreshKey,  setRefreshKey]  = useState(0)

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  const shared = { currentUser, showToast, refresh, refreshKey }

  return (
    <div className="app">
      <Header
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={TABS}
      />
      <main className="main">
        {activeTab === 'dashboard' && <Dashboard  {...shared} />}
        {activeTab === 'tareas'    && <Tareas     {...shared} />}
        {activeTab === 'timeline'  && <Timeline   {...shared} />}
        {activeTab === 'carga'     && <CargaTrabajo {...shared} />}
        {activeTab === 'nueva'     && (
          <NuevaTarea {...shared} onCreated={() => { refresh(); setActiveTab('tareas') }} />
        )}
        {activeTab === 'historial' && <Historial  {...shared} />}
      </main>
      <Toast toasts={toasts} />
    </div>
  )
}
