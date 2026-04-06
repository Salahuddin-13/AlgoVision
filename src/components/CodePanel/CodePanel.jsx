import { useState } from 'react'
import './CodePanel.css'

export default function CodePanel({ code = [], currentLine = -1, variables = {}, title = 'Code' }) {
  const [collapsed, setCollapsed] = useState(false)

  const varEntries = Object.entries(variables)

  if (collapsed) {
    return (
      <button className="cp-expand-btn" onClick={() => setCollapsed(false)} title="Show code">
        ⟨ Code
      </button>
    )
  }

  return (
    <div className="cp-container">
      <div className="cp-header">
        <span className="cp-title">{title}</span>
        <button className="cp-collapse" onClick={() => setCollapsed(true)}>⟩</button>
      </div>

      <div className="cp-code-area">
        {code.map((line, i) => (
          <div key={i} className={`cp-line ${currentLine === i ? 'cp-active' : ''}`}>
            <span className="cp-line-num">{i + 1}</span>
            <span className="cp-line-text">{line}</span>
          </div>
        ))}
      </div>

      {varEntries.length > 0 && (
        <div className="cp-vars">
          <div className="cp-vars-title">Variables</div>
          <div className="cp-vars-grid">
            {varEntries.map(([k, v]) => (
              <div key={k} className="cp-var">
                <span className="cp-var-name">{k}</span>
                <span className="cp-var-eq">=</span>
                <span className="cp-var-val">
                  {Array.isArray(v) ? `[${v.join(', ')}]` : String(v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
