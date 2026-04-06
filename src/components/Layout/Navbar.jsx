import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

export default function Navbar({ onMenuToggle }) {
  const location = useLocation()

  return (
    <nav className="navbar glass">
      <div className="navbar-left">
        <button className="btn-icon menu-toggle" onClick={onMenuToggle} aria-label="Toggle sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">◈</span>
          <span className="brand-text">AlgoVision</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Visualizer
          </Link>
          <Link to="/code-visualizer" className={`nav-link ${location.pathname === '/code-visualizer' ? 'active' : ''}`}>
            Code Engine
          </Link>
        </div>
      </div>
      <div className="navbar-right">
        <div className="search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search structures..." />
        </div>
        <button className="btn-icon" aria-label="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        <button className="btn-icon" aria-label="Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
        <div className="avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      </div>
    </nav>
  )
}
