import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

const sidebarItems = [
  {
    label: 'Visualizer',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
      </svg>
    ),
    path: '/',
  },
  {
    label: 'Sorting',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="4" y1="21" x2="4" y2="14"/><line x1="9" y1="21" x2="9" y2="8"/><line x1="14" y1="21" x2="14" y2="4"/><line x1="19" y1="21" x2="19" y2="11"/>
      </svg>
    ),
    path: '/sorting',
  },
  {
    label: 'Data Structures',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
    children: [
      { label: 'Linked List', path: '/linked-list' },
      { label: 'Stack', path: '/stack' },
      { label: 'Queue', path: '/queue' },
      { label: 'BST / AVL', path: '/bst' },
    ],
  },
  {
    label: 'Graphs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/>
        <line x1="5" y1="8" x2="12" y2="16"/><line x1="19" y1="8" x2="12" y2="16"/><line x1="7" y1="6" x2="17" y2="6"/>
      </svg>
    ),
    path: '/graph',
  },
  {
    label: 'Searching',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    path: '/searching',
  },
  {
    label: 'Recursion',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>
      </svg>
    ),
    path: '/recursion',
  },
  {
    label: 'Greedy',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    path: '/greedy',
  },
  {
    label: 'Backtracking',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
      </svg>
    ),
    path: '/backtracking',
  },
  {
    label: 'Dynamic Prog.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
      </svg>
    ),
    path: '/dp',
  },
  {
    label: 'Code Engine',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    path: '/code-visualizer',
  },
  {
    label: 'Algorithm Lab',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 3h6l3 7-6 11-6-11z"/><circle cx="12" cy="10" r="2"/>
      </svg>
    ),
    path: '/algo-lab',
  },
  {
    label: 'Code Debugger',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="16" height="16" rx="2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/><path d="M8 13a4 4 0 0 0 8 0"/>
      </svg>
    ),
    path: '/code-debugger',
  },
  {
    label: 'Complexity',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    ),
    path: '/complexity',
  },
  {
    label: 'Practice Lab',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C5.7 4 7 5 7 5s1.3-1 2.5-1a2.5 2.5 0 0 1 0 5H8"/><path d="M12 13l-2-2m0 0l-2 2m2-2v8"/><rect x="2" y="17" width="20" height="4" rx="1"/></svg>
    ),
    path: '/practice',
  },
]

export default function Sidebar({ isOpen }) {
  const location = useLocation()

  return (
    <aside className={`sidebar glass ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <span className="sidebar-title gradient-text">Logic Engine</span>
        <span className="sidebar-version">v1.0.0</span>
      </div>

      <nav className="sidebar-nav">
        {sidebarItems.map((item, i) => (
          <div key={i} className="sidebar-item-group">
            {item.path ? (
              <Link
                to={item.path}
                className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {isOpen && <span className="sidebar-label">{item.label}</span>}
              </Link>
            ) : (
              <>
                <div className="sidebar-item parent">
                  <span className="sidebar-icon">{item.icon}</span>
                  {isOpen && <span className="sidebar-label">{item.label}</span>}
                </div>
                {isOpen && item.children && (
                  <div className="sidebar-children">
                    {item.children.map((child, j) => (
                      <Link
                        key={j}
                        to={child.path}
                        className={`sidebar-child ${location.pathname === child.path ? 'active' : ''}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isOpen && (
          <>
            <Link to="/code-visualizer" className="btn-primary new-viz-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Visualization
            </Link>
            <div className="sidebar-bottom-links">
              <a href="#" className="sidebar-bottom-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Documentation
              </a>
              <a href="#" className="sidebar-bottom-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Support
              </a>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
