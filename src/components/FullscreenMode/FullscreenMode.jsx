import { useState } from 'react'
import './FullscreenMode.css'

export default function FullscreenMode({ isFs, onToggle, codeLines = [], currentLine = -1 }) {
  const [showCode, setShowCode] = useState(false)

  return (
    <>
      <button className={`fs-btn ${isFs ? 'fs-exit' : ''}`} onClick={onToggle}
        title={isFs ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}>
        {isFs ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="8 3 3 3 3 8"/><polyline points="21 8 21 3 16 3"/>
            <polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        )}
      </button>

      {isFs && codeLines.length > 0 && (
        <button className="fs-code-btn" onClick={() => setShowCode(p => !p)}>
          {showCode ? '⟨ Hide Code' : 'Show Code ⟩'}
        </button>
      )}

      {isFs && showCode && codeLines.length > 0 && (
        <div className="fs-code-overlay">
          <div className="fs-code-hdr">
            Algorithm Code
            <button onClick={() => setShowCode(false)}>✕</button>
          </div>
          <div className="fs-code-body">
            {codeLines.map((line, i) => (
              <div key={i} className={`fs-cl ${currentLine === i ? 'active' : ''}`}>
                <span className="fs-ln">{i + 1}</span>
                <code>{line}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
