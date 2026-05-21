const MEMBERS = ['Jonathan', 'Bessy', 'Aura', 'Ana Isabel']

export default function Header({ currentUser, onUserChange, activeTab, onTabChange, tabs }) {
  return (
    <>
      <header className="header">
        <div className="header-brand">
          <span style={{ fontSize: 26 }}>⚖️</span>
          <div>
            <h1>Gestor de Tareas</h1>
            <p>Equipo Legal &amp; Tributario</p>
          </div>
        </div>
        <div className="user-selector">
          <span>Hola,</span>
          <select value={currentUser} onChange={e => onUserChange(e.target.value)}>
            {MEMBERS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </header>
      <nav className="nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  )
}
