import { useState } from 'react'
import '../Sorting/Sorting.css'
import './DS.css'

const MAX_SIZE = 12

export default function StackVisualizer() {
  const [stack, setStack] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const [message, setMessage] = useState('Push elements onto the stack to begin.')

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))

  const push = async () => {
    const val = parseInt(inputVal)
    if (isNaN(val)) return
    if (stack.length >= MAX_SIZE) {
      setMessage('⚠ Stack Overflow! Max capacity reached.')
      return
    }
    const newStack = [...stack, val]
    setStack(newStack)
    setHighlightIdx(newStack.length - 1)
    setMessage(`Pushed ${val} — Stack size: ${newStack.length}`)
    setInputVal('')
    await sleep(600)
    setHighlightIdx(-1)
  }

  const pop = async () => {
    if (stack.length === 0) {
      setMessage('⚠ Stack Underflow! Stack is empty.')
      return
    }
    setHighlightIdx(stack.length - 1)
    await sleep(400)
    const val = stack[stack.length - 1]
    setStack(stack.slice(0, -1))
    setMessage(`Popped ${val} — Stack size: ${stack.length - 1}`)
    setHighlightIdx(-1)
  }

  const peek = async () => {
    if (stack.length === 0) {
      setMessage('Stack is empty — nothing to peek.')
      return
    }
    setHighlightIdx(stack.length - 1)
    setMessage(`Top element: ${stack[stack.length - 1]}`)
    await sleep(1000)
    setHighlightIdx(-1)
  }

  const clear = () => {
    setStack([])
    setHighlightIdx(-1)
    setMessage('Stack cleared.')
  }

  return (
    <div className="ds-page">
      <div className="viz-header">
        <div>
          <span className="section-label">Data Structures</span>
          <h1 className="viz-title">Stack (LIFO)</h1>
        </div>
        <div className="viz-stats">
          <div className="stat-item">
            <span className="stat-label">Size</span>
            <span className="stat-value gradient-text">{stack.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Push/Pop</span>
            <span className="stat-value">O(1)</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Capacity</span>
            <span className="stat-value">{MAX_SIZE}</span>
          </div>
        </div>
      </div>

      <div className="ds-canvas glass-card">
        <div className="stack-container">
          <div className="stack-visual">
            {stack.length === 0 ? (
              <div className="empty-state" style={{position: 'absolute', bottom: '40px'}}>
                <span className="empty-icon">◇</span>
                <p>Empty stack</p>
              </div>
            ) : (
              stack.map((val, i) => (
                <div
                  key={i}
                  className={`stack-element ${highlightIdx === i ? 'highlight' : ''} ${i === stack.length - 1 ? 'top-element' : ''}`}
                  style={{animationDelay: `${i * 0.05}s`}}
                >
                  {val}
                  {i === stack.length - 1 && (
                    <span className="stack-pointer" style={{top: '50%', transform: 'translateY(-50%)'}}>← TOP</span>
                  )}
                </div>
              ))
            )}
            <div className="stack-bottom"></div>
          </div>

          <div className="stack-info">
            <div className="stack-info-item">
              <span className="stack-info-label">Top</span>
              <span className="stack-info-value">{stack.length > 0 ? stack[stack.length - 1] : '—'}</span>
            </div>
            <div className="stack-info-item">
              <span className="stack-info-label">Size</span>
              <span className="stack-info-value">{stack.length}</span>
            </div>
            <div className="stack-info-item">
              <span className="stack-info-label">Empty?</span>
              <span className="stack-info-value">{stack.length === 0 ? 'Yes' : 'No'}</span>
            </div>
            <div className="stack-info-item">
              <span className="stack-info-label">Full?</span>
              <span className="stack-info-value">{stack.length >= MAX_SIZE ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
        <div className="ds-message">{message}</div>
      </div>

      <div className="ds-controls glass">
        <div className="ds-inputs">
          <div className="control-group">
            <label className="control-label">Value</label>
            <input
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Enter value"
              className="ds-input"
              onKeyDown={e => e.key === 'Enter' && push()}
            />
          </div>
        </div>
        <div className="ds-buttons">
          <button className="btn-primary ds-btn" onClick={push}>Push</button>
          <button className="btn-secondary ds-btn" onClick={pop}>Pop</button>
          <button className="btn-secondary ds-btn" onClick={peek}>Peek</button>
          <button className="btn-secondary ds-btn" onClick={clear}>Clear</button>
        </div>
      </div>
    </div>
  )
}
