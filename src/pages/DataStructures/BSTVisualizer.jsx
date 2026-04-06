import { useState, useCallback } from 'react'
import '../Sorting/Sorting.css'
import './DS.css'

class TreeNode {
  constructor(val) {
    this.val = val
    this.left = null
    this.right = null
  }
}

function insertBST(root, val) {
  if (!root) return new TreeNode(val)
  if (val < root.val) root.left = insertBST(root.left, val)
  else if (val > root.val) root.right = insertBST(root.right, val)
  return root
}

function deleteBST(root, val) {
  if (!root) return null
  if (val < root.val) root.left = deleteBST(root.left, val)
  else if (val > root.val) root.right = deleteBST(root.right, val)
  else {
    if (!root.left) return root.right
    if (!root.right) return root.left
    let minNode = root.right
    while (minNode.left) minNode = minNode.left
    root.val = minNode.val
    root.right = deleteBST(root.right, minNode.val)
  }
  return root
}

function getTreeLayout(root) {
  const nodes = []
  const edges = []

  function layout(node, x, y, spread, parent) {
    if (!node) return
    const id = `${node.val}-${x.toFixed(2)}-${y}`
    nodes.push({ val: node.val, x, y, id })
    if (parent) edges.push({ from: parent, to: { x, y } })
    layout(node.left, x - spread, y + 70, spread * 0.55, { x, y })
    layout(node.right, x + spread, y + 70, spread * 0.55, { x, y })
  }

  layout(root, 400, 40, 160, null)
  return { nodes, edges }
}

export default function BSTVisualizer() {
  const [root, setRoot] = useState(null)
  const [inputVal, setInputVal] = useState('')
  const [highlightVals, setHighlightVals] = useState([])
  const [highlightEdges, setHighlightEdges] = useState([])
  const [message, setMessage] = useState('Insert values to build a BST.')
  const [traversalResult, setTraversalResult] = useState('')

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))

  const insert = () => {
    const val = parseInt(inputVal)
    if (isNaN(val)) return
    const newRoot = insertBST(root ? JSON.parse(JSON.stringify(root)) : null, val)
    setRoot(rebuildTree(newRoot))
    setHighlightVals([val])
    setMessage(`Inserted ${val}`)
    setInputVal('')
    setTimeout(() => setHighlightVals([]), 800)
  }

  // Need to rebuild proper TreeNode instances from plain objects
  function rebuildTree(obj) {
    if (!obj) return null
    const node = new TreeNode(obj.val)
    node.left = rebuildTree(obj.left)
    node.right = rebuildTree(obj.right)
    return node
  }

  const deleteNode = () => {
    const val = parseInt(inputVal)
    if (isNaN(val) || !root) return
    const newRoot = deleteBST(JSON.parse(JSON.stringify(root)), val)
    setRoot(rebuildTree(newRoot))
    setMessage(`Deleted ${val}`)
    setInputVal('')
  }

  const searchNode = async () => {
    const val = parseInt(inputVal)
    if (isNaN(val) || !root) return
    const path = []
    let curr = root
    while (curr) {
      path.push(curr.val)
      setHighlightVals([...path])
      await sleep(500)
      if (curr.val === val) {
        setMessage(`Found ${val}!`)
        await sleep(1000)
        setHighlightVals([])
        return
      }
      curr = val < curr.val ? curr.left : curr.right
    }
    setMessage(`${val} not found`)
    setHighlightVals([])
  }

  const traverse = async (type) => {
    if (!root) return
    const result = []
    const order = []

    function inorder(node) {
      if (!node) return
      inorder(node.left)
      order.push(node.val)
      inorder(node.right)
    }
    function preorder(node) {
      if (!node) return
      order.push(node.val)
      preorder(node.left)
      preorder(node.right)
    }
    function postorder(node) {
      if (!node) return
      postorder(node.left)
      postorder(node.right)
      order.push(node.val)
    }

    if (type === 'inorder') inorder(root)
    else if (type === 'preorder') preorder(root)
    else postorder(root)

    for (const val of order) {
      result.push(val)
      setHighlightVals([val])
      setTraversalResult(result.join(' → '))
      await sleep(500)
    }
    setHighlightVals([])
    setMessage(`${type} traversal complete`)
  }

  const generateRandom = () => {
    let r = null
    const vals = Array.from({ length: 7 }, () => Math.floor(Math.random() * 99) + 1)
    vals.forEach(v => { r = insertBST(r, v) })
    setRoot(r)
    setMessage(`Generated BST with values: ${vals.join(', ')}`)
    setTraversalResult('')
  }

  const { nodes, edges } = root ? getTreeLayout(root) : { nodes: [], edges: [] }

  return (
    <div className="ds-page">
      <div className="viz-header">
        <div>
          <span className="section-label">Data Structures</span>
          <h1 className="viz-title">Binary Search Tree</h1>
        </div>
        <div className="viz-stats">
          <div className="stat-item">
            <span className="stat-label">Nodes</span>
            <span className="stat-value gradient-text">{nodes.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Search</span>
            <span className="stat-value">O(log n)</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Insert</span>
            <span className="stat-value">O(log n)</span>
          </div>
        </div>
      </div>

      <div className="ds-canvas glass-card">
        <div className="bst-container">
          {nodes.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🌲</span>
              <p>Empty tree — insert values or generate random</p>
            </div>
          ) : (
            <svg className="bst-svg" viewBox="0 0 800 500">
              {edges.map((e, i) => (
                <line
                  key={i}
                  x1={e.from.x} y1={e.from.y}
                  x2={e.to.x} y2={e.to.y}
                  className={`bst-edge ${highlightVals.includes(nodes.find(n => Math.abs(n.x - e.to.x) < 1 && Math.abs(n.y - e.to.y) < 1)?.val) ? 'highlight' : ''}`}
                />
              ))}
              {nodes.map((n, i) => (
                <g key={n.id}>
                  <circle
                    cx={n.x} cy={n.y} r="22"
                    fill={highlightVals.includes(n.val) ? 'rgba(0,240,255,0.2)' : 'var(--bg-elevated)'}
                    stroke={highlightVals.includes(n.val) ? 'var(--accent-primary)' : 'var(--border-default)'}
                    strokeWidth={highlightVals.includes(n.val) ? 2 : 1}
                    className="bst-node-circle"
                  />
                  <text x={n.x} y={n.y} className="bst-node-text">{n.val}</text>
                </g>
              ))}
            </svg>
          )}
        </div>
        {traversalResult && (
          <div className="traversal-result">{traversalResult}</div>
        )}
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
              onKeyDown={e => e.key === 'Enter' && insert()}
            />
          </div>
        </div>
        <div className="ds-buttons">
          <button className="btn-primary ds-btn" onClick={insert}>Insert</button>
          <button className="btn-secondary ds-btn" onClick={deleteNode}>Delete</button>
          <button className="btn-secondary ds-btn" onClick={searchNode}>Search</button>
          <button className="btn-secondary ds-btn" onClick={() => traverse('inorder')}>Inorder</button>
          <button className="btn-secondary ds-btn" onClick={() => traverse('preorder')}>Preorder</button>
          <button className="btn-secondary ds-btn" onClick={() => traverse('postorder')}>Postorder</button>
          <button className="btn-secondary ds-btn" onClick={generateRandom}>Random</button>
        </div>
      </div>
    </div>
  )
}
