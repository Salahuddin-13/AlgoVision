import { useState, useEffect } from 'react'
import './FullscreenMode.css'

export default function FullscreenMode({ children, codeContent = [], currentLine = -1 }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showCode, setShowCode] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
        setShowCode(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFullscreen])

  return (
    <>
      {/* Toggle button — always visible in normal mode */}
      <button className="fs-toggle" onClick={() => setIsFullscreen(true)} title="Fullscreen visualization">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
          <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      </button>

      {isFullscreen && (
        <div className="fs-overlay">
          <div className="fs-header">
            <button className="fs-exit" onClick={() => { setIsFullscreen(false); setShowCode(false) }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Exit Fullscreen
            </button>
            {codeContent.length > 0 && (
              <button className="fs-code-toggle" onClick={() => setShowCode(!showCode)}>
                {showCode ? 'Hide Code ⟨' : 'Show Code ⟩'}
              </button>
            )}
          </div>

          <div className="fs-body">
            <div className={`fs-viz ${showCode ? 'with-code' : ''}`}>
              {children}
            </div>

            {showCode && codeContent.length > 0 && (
              <div className="fs-code-panel">
                <div className="fs-code-title">Algorithm Code</div>
                <div className="fs-code-lines">
                  {codeContent.map((line, i) => (
                    <div key={i} className={`fs-code-line ${currentLine === i ? 'active' : ''}`}>
                      <span className="fs-ln">{i + 1}</span>
                      <span className="fs-lt">{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
