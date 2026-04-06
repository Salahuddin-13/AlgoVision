import { useState, useRef, useEffect } from 'react'
import '../Sorting/Sorting.css'
import './DS.css'

class Node {
  constructor(val) {
    this.val = val
    this.next = null
    this.id = Math.random().toString(36).slice(2, 8)
  }
}

function listToArray(head) {
  const nodes = []
  let curr = head
  while (curr) {
    nodes.push({ val: curr.val, id: curr.id })
    curr = curr.next
  }
  return nodes
}

export default function LinkedList() {
  const [head, setHead] = useState(null)
  const [nodes, setNodes] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [posInput, setPosInput] = useState('')
  const [highlightId, setHighlightId] = useState(null)
  const [traversing, setTraversing] = useState(false)
  const [message, setMessage] = useState('Create a linked list using the controls below.')
  const headRef = useRef(null)

  const updateDisplay = (h) => {
    headRef.current = h
    setHead(h)
    setNodes(listToArray(h))
  }

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))

  const insertHead = async () => {
    const val = parseInt(inputVal)
    if (isNaN(val)) return
    const node = new Node(val)
    node.next = headRef.current
    updateDisplay(node)
    setHighlightId(node.id)
    setMessage(`Inserted ${val} at head`)
    setInputVal('')
    await sleep(600)
    setHighlightId(null)
  }

  const insertTail = async () => {
    const val = parseInt(inputVal)
    if (isNaN(val)) return
    const node = new Node(val)
    if (!headRef.current) {
      updateDisplay(node)
    } else {
      setTraversing(true)
      let curr = headRef.current
      while (curr.next) {
        setHighlightId(curr.id)
        updateDisplay(headRef.current)
        await sleep(400)
        curr = curr.next
      }
      curr.next = node
      setHighlightId(node.id)
      updateDisplay(headRef.current)
      setTraversing(false)
    }
    setMessage(`Inserted ${val} at tail`)
    setInputVal('')
    await sleep(600)
    setHighlightId(null)
  }

  const insertAt = async () => {
    const val = parseInt(inputVal)
    const pos = parseInt(posInput)
    if (isNaN(val) || isNaN(pos) || pos < 0) return
    const node = new Node(val)
    if (pos === 0) {
      node.next = headRef.current
      updateDisplay(node)
      setHighlightId(node.id)
    } else {
      let curr = headRef.current
      setTraversing(true)
      for (let i = 0; i < pos - 1 && curr; i++) {
        setHighlightId(curr.id)
        updateDisplay(headRef.current)
        await sleep(400)
        curr = curr.next
      }
      if (curr) {
        node.next = curr.next
        curr.next = node
        setHighlightId(node.id)
        updateDisplay(headRef.current)
      }
      setTraversing(false)
    }
    setMessage(`Inserted ${val} at position ${pos}`)
    setInputVal('')
    setPosInput('')
    await sleep(600)
    setHighlightId(null)
  }

  const deleteHead = async () => {
    if (!headRef.current) return
    const val = headRef.current.val
    setHighlightId(headRef.current.id)
    await sleep(400)
    updateDisplay(headRef.current.next)
    setMessage(`Deleted ${val} from head`)
    setHighlightId(null)
  }

  const deleteTail = async () => {
    if (!headRef.current) return
    if (!headRef.current.next) {
      setHighlightId(headRef.current.id)
      await sleep(400)
      updateDisplay(null)
      setMessage('Deleted tail (list now empty)')
      setHighlightId(null)
      return
    }
    setTraversing(true)
    let curr = headRef.current
    while (curr.next && curr.next.next) {
      setHighlightId(curr.id)
      updateDisplay(headRef.current)
      await sleep(400)
      curr = curr.next
    }
    const val = curr.next.val
    setHighlightId(curr.next.id)
    await sleep(400)
    curr.next = null
    updateDisplay(headRef.current)
    setTraversing(false)
    setMessage(`Deleted ${val} from tail`)
    setHighlightId(null)
  }

  const searchValue = async () => {
    const val = parseInt(inputVal)
    if (isNaN(val)) return
    setTraversing(true)
    let curr = headRef.current
    let pos = 0
    while (curr) {
      setHighlightId(curr.id)
      updateDisplay(headRef.current)
      await sleep(500)
      if (curr.val === val) {
        setMessage(`Found ${val} at position ${pos}`)
        setTraversing(false)
        await sleep(1000)
        setHighlightId(null)
        return
      }
      curr = curr.next
      pos++
    }
    setMessage(`${val} not found in the list`)
    setTraversing(false)
    setHighlightId(null)
  }

  const reverseList = async () => {
    if (!headRef.current) return
    setTraversing(true)
    let prev = null
    let curr = headRef.current
    while (curr) {
      setHighlightId(curr.id)
      updateDisplay(headRef.current)
      await sleep(400)
      const next = curr.next
      curr.next = prev
      prev = curr
      curr = next
    }
    updateDisplay(prev)
    setTraversing(false)
    setMessage('List reversed')
    setHighlightId(null)
  }

  return (
    <div className="ds-page">
      <div className="viz-header">
        <div>
          <span className="section-label">Data Structures</span>
          <h1 className="viz-title">Linked List</h1>
        </div>
        <div className="viz-stats">
          <div className="stat-item">
            <span className="stat-label">Nodes</span>
            <span className="stat-value gradient-text">{nodes.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Access</span>
            <span className="stat-value">O(n)</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Insert</span>
            <span className="stat-value">O(1)</span>
          </div>
        </div>
      </div>

      {/* Visualization Canvas */}
      <div className="ds-canvas glass-card">
        <div className="ll-container">
          {nodes.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">⛓</span>
              <p>Empty list — insert nodes to begin</p>
            </div>
          ) : (
            <>
              <div className="ll-pointer-label">HEAD</div>
              <div className="ll-nodes">
                {nodes.map((node, i) => (
                  <div key={node.id} className="ll-node-group" style={{animationDelay: `${i * 0.05}s`}}>
                    <div className={`ll-node ${highlightId === node.id ? 'highlight' : ''}`}>
                      <div className="ll-node-val">{node.val}</div>
                      <div className="ll-node-next">{i < nodes.length - 1 ? '→' : '∅'}</div>
                    </div>
                    {i < nodes.length - 1 && (
                      <div className="ll-arrow">
                        <svg width="32" height="16" viewBox="0 0 32 16">
                          <line x1="0" y1="8" x2="24" y2="8" stroke="var(--accent-primary)" strokeWidth="2" opacity="0.5"/>
                          <polygon points="24,4 32,8 24,12" fill="var(--accent-primary)" opacity="0.5"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="ds-message">{message}</div>
      </div>

      {/* Controls */}
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
              disabled={traversing}
            />
          </div>
          <div className="control-group">
            <label className="control-label">Position</label>
            <input
              type="number"
              value={posInput}
              onChange={e => setPosInput(e.target.value)}
              placeholder="Index"
              className="ds-input ds-input-sm"
              disabled={traversing}
            />
          </div>
        </div>
        <div className="ds-buttons">
          <button className="btn-primary ds-btn" onClick={insertHead} disabled={traversing}>Insert Head</button>
          <button className="btn-primary ds-btn" onClick={insertTail} disabled={traversing}>Insert Tail</button>
          <button className="btn-secondary ds-btn" onClick={insertAt} disabled={traversing}>Insert At</button>
          <button className="btn-secondary ds-btn" onClick={deleteHead} disabled={traversing}>Delete Head</button>
          <button className="btn-secondary ds-btn" onClick={deleteTail} disabled={traversing}>Delete Tail</button>
          <button className="btn-secondary ds-btn" onClick={searchValue} disabled={traversing}>Search</button>
          <button className="btn-secondary ds-btn" onClick={reverseList} disabled={traversing}>Reverse</button>
        </div>
      </div>
    </div>
  )
}
