import { useState, useRef, useCallback, useEffect } from 'react'
import './GraphCanvas.css'

/* ── Default preset graphs ── */
export const GRAPH_PRESETS = {
  simple: {
    name: 'Simple (5 nodes)',
    directed: false,
    nodes: [
      { id: 0, x: 200, y: 80, label: 'A' },
      { id: 1, x: 100, y: 200, label: 'B' },
      { id: 2, x: 300, y: 200, label: 'C' },
      { id: 3, x: 150, y: 340, label: 'D' },
      { id: 4, x: 350, y: 340, label: 'E' },
    ],
    edges: [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 2 },
      { from: 1, to: 2, weight: 5 },
      { from: 1, to: 3, weight: 10 },
      { from: 2, to: 4, weight: 3 },
      { from: 3, to: 4, weight: 7 },
    ],
  },
  mst: {
    name: 'MST Example (7 nodes)',
    directed: false,
    nodes: [
      { id: 0, x: 250, y: 40, label: '0' },
      { id: 1, x: 100, y: 140, label: '1' },
      { id: 2, x: 400, y: 140, label: '2' },
      { id: 3, x: 50, y: 280, label: '3' },
      { id: 4, x: 200, y: 280, label: '4' },
      { id: 5, x: 350, y: 280, label: '5' },
      { id: 6, x: 250, y: 400, label: '6' },
    ],
    edges: [
      { from: 0, to: 1, weight: 2 },
      { from: 0, to: 2, weight: 6 },
      { from: 1, to: 2, weight: 8 },
      { from: 1, to: 3, weight: 5 },
      { from: 1, to: 4, weight: 10 },
      { from: 2, to: 4, weight: 15 },
      { from: 2, to: 5, weight: 4 },
      { from: 3, to: 4, weight: 3 },
      { from: 3, to: 6, weight: 7 },
      { from: 4, to: 5, weight: 9 },
      { from: 4, to: 6, weight: 12 },
      { from: 5, to: 6, weight: 1 },
    ],
  },
  directed: {
    name: 'Directed (6 nodes)',
    directed: true,
    nodes: [
      { id: 0, x: 120, y: 60, label: 'S' },
      { id: 1, x: 350, y: 60, label: 'A' },
      { id: 2, x: 120, y: 220, label: 'B' },
      { id: 3, x: 350, y: 220, label: 'C' },
      { id: 4, x: 120, y: 380, label: 'D' },
      { id: 5, x: 350, y: 380, label: 'T' },
    ],
    edges: [
      { from: 0, to: 1, weight: 10 },
      { from: 0, to: 2, weight: 8 },
      { from: 1, to: 2, weight: 2 },
      { from: 1, to: 3, weight: 5 },
      { from: 2, to: 4, weight: 10 },
      { from: 3, to: 5, weight: 7 },
      { from: 4, to: 3, weight: 1 },
      { from: 4, to: 5, weight: 10 },
    ],
  },
  flowNetwork: {
    name: 'Flow Network',
    directed: true,
    nodes: [
      { id: 0, x: 80, y: 200, label: 'S' },
      { id: 1, x: 230, y: 80, label: 'A' },
      { id: 2, x: 230, y: 320, label: 'B' },
      { id: 3, x: 380, y: 80, label: 'C' },
      { id: 4, x: 380, y: 320, label: 'D' },
      { id: 5, x: 520, y: 200, label: 'T' },
    ],
    edges: [
      { from: 0, to: 1, weight: 16 },
      { from: 0, to: 2, weight: 13 },
      { from: 1, to: 2, weight: 4 },
      { from: 1, to: 3, weight: 12 },
      { from: 2, to: 1, weight: 10 },
      { from: 2, to: 4, weight: 14 },
      { from: 3, to: 2, weight: 9 },
      { from: 3, to: 5, weight: 20 },
      { from: 4, to: 3, weight: 7 },
      { from: 4, to: 5, weight: 4 },
    ],
  },
  dijkstra: {
    name: 'Dijkstra Example',
    directed: true,
    nodes: [
      { id: 0, x: 80, y: 180, label: '0' },
      { id: 1, x: 220, y: 60, label: '1' },
      { id: 2, x: 220, y: 300, label: '2' },
      { id: 3, x: 380, y: 60, label: '3' },
      { id: 4, x: 380, y: 300, label: '4' },
      { id: 5, x: 520, y: 180, label: '5' },
    ],
    edges: [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 2 },
      { from: 1, to: 3, weight: 5 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 1, weight: 8 },
      { from: 2, to: 4, weight: 10 },
      { from: 3, to: 5, weight: 6 },
      { from: 4, to: 3, weight: 2 },
      { from: 4, to: 5, weight: 3 },
    ],
  },
}

