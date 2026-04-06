import { useState, useRef, useEffect } from 'react'
import FullscreenMode from '../../components/FullscreenMode/FullscreenMode'
import { useAudioExplain } from '../../hooks/useAudioExplain'
import '../Sorting/Sorting.css'
import './Graph.css'

/* ══════════════════════════════════════════════════════════════
   TAB 1 — PATHFINDER (Grid-based BFS / DFS / Dijkstra)
   ══════════════════════════════════════════════════════════════ */
const COLS = 35, ROWS = 18
const CELL = { EMPTY: 0, WALL: 1, START: 2, END: 3, VISITED: 4, PATH: 5, CURRENT: 6 }
function createGrid() { return Array.from({ length: ROWS }, () => Array(COLS).fill(CELL.EMPTY)) }

function Pathfinder() {
  const [grid, setGrid] = useState(() => {
    const g = createGrid(); g[8][5] = CELL.START; g[8][29] = CELL.END; return g
  })
  const start = [8, 5]
  const end = [8, 29]
  const [algo, setAlgo] = useState('bfs')
  const [isRunning, setIsRunning] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [message, setMessage] = useState('Click and drag to draw walls, then run.')
  const [stats, setStats] = useState({ visited: 0, pathLen: 0 })
  const runningRef = useRef(false)
  const sleep = (ms) => new Promise(r => setTimeout(r, ms))

  const resetGrid = () => {
    const g = createGrid(); g[start[0]][start[1]] = CELL.START; g[end[0]][end[1]] = CELL.END
    setGrid(g); setStats({ visited: 0, pathLen: 0 }); setMessage('Grid reset.')
    runningRef.current = false; setIsRunning(false)
  }
  const clearPath = () => {
    setGrid(prev => prev.map(row => row.map(cell =>
      cell === CELL.VISITED || cell === CELL.PATH || cell === CELL.CURRENT ? CELL.EMPTY : cell
    ))); setStats({ visited: 0, pathLen: 0 })
  }
  const generateMaze = () => {
    const g = createGrid()
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
      if (Math.random() < 0.3 && !(r === start[0] && c === start[1]) && !(r === end[0] && c === end[1]))
        g[r][c] = CELL.WALL
    g[start[0]][start[1]] = CELL.START; g[end[0]][end[1]] = CELL.END
    setGrid(g); setMessage('Random maze generated.')
  }

  const handleCellMouseDown = (r, c) => {
    if (isRunning || grid[r][c] === CELL.START || grid[r][c] === CELL.END) return
    setIsDrawing(true)
    setGrid(prev => { const g = prev.map(row => [...row]); g[r][c] = g[r][c] === CELL.WALL ? CELL.EMPTY : CELL.WALL; return g })
  }
  const handleCellMouseEnter = (r, c) => {
    if (!isDrawing || isRunning || grid[r][c] === CELL.START || grid[r][c] === CELL.END) return
    setGrid(prev => { const g = prev.map(row => [...row]); g[r][c] = CELL.WALL; return g })
  }

  const runAlgo = async () => {
    clearPath(); setIsRunning(true); runningRef.current = true
    const g = grid.map(r => [...r])
    const dirs = [[0,1],[1,0],[0,-1],[-1,0]]
    const visited = Array.from({length: ROWS}, () => Array(COLS).fill(false))
    const parent = Array.from({length: ROWS}, () => Array(COLS).fill(null))
    let visitCount = 0

    if (algo === 'bfs') {
      const queue = [start]; visited[start[0]][start[1]] = true
      while (queue.length > 0 && runningRef.current) {
        const [r, c] = queue.shift(); visitCount++
        if (r === end[0] && c === end[1]) break
        g[r][c] = g[r][c] === CELL.START ? CELL.START : CELL.VISITED
        setGrid(g.map(r => [...r])); setStats(s => ({ ...s, visited: visitCount })); await sleep(15)
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc] && g[nr][nc] !== CELL.WALL) {
            visited[nr][nc] = true; parent[nr][nc] = [r, c]; queue.push([nr, nc])
          }
        }
      }
    } else if (algo === 'dfs') {
      const stack = [start]
      while (stack.length > 0 && runningRef.current) {
        const [r, c] = stack.pop()
        if (visited[r][c]) continue; visited[r][c] = true; visitCount++
        if (r === end[0] && c === end[1]) break
        g[r][c] = g[r][c] === CELL.START ? CELL.START : CELL.VISITED
        setGrid(g.map(r => [...r])); setStats(s => ({ ...s, visited: visitCount })); await sleep(15)
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc] && g[nr][nc] !== CELL.WALL) {
            parent[nr][nc] = parent[nr][nc] || [r, c]; stack.push([nr, nc])
          }
        }
      }
    } else if (algo === 'dijkstra') {
      const dist = Array.from({length: ROWS}, () => Array(COLS).fill(Infinity))
      dist[start[0]][start[1]] = 0; const pq = [[0, ...start]]
      while (pq.length > 0 && runningRef.current) {
        pq.sort((a, b) => a[0] - b[0]); const [d, r, c] = pq.shift()
        if (visited[r][c]) continue; visited[r][c] = true; visitCount++
        if (r === end[0] && c === end[1]) break
        g[r][c] = g[r][c] === CELL.START ? CELL.START : CELL.VISITED
        setGrid(g.map(r => [...r])); setStats(s => ({ ...s, visited: visitCount })); await sleep(15)
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc] && g[nr][nc] !== CELL.WALL) {
            const nd = d + 1
            if (nd < dist[nr][nc]) { dist[nr][nc] = nd; parent[nr][nc] = [r, c]; pq.push([nd, nr, nc]) }
          }
        }
      }
    }

    if (visited[end[0]][end[1]]) {
      let curr = end, pathLen = 0
      while (curr && !(curr[0] === start[0] && curr[1] === start[1])) {
        g[curr[0]][curr[1]] = g[curr[0]][curr[1]] === CELL.END ? CELL.END : CELL.PATH
        setGrid(g.map(r => [...r])); await sleep(30)
        curr = parent[curr[0]][curr[1]]; pathLen++
      }
      setStats({ visited: visitCount, pathLen })
      setMessage(`Path found! Length: ${pathLen}, Visited: ${visitCount}`)
    } else { setMessage('No path found!') }
    setIsRunning(false); runningRef.current = false
  }

  const getCellClass = (val) => {
    switch (val) {
      case CELL.WALL: return 'cell-wall'; case CELL.START: return 'cell-start'
      case CELL.END: return 'cell-end'; case CELL.VISITED: return 'cell-visited'
      case CELL.PATH: return 'cell-path'; case CELL.CURRENT: return 'cell-current'
      default: return ''
    }
  }

  return (
    <>
      <div className="algo-selector">
        {[{key:'bfs',name:'BFS'},{key:'dfs',name:'DFS'},{key:'dijkstra',name:'Dijkstra'}].map(a => (
          <button key={a.key} className={`algo-btn ${algo === a.key ? 'active' : ''}`}
            onClick={() => !isRunning && setAlgo(a.key)} disabled={isRunning}>{a.name}</button>
        ))}
      </div>
      <div className="ds-canvas glass-card" style={{padding: 'var(--space-md)'}}>
        <div className="grid-container" onMouseLeave={() => setIsDrawing(false)} onMouseUp={() => setIsDrawing(false)}>
          {grid.map((row, r) => (
            <div key={r} className="grid-row">
              {row.map((cell, c) => (
                <div key={c} className={`grid-cell ${getCellClass(cell)}`}
                  onMouseDown={() => handleCellMouseDown(r, c)}
                  onMouseEnter={() => handleCellMouseEnter(r, c)} />
              ))}
            </div>
          ))}
        </div>
        <div className="ds-message">{message}</div>
      </div>
      <div className="ds-controls glass">
        <div className="ds-buttons">
          <button className="btn-primary ds-btn" onClick={runAlgo} disabled={isRunning}>
            {isRunning ? 'Running...' : 'Run Algorithm'}
          </button>
          <button className="btn-secondary ds-btn" onClick={clearPath} disabled={isRunning}>Clear Path</button>
          <button className="btn-secondary ds-btn" onClick={generateMaze} disabled={isRunning}>Random Maze</button>
          <button className="btn-secondary ds-btn" onClick={resetGrid} disabled={isRunning}>Reset All</button>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════
   TAB 2 — GRAPH TRAVERSAL (SVG-based, no canvas refs)
   ══════════════════════════════════════════════════════════════ */
const graphData = {
  nodes: [
    { id: 0, label: '0' }, { id: 1, label: '1' }, { id: 2, label: '2' }, { id: 3, label: '3' },
    { id: 4, label: '4' }, { id: 5, label: '5' }, { id: 6, label: '6' }, { id: 7, label: '7' },
  ],
  edges: [
    { from: 0, to: 1 }, { from: 0, to: 3 }, { from: 1, to: 2 }, { from: 1, to: 4 },
    { from: 2, to: 5 }, { from: 3, to: 4 }, { from: 3, to: 6 }, { from: 4, to: 5 },
    { from: 4, to: 7 }, { from: 6, to: 7 },
  ]
}

// Pre-compute static positions (percentage-based for responsiveness)
const nodePositions = [
  { x: 120, y: 60 }, { x: 280, y: 60 }, { x: 440, y: 60 }, { x: 600, y: 60 },
  { x: 160, y: 200 }, { x: 320, y: 200 }, { x: 480, y: 200 }, { x: 640, y: 200 },
]

const NODE_R = 22
const COL = { unvisited: '#38bdf8', frontier: '#f97316', visited: '#22c55e', current: '#eab308', edge: '#4b5563', edgeHi: '#f97316' }

// Build adjacency once
const adjacency = new Map()
graphData.nodes.forEach(n => adjacency.set(n.id, []))
graphData.edges.forEach(e => adjacency.get(e.from).push(e.to))

function makeInitState() {
  const ns = {}
  graphData.nodes.forEach(n => { ns[n.id] = { color: COL.unvisited, tag: '' } })
  const es = graphData.edges.map(e => ({ ...e, hi: false }))
  return { ns, es }
}

function GraphTraversal() {
  const [algo, setAlgo] = useState('bfs')
  const [startNode, setStartNode] = useState(0)
  const [speed, setSpeed] = useState(400)
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState('Ready. Choose an algorithm and click Run.')
  const [info, setInfo] = useState('')
  const [order, setOrder] = useState('')
  const [nodeState, setNodeState] = useState(() => makeInitState().ns)
  const [edgeState, setEdgeState] = useState(() => makeInitState().es)
  const runRef = useRef(false)

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))
  const getSpeed = () => speed

  const setNC = (id, color) => setNodeState(prev => ({ ...prev, [id]: { ...prev[id], color } }))
  const setNT = (id, tag) => setNodeState(prev => ({ ...prev, [id]: { ...prev[id], tag } }))
  const setNCT = (id, color, tag) => setNodeState(prev => ({ ...prev, [id]: { ...prev[id], color, tag } }))
  const hiEdge = (from, to, on) => setEdgeState(prev => prev.map(e => e.from === from && e.to === to ? { ...e, hi: on } : e))

  const reset = () => {
    const s = makeInitState()
    setNodeState(s.ns); setEdgeState(s.es)
    setStatus('Ready.'); setInfo(''); setOrder('')
  }

  // ── BFS ──
  const runBFS = async (start) => {
    const visited = new Set(), queue = [start], result = [], level = { [start]: 0 }
    visited.add(start); setNCT(start, COL.frontier, 'lvl 0'); await sleep(getSpeed())
    while (queue.length > 0 && runRef.current) {
      const u = queue.shift(); setInfo(`Dequeue ${u}`); setNC(u, COL.current); await sleep(getSpeed())
      result.push(u); setNC(u, COL.visited)
      for (const v of adjacency.get(u) || []) {
        hiEdge(u, v, true); setInfo(`Explore ${u} → ${v}`); await sleep(getSpeed())
        if (!visited.has(v)) {
          visited.add(v); queue.push(v); level[v] = level[u] + 1
          setNCT(v, COL.frontier, `lvl ${level[v]}`)
        }
        hiEdge(u, v, false)
      }
    }
    setStatus('BFS finished.'); setOrder('BFS order: ' + result.join(' → '))
  }

  // ── DFS ──
  const runDFS = async (start) => {
    const visited = new Set(), result = []
    let time = 0
    const dfs = async (u) => {
      if (!runRef.current) return
      visited.add(u); time++; setNCT(u, COL.current, `in ${time}`); setInfo(`Visit ${u}`); await sleep(getSpeed())
      for (const v of adjacency.get(u) || []) {
        hiEdge(u, v, true); setInfo(`Explore ${u} → ${v}`); await sleep(getSpeed())
        if (!visited.has(v)) { setNC(v, COL.frontier); await dfs(v) }
        hiEdge(u, v, false)
      }
      result.push(u); time++; setNCT(u, COL.visited, `out ${time}`); await sleep(getSpeed())
    }
    setStatus(`DFS from ${start}`); await dfs(start)
    setStatus('DFS finished.'); setOrder('Post-order: ' + result.join(' → '))
  }

  // ── Topological Sort (DFS) ──
  const runTopoDFS = async () => {
    const visited = new Set(), result = []
    let time = 0
    const dfs = async (u) => {
      if (!runRef.current) return
      visited.add(u); time++; setNCT(u, COL.current, `in ${time}`); setInfo(`Topo visit ${u}`); await sleep(getSpeed())
      for (const v of adjacency.get(u) || []) {
        hiEdge(u, v, true); await sleep(getSpeed())
        if (!visited.has(v)) { setNC(v, COL.frontier); await dfs(v) }
        hiEdge(u, v, false)
      }
      result.push(u); time++; setNCT(u, COL.visited, `out ${time}`); await sleep(getSpeed())
    }
    setStatus('Topological Sort (DFS)')
    for (const n of graphData.nodes) { if (!visited.has(n.id) && runRef.current) await dfs(n.id) }
    result.reverse()
    result.forEach((id, idx) => setNT(id, `#${idx + 1}`))
    setStatus('Topo sort finished.'); setOrder('Topo order: ' + result.join(' → '))
  }

  // ── Topological Sort (Kahn BFS) ──
  const runTopoKahn = async () => {
    const indeg = {}; graphData.nodes.forEach(n => indeg[n.id] = 0)
    graphData.edges.forEach(e => indeg[e.to]++)
    const queue = [], result = []
    for (const id in indeg) {
      const nid = Number(id)
      setNT(nid, `in:${indeg[nid]}`)
      if (indeg[nid] === 0) { queue.push(nid); setNC(nid, COL.frontier) }
    }
    setStatus('Topological Sort (Kahn)'); await sleep(getSpeed())
    while (queue.length > 0 && runRef.current) {
      const u = queue.shift(); setInfo(`Pop ${u}`); setNC(u, COL.current); await sleep(getSpeed())
      result.push(u); setNC(u, COL.visited); await sleep(getSpeed())
      for (const v of adjacency.get(u) || []) {
        hiEdge(u, v, true); await sleep(getSpeed())
        indeg[v]--; setNT(v, `in:${indeg[v]}`)
        if (indeg[v] === 0) { queue.push(v); setNC(v, COL.frontier) }
        await sleep(getSpeed()); hiEdge(u, v, false)
      }
    }
    result.forEach((id, idx) => setNT(id, `#${idx + 1}`))
    setStatus('Topo sort (Kahn) finished.'); setOrder('Topo order: ' + result.join(' → '))
  }

  // ── Bipartite ──
  const runBipartite = async (start) => {
    const color = {}, visited = new Set(), queue = [start], result = []
    const undirNeighbors = (u) => {
      const out = new Set(adjacency.get(u) || [])
      graphData.edges.forEach(e => { if (e.to === u) out.add(e.from) })
      return [...out]
    }
    color[start] = 0; visited.add(start); setNCT(start, COL.frontier, 'c:0'); await sleep(getSpeed())
    let bipartite = true
    while (queue.length > 0 && bipartite && runRef.current) {
      const u = queue.shift(); result.push(u)
      setNC(u, COL.current); setInfo(`Process ${u}, color ${color[u]}`); await sleep(getSpeed())
      for (const v of undirNeighbors(u)) {
        hiEdge(u, v, true); await sleep(getSpeed())
        if (color[v] === undefined) {
          color[v] = 1 - color[u]; visited.add(v); queue.push(v)
          setNCT(v, COL.frontier, `c:${color[v]}`); await sleep(getSpeed())
        } else if (color[v] === color[u]) {
          bipartite = false; setInfo(`Conflict: ${u} & ${v} same color!`)
          setNC(v, '#ef4444'); setNC(u, '#ef4444'); await sleep(getSpeed() * 2)
          hiEdge(u, v, false); break
        }
        hiEdge(u, v, false)
      }
      if (bipartite) setNC(u, COL.visited); await sleep(getSpeed())
    }
    setStatus(bipartite ? 'Graph is bipartite!' : 'NOT bipartite.')
    setOrder(bipartite ? 'Order: ' + result.join(' → ') : 'Conflict detected.')
  }

  const runSelected = async () => {
    if (isRunning) return
    reset(); setIsRunning(true); runRef.current = true
    try {
      if (algo === 'bfs') await runBFS(startNode)
      else if (algo === 'dfs') await runDFS(startNode)
      else if (algo === 'topoDfs') await runTopoDFS()
      else if (algo === 'topoKahn') await runTopoKahn()
      else if (algo === 'bipartite') await runBipartite(startNode)
    } catch (e) { setStatus('Error: ' + e.message) }
    setIsRunning(false); runRef.current = false
  }

  // SVG arrow marker
  const arrowId = 'gt-arrow'

  return (
    <>
      <div className="gt-controls">
        <div className="gt-ctrl-group">
          <label className="gt-label">Algorithm</label>
          <select className="gt-select" value={algo} onChange={e => setAlgo(e.target.value)} disabled={isRunning}>
            <option value="bfs">BFS (Breadth-First)</option>
            <option value="dfs">DFS (Depth-First)</option>
            <option value="topoDfs">Topological Sort (DFS)</option>
            <option value="topoKahn">Topological Sort (Kahn)</option>
            <option value="bipartite">Bipartite Check</option>
          </select>
        </div>
        <div className="gt-ctrl-group">
          <label className="gt-label">Start Node</label>
          <select className="gt-select" value={startNode} onChange={e => setStartNode(Number(e.target.value))} disabled={isRunning}>
            {graphData.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </div>
        <div className="gt-ctrl-group">
          <label className="gt-label">Speed (ms)</label>
          <input type="range" className="gt-slider" min="50" max="1000" value={speed}
            onChange={e => setSpeed(Number(e.target.value))} />
        </div>
        <button className="btn-primary ds-btn" onClick={runSelected} disabled={isRunning}>
          {isRunning ? 'Running...' : '▶ Run'}
        </button>
        <button className="btn-secondary ds-btn" onClick={() => { runRef.current = false; reset() }} disabled={isRunning}>
          Reset
        </button>
      </div>

      <div className="gt-main">
        {/* SVG Graph */}
        <div className="gt-canvas-wrap">
          <svg viewBox="0 0 760 280" className="gt-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <marker id={arrowId} markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" fill={COL.edge}>
                <polygon points="0 0, 10 3.5, 0 7" />
              </marker>
              <marker id={`${arrowId}-hi`} markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" fill={COL.edgeHi}>
                <polygon points="0 0, 10 3.5, 0 7" />
              </marker>
            </defs>

            {/* Edges */}
            {edgeState.map((e, i) => {
              const from = nodePositions[e.from], to = nodePositions[e.to]
              const dx = to.x - from.x, dy = to.y - from.y
              const len = Math.sqrt(dx*dx + dy*dy)
              const ux = dx/len, uy = dy/len
              return (
                <line key={i}
                  x1={from.x + ux * NODE_R} y1={from.y + uy * NODE_R}
                  x2={to.x - ux * (NODE_R + 10)} y2={to.y - uy * (NODE_R + 10)}
                  stroke={e.hi ? COL.edgeHi : COL.edge}
                  strokeWidth={e.hi ? 3 : 1.5}
                  markerEnd={`url(#${e.hi ? arrowId + '-hi' : arrowId})`}
                  style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                />
              )
            })}

            {/* Nodes */}
            {graphData.nodes.map(n => {
              const pos = nodePositions[n.id]
              const ns = nodeState[n.id] || { color: COL.unvisited, tag: '' }
              return (
                <g key={n.id}>
                  <circle cx={pos.x} cy={pos.y} r={NODE_R} fill={ns.color}
                    stroke="#0a0f19" strokeWidth="2"
                    style={{ filter: `drop-shadow(0 0 8px ${ns.color}66)`, transition: 'fill 0.25s' }} />
                  <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fill="#0a0f19" fontSize="13" fontWeight="bold" fontFamily="system-ui">
                    {n.label}
                  </text>
                  {ns.tag && (
                    <text x={pos.x} y={pos.y + NODE_R + 14} textAnchor="middle"
                      fill="#94a3b8" fontSize="9" fontFamily="monospace">
                      {ns.tag}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Side Panel */}
        <div className="gt-side">
          <div className="gt-panel">
            <div className="gt-panel-title">Status</div>
            <div className="gt-panel-text">{status}</div>
          </div>
          <div className="gt-panel">
            <div className="gt-panel-title">Current Step</div>
            <div className="gt-panel-text">{info || '—'}</div>
          </div>
          <div className="gt-panel">
            <div className="gt-panel-title">Legend</div>
            <div className="gt-legend">
              <span><i style={{background:'#38bdf8'}}/> Unvisited</span>
              <span><i style={{background:'#f97316'}}/> Frontier</span>
              <span><i style={{background:'#22c55e'}}/> Visited</span>
              <span><i style={{background:'#eab308'}}/> Current</span>
            </div>
          </div>
          <div className="gt-panel">
            <div className="gt-panel-title">Result</div>
            <div className="gt-panel-mono">{order || 'Run an algorithm to see results.'}</div>
          </div>
          <div className="gt-badges">
            <span className="gt-badge">Directed graph</span>
            <span className="gt-badge">Adjacency list</span>
            <span className="gt-badge">O(V + E)</span>
          </div>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE — Tab Container
   ══════════════════════════════════════════════════════════════ */
export default function GraphVisualizer() {
  const [tab, setTab] = useState('traversal')

  return (
    <div className="ds-page" style={{position:'relative'}}>
      <FullscreenMode codeContent={[]} currentLine={-1} />
      <div className="viz-header">
        <div>
          <span className="section-label">Graph Algorithms</span>
          <h1 className="viz-title">{tab === 'pathfinder' ? 'Pathfinder' : 'Graph Traversal'}</h1>
        </div>
        <div className="gt-tabs">
          <button className={`gt-tab ${tab === 'traversal' ? 'active' : ''}`}
            onClick={() => setTab('traversal')}>🕸️ Traversal</button>
          <button className={`gt-tab ${tab === 'pathfinder' ? 'active' : ''}`}
            onClick={() => setTab('pathfinder')}>📍 Pathfinder</button>
        </div>
      </div>
      {tab === 'pathfinder' ? <Pathfinder /> : <GraphTraversal />}
    </div>
  )
}
