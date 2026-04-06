import { useState } from 'react'
import '../Sorting/Sorting.css'
import './DS.css'

export default function QueueVisualizer() {
  const [queue, setQueue] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const [message, setMessage] = useState('Enqueue elements to begin.')

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))

  const enqueue = async () => {
    const val = parseInt(inputVal)
    if (isNaN(val)) return
    const nq = [...queue, val]
    setQueue(nq)
    setHighlightIdx(nq.length - 1)
    setMessage(`Enqueued ${val} at rear — Size: ${nq.length}`)
    setInputVal('')
    await sleep(600)
    setHighlightIdx(-1)
  }

  const dequeue = async () => {
    if (queue.length === 0) {
      setMessage('⚠ Queue is empty!')
      return
    }
    setHighlightIdx(0)
    await sleep(400)
    const val = queue[0]
    setQueue(queue.slice(1))
    setMessage(`Dequeued ${val} from front — Size: ${queue.length - 1}`)
    setHighlightIdx(-1)
  }

  const front = async () => {
    if (queue.length === 0) {
      setMessage('Queue is empty.')
      return
    }
    setHighlightIdx(0)
    setMessage(`Front element: ${queue[0]}`)
    await sleep(1000)
    setHighlightIdx(-1)
  }

  const rear = async () => {
    if (queue.length === 0) {
      setMessage('Queue is empty.')
      return
    }
    setHighlightIdx(queue.length - 1)
    setMessage(`Rear element: ${queue[queue.length - 1]}`)
    await sleep(1000)
    setHighlightIdx(-1)
  }

  return (
    <div className="ds-page">
      <div className="viz-header">
        <div>
          <span className="section-label">Data Structures</span>
          <h1 className="viz-title">Queue (FIFO)</h1>
        </div>
        <div className="viz-stats">
          <div className="stat-item">
            <span className="stat-label">Size</span>
            <span className="stat-value gradient-text">{queue.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Enqueue/Dequeue</span>
            <span className="stat-value">O(1)</span>
          </div>
        </div>
      </div>

      <div className="ds-canvas glass-card">
        <div className="queue-container">
          {queue.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>Empty queue — enqueue elements to begin</p>
            </div>
          ) : (
            <div className="queue-visual">
              {queue.map((val, i) => (
                <div
                  key={i}
                  className={`queue-element ${highlightIdx === i ? 'highlight' : ''}`}
                  style={{animationDelay: `${i * 0.05}s`}}
                >
                  {val}
                </div>
              ))}
              <span className="queue-pointer front">FRONT ↑</span>
              <span className="queue-pointer rear">↑ REAR</span>
            </div>
          )}
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
              onKeyDown={e => e.key === 'Enter' && enqueue()}
            />
          </div>
        </div>
        <div className="ds-buttons">
          <button className="btn-primary ds-btn" onClick={enqueue}>Enqueue</button>
          <button className="btn-secondary ds-btn" onClick={dequeue}>Dequeue</button>
          <button className="btn-secondary ds-btn" onClick={front}>Front</button>
          <button className="btn-secondary ds-btn" onClick={rear}>Rear</button>
          <button className="btn-secondary ds-btn" onClick={() => { setQueue([]); setMessage('Queue cleared.') }}>Clear</button>
        </div>
      </div>
    </div>
  )
}