/**
 * GraphCanvas — Interactive weighted graph editor + algorithm visualizer
 *
 * Props:
 *  - nodes: [{ id, x, y, label }]
 *  - edges: [{ from, to, weight }]
 *  - directed: boolean
 *  - onGraphChange: ({ nodes, edges }) => void  — called when user edits graph
 *  - nodeStates: { [nodeId]: 'default'|'active'|'visiting'|'visited'|'inPath'|'inMST'|'source'|'target' }
 *  - edgeStates: { [edgeKey]: 'default'|'active'|'inMST'|'inPath'|'rejected'|'flow' }
 *  - edgeLabels: { [edgeKey]: string }  — custom labels (e.g., "flow/cap")
 *  - disabled: boolean — lock editing during animation
 *  - width/height: SVG dimensions
 *  - showWeights: boolean
 */
export default function GraphCanvas({
  nodes = [],
  edges = [],
  directed = false,
  onGraphChange,
  nodeStates = {},
  edgeStates = {},
  edgeLabels = {},
  disabled = false,
  width = 600,
  height = 450,
  showWeights = true,
}) {
  const svgRef = useRef(null)
  const [dragging, setDragging] = useState(null)
  const [connecting, setConnecting] = useState(null) // nodeId being connected from
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [editingEdge, setEditingEdge] = useState(null) // { from, to } being weight-edited
  const [weightInput, setWeightInput] = useState('')

  const NODE_R = 22

  const getEdgeKey = (from, to) => directed ? `${from}->${to}` : `${Math.min(from, to)}-${Math.max(from, to)}`

  const getSvgPoint = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const ctm = svg.getScreenCTM().inverse()
    const svgP = pt.matrixTransform(ctm)
    return { x: svgP.x, y: svgP.y }
  }, [])

  /* ── Mouse handlers ── */
  const handleSvgMouseDown = (e) => {
    if (disabled) return
    if (e.target === svgRef.current || e.target.classList.contains('gc-bg')) {
      // Click on empty space → add node
      const p = getSvgPoint(e)
      const newId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0
      const label = String(newId)
      onGraphChange?.({
        nodes: [...nodes, { id: newId, x: p.x, y: p.y, label }],
        edges,
      })
    }
  }

  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation()
    if (disabled) return
    if (e.shiftKey) {
      // Shift+click → start connecting
      setConnecting(nodeId)
    } else {
      setDragging(nodeId)
    }
  }

  const handleSvgMouseMove = (e) => {
    const p = getSvgPoint(e)
    setMousePos(p)
    if (dragging !== null && !disabled) {
      onGraphChange?.({
        nodes: nodes.map(n => n.id === dragging ? { ...n, x: p.x, y: p.y } : n),
        edges,
      })
    }
  }

  const handleSvgMouseUp = (e) => {
    if (connecting !== null && !disabled) {
      // Check if mouse is over a node
      const p = getSvgPoint(e)
      const targetNode = nodes.find(n => {
        const dx = n.x - p.x, dy = n.y - p.y
        return Math.sqrt(dx * dx + dy * dy) < NODE_R + 5
      })
      if (targetNode && targetNode.id !== connecting) {
        const key = getEdgeKey(connecting, targetNode.id)
        const exists = edges.some(e => getEdgeKey(e.from, e.to) === key)
        if (!exists) {
          onGraphChange?.({
            nodes,
            edges: [...edges, { from: connecting, to: targetNode.id, weight: 1 }],
          })
        }
      }
      setConnecting(null)
    }
    setDragging(null)
  }

  const handleNodeDoubleClick = (e, nodeId) => {
    e.stopPropagation()
    if (disabled) return
    // Remove node and its edges
    onGraphChange?.({
      nodes: nodes.filter(n => n.id !== nodeId),
      edges: edges.filter(e => e.from !== nodeId && e.to !== nodeId),
    })
  }

  const handleEdgeClick = (e, from, to) => {
    e.stopPropagation()
    if (disabled) return
    setEditingEdge({ from, to })
    const edge = edges.find(ed => ed.from === from && ed.to === to)
    setWeightInput(String(edge?.weight || 1))
  }

  const handleEdgeDoubleClick = (e, from, to) => {
    e.stopPropagation()
    if (disabled) return
    // Delete edge
    onGraphChange?.({
      nodes,
      edges: edges.filter(ed => !(ed.from === from && ed.to === to)),
    })
    setEditingEdge(null)
  }

  const handleWeightSubmit = () => {
    if (editingEdge) {
      const w = parseFloat(weightInput) || 1
      onGraphChange?.({
        nodes,
        edges: edges.map(e =>
          e.from === editingEdge.from && e.to === editingEdge.to
            ? { ...e, weight: w } : e
        ),
      })
      setEditingEdge(null)
    }
  }

  /* ── Rendering helpers ── */
  const getNodeColor = (id) => {
    const state = nodeStates[id] || 'default'
    switch (state) {
      case 'active': return { fill: 'rgba(234,179,8,0.2)', stroke: '#eab308', sw: 2.5, text: '#eab308' }
      case 'visiting': return { fill: 'rgba(0,240,255,0.15)', stroke: 'var(--accent-primary)', sw: 2.5, text: 'var(--accent-primary)' }
      case 'visited': return { fill: 'rgba(34,197,94,0.1)', stroke: 'rgba(34,197,94,0.6)', sw: 1.5, text: 'rgba(34,197,94,0.8)' }
      case 'inPath': return { fill: 'rgba(168,85,247,0.15)', stroke: '#a855f7', sw: 2.5, text: '#a855f7' }
      case 'inMST': return { fill: 'rgba(34,197,94,0.15)', stroke: 'var(--accent-success)', sw: 2.5, text: 'var(--accent-success)' }
      case 'source': return { fill: 'rgba(0,240,255,0.2)', stroke: 'var(--accent-primary)', sw: 3, text: 'var(--accent-primary)' }
      case 'target': return { fill: 'rgba(239,68,68,0.15)', stroke: 'var(--accent-danger)', sw: 2.5, text: 'var(--accent-danger)' }
      case 'rejected': return { fill: 'rgba(239,68,68,0.08)', stroke: 'rgba(239,68,68,0.4)', sw: 1, text: 'rgba(239,68,68,0.5)' }
      default: return { fill: 'var(--bg-elevated)', stroke: 'var(--border-default)', sw: 1.5, text: 'var(--text-primary)' }
    }
  }

  const getEdgeColor = (from, to) => {
    const key = getEdgeKey(from, to)
    const state = edgeStates[key] || 'default'
    switch (state) {
      case 'active': return { stroke: '#eab308', sw: 3, dash: 'none' }
      case 'inMST': return { stroke: 'var(--accent-success)', sw: 3, dash: 'none' }
      case 'inPath': return { stroke: '#a855f7', sw: 3, dash: 'none' }
      case 'rejected': return { stroke: 'rgba(239,68,68,0.3)', sw: 1, dash: '6,4' }
      case 'flow': return { stroke: 'var(--accent-primary)', sw: 2.5, dash: 'none' }
      case 'considering': return { stroke: '#eab308', sw: 2, dash: '4,3' }
      default: return { stroke: 'var(--border-default)', sw: 1.5, dash: 'none' }
    }
  }

  // Compute edge midpoint for weight label
  const getEdgeMidpoint = (fromNode, toNode) => {
    const mx = (fromNode.x + toNode.x) / 2
    const my = (fromNode.y + toNode.y) / 2
    // Offset perpendicular to edge
    const dx = toNode.x - fromNode.x
    const dy = toNode.y - fromNode.y
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const offsetX = -(dy / len) * 14
    const offsetY = (dx / len) * 14
    return { x: mx + offsetX, y: my + offsetY }
  }

  // Arrow for directed edges
  const getArrowPoints = (fromNode, toNode) => {
    const dx = toNode.x - fromNode.x
    const dy = toNode.y - fromNode.y
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const ux = dx / len, uy = dy / len
    // Arrow tip at node boundary
    const tipX = toNode.x - ux * (NODE_R + 2)
    const tipY = toNode.y - uy * (NODE_R + 2)
    const aw = 8, ah = 12
    return `M ${tipX} ${tipY} L ${tipX - ux * ah + uy * aw} ${tipY - uy * ah - ux * aw} L ${tipX - ux * ah - uy * aw} ${tipY - uy * ah + ux * aw} Z`
  }

  return (
    <div className="gc-wrapper">
      <svg
        ref={svgRef}
        className="gc-svg"
        viewBox={`0 0 ${width} ${height}`}
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onMouseLeave={() => { setDragging(null); setConnecting(null) }}
      >
        <rect className="gc-bg" x="0" y="0" width={width} height={height} fill="transparent" />

        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = nodes.find(n => n.id === edge.from)
          const toNode = nodes.find(n => n.id === edge.to)
          if (!fromNode || !toNode) return null
          const ec = getEdgeColor(edge.from, edge.to)
          const key = getEdgeKey(edge.from, edge.to)
          const mid = getEdgeMidpoint(fromNode, toNode)
          const customLabel = edgeLabels[key]

          return (
            <g key={`e-${i}`}>
              <line
                x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y}
                stroke={ec.stroke} strokeWidth={ec.sw} strokeDasharray={ec.dash}
                className="gc-edge"
              />
              {/* Click target (wider invisible line) */}
              <line
                x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y}
                stroke="transparent" strokeWidth="12"
                style={{ cursor: disabled ? 'default' : 'pointer' }}
                onClick={(e) => handleEdgeClick(e, edge.from, edge.to)}
                onDoubleClick={(e) => handleEdgeDoubleClick(e, edge.from, edge.to)}
              />
              {directed && (
                <path d={getArrowPoints(fromNode, toNode)} fill={ec.stroke} />
              )}
              {/* Weight label */}
              {showWeights && (
                <g>
                  <rect x={mid.x - 12} y={mid.y - 9} width="24" height="18" rx="4"
                    fill="var(--bg-surface)" stroke={ec.stroke} strokeWidth="0.5" opacity="0.9" />
                  <text x={mid.x} y={mid.y + 4} textAnchor="middle"
                    fontSize="10" fontWeight="700" fontFamily="var(--font-mono)"
                    fill={ec.stroke === 'var(--border-default)' ? 'var(--text-secondary)' : ec.stroke}>
                    {customLabel || edge.weight}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Connecting line (while creating edge) */}
        {connecting !== null && (() => {
          const fromN = nodes.find(n => n.id === connecting)
          return fromN ? (
            <line x1={fromN.x} y1={fromN.y} x2={mousePos.x} y2={mousePos.y}
              stroke="var(--accent-primary)" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
          ) : null
        })()}

        {/* Nodes */}
        {nodes.map(node => {
          const nc = getNodeColor(node.id)
          return (
            <g key={`n-${node.id}`}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onDoubleClick={(e) => handleNodeDoubleClick(e, node.id)}
              style={{ cursor: disabled ? 'default' : 'grab' }}
              className="gc-node"
            >
              <circle cx={node.x} cy={node.y} r={NODE_R}
                fill={nc.fill} stroke={nc.stroke} strokeWidth={nc.sw}
              />
              <text x={node.x} y={node.y + 4} textAnchor="middle"
                fontSize="11" fontWeight="700" fontFamily="var(--font-mono)"
                fill={nc.text} style={{ pointerEvents: 'none' }}>
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Weight editor popup */}
      {editingEdge && (
        <div className="gc-weight-editor">
          <label>Weight:</label>
          <input type="number" value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleWeightSubmit()}
            autoFocus
          />
          <button onClick={handleWeightSubmit}>✓</button>
          <button onClick={() => setEditingEdge(null)}>✗</button>
        </div>
      )}

      {!disabled && (
        <div className="gc-help">
          Click: add node • Drag: move • Shift+click: connect • Double-click: delete
        </div>
      )}
    </div>
  )
}
