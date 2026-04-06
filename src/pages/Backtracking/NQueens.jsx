import { useState, useRef } from 'react'
import GraphCanvas, { GRAPH_PRESETS } from '../../components/GraphCanvas/GraphCanvas'
import '../Sorting/Sorting.css'
import '../DataStructures/DS.css'
import './NQueens.css'

const algoList = [
  { key: 'nqueens', name: 'N-Queens' },
  { key: 'sudoku', name: 'Sudoku' },
  { key: 'graphcolor', name: 'Graph Coloring' },
  { key: 'hamiltonian', name: 'Hamiltonian Cycle' },
]

/* ═══════════════════════════════════════════
   BACKTRACKING COMPONENT
   ═══════════════════════════════════════════ */
export default function BacktrackingVisualizer() {
  const [algo, setAlgo] = useState('nqueens')
  const [isRunning, setIsRunning] = useState(false)
  const [message, setMessage] = useState('Select a problem and click Solve.')
  const [stepsCount, setStepsCount] = useState(0)
  const runningRef = useRef(false)

  /* ── N-Queens ── */
  const [boardSize, setBoardSize] = useState(8)
  const [board, setBoard] = useState(Array.from({ length: 8 }, () => Array(8).fill(0)))
  const [solutionCount, setSolutionCount] = useState(0)

  /* ── Sudoku ── */
  const defaultPuzzle = [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9],
  ]
  const [sudokuGrid, setSudokuGrid] = useState(defaultPuzzle.map(r => [...r]))
  const [sudokuFixed, setSudokuFixed] = useState(defaultPuzzle.map(r => r.map(v => v !== 0)))
  const [sudokuHighlight, setSudokuHighlight] = useState({ r: -1, c: -1 })

  /* ── Graph Coloring ── */
  const colorPresetNodes = [
    { id: 0, x: 200, y: 60, label: 'A' },
    { id: 1, x: 80, y: 160, label: 'B' },
    { id: 2, x: 320, y: 160, label: 'C' },
    { id: 3, x: 80, y: 300, label: 'D' },
    { id: 4, x: 320, y: 300, label: 'E' },
    { id: 5, x: 200, y: 380, label: 'F' },
  ]
  const colorPresetEdges = [
    { from: 0, to: 1, weight: 1 }, { from: 0, to: 2, weight: 1 },
    { from: 1, to: 2, weight: 1 }, { from: 1, to: 3, weight: 1 },
    { from: 2, to: 4, weight: 1 }, { from: 3, to: 4, weight: 1 },
    { from: 3, to: 5, weight: 1 }, { from: 4, to: 5, weight: 1 },
  ]
  const [gcNodes, setGcNodes] = useState(colorPresetNodes)
  const [gcEdges, setGcEdges] = useState(colorPresetEdges)
  const [numColors, setNumColors] = useState(3)
  const [nodeColors, setNodeColors] = useState({})

  /* ── Hamiltonian Cycle ── */
  const hamPresetNodes = [
    { id: 0, x: 200, y: 60, label: '0' },
    { id: 1, x: 80, y: 200, label: '1' },
    { id: 2, x: 320, y: 200, label: '2' },
    { id: 3, x: 120, y: 360, label: '3' },
    { id: 4, x: 280, y: 360, label: '4' },
  ]
  const hamPresetEdges = [
    { from: 0, to: 1, weight: 1 }, { from: 0, to: 2, weight: 1 },
    { from: 0, to: 3, weight: 1 }, { from: 1, to: 2, weight: 1 },
    { from: 1, to: 3, weight: 1 }, { from: 1, to: 4, weight: 1 },
    { from: 2, to: 3, weight: 1 }, { from: 3, to: 4, weight: 1 },
  ]
  const [hamNodes, setHamNodes] = useState(hamPresetNodes)
  const [hamEdges, setHamEdges] = useState(hamPresetEdges)
  const [hamPath, setHamPath] = useState([])
  const [hamNodeStates, setHamNodeStates] = useState({})
  const [hamEdgeStates, setHamEdgeStates] = useState({})

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))

  /* ═══ N-Queens Solver ═══ */
  const solveNQueens = async () => {
    const n = boardSize
    const b = Array.from({ length: n }, () => Array(n).fill(0))
    setBoard(b)
    setIsRunning(true)
    runningRef.current = true
    setSolutionCount(0)
    setStepsCount(0)
    let stepCount = 0, solutions = 0

    const isSafe = (board, row, col) => {
      for (let i = 0; i < row; i++) if (board[i][col] === 1) return false
      for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) if (board[i][j] === 1) return false
      for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) if (board[i][j] === 1) return false
      return true
    }

    const solveRow = async (row) => {
      if (!runningRef.current) return false
      if (row === n) { solutions++; setSolutionCount(solutions); setMessage(`Solution #${solutions} found!`); return true }
      for (let col = 0; col < n; col++) {
        stepCount++; setStepsCount(stepCount)
        b[row][col] = 2
        setBoard(b.map(r => [...r]))
        await sleep(Math.max(10, 80 - n * 5))
        if (isSafe(b, row, col)) {
          b[row][col] = 1
          setBoard(b.map(r => [...r]))
          await sleep(Math.max(10, 80 - n * 5))
          if (await solveRow(row + 1)) return true
          b[row][col] = 3
          setBoard(b.map(r => [...r]))
          await sleep(Math.max(10, 40 - n * 3))
        }
        b[row][col] = 0
        setBoard(b.map(r => [...r]))
      }
      return false
    }

    const found = await solveRow(0)
    if (!found && runningRef.current) setMessage('No solution exists.')
    setIsRunning(false); runningRef.current = false
  }

  /* ═══ Sudoku Solver ═══ */
  const solveSudoku = async () => {
    const g = sudokuGrid.map(r => [...r])
    setIsRunning(true)
    runningRef.current = true
    setStepsCount(0)
    let stepCount = 0

    const isValid = (grid, row, col, num) => {
      for (let j = 0; j < 9; j++) if (grid[row][j] === num) return false
      for (let i = 0; i < 9; i++) if (grid[i][col] === num) return false
      const sr = Math.floor(row / 3) * 3, sc = Math.floor(col / 3) * 3
      for (let i = sr; i < sr + 3; i++)
        for (let j = sc; j < sc + 3; j++)
          if (grid[i][j] === num) return false
      return true
    }

    const solve = async () => {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (g[i][j] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (!runningRef.current) return false
              stepCount++; setStepsCount(stepCount)
              if (isValid(g, i, j, num)) {
                g[i][j] = num
                setSudokuGrid(g.map(r => [...r]))
                setSudokuHighlight({ r: i, c: j })
                await sleep(20)
                if (await solve()) return true
                g[i][j] = 0
                setSudokuGrid(g.map(r => [...r]))
                await sleep(10)
              }
            }
            return false
          }
        }
      }
      return true
    }

    const found = await solve()
    setMessage(found ? '✓ Sudoku solved!' : 'No solution exists.')
    setSudokuHighlight({ r: -1, c: -1 })
    setIsRunning(false); runningRef.current = false
  }

  /* ═══ Graph Coloring ═══ */
  const solveGraphColoring = async () => {
    setIsRunning(true)
    runningRef.current = true
    setStepsCount(0)
    setNodeColors({})
    let stepCount = 0
    const colors = {}
    const PALETTE = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899']

    const adj = {}
    gcNodes.forEach(n => { adj[n.id] = [] })
    gcEdges.forEach(e => {
      adj[e.from].push(e.to)
      adj[e.to].push(e.from)
    })

    const isSafe = (node, color) => {
      for (const neighbor of adj[node]) {
        if (colors[neighbor] === color) return false
      }
      return true
    }

    const nodeOrder = gcNodes.map(n => n.id)

    const solve = async (idx) => {
      if (!runningRef.current) return false
      if (idx === nodeOrder.length) return true
      const node = nodeOrder[idx]

      for (let c = 0; c < numColors; c++) {
        stepCount++; setStepsCount(stepCount)
        colors[node] = c
        setNodeColors({ ...colors })
        setMessage(`Trying color ${c + 1} for node ${gcNodes.find(n => n.id === node)?.label}`)
        await sleep(200)

        if (isSafe(node, c)) {
          if (await solve(idx + 1)) return true
        }
        delete colors[node]
        setNodeColors({ ...colors })
        await sleep(100)
      }
      return false
    }

    const found = await solve(0)
    setMessage(found ? `✓ Graph colored with ${numColors} colors!` : `✗ Cannot color with ${numColors} colors.`)
    setIsRunning(false); runningRef.current = false
  }

  /* ═══ Hamiltonian Cycle ═══ */
  const solveHamiltonian = async () => {
    setIsRunning(true)
    runningRef.current = true
    setStepsCount(0)
    setHamPath([])
    setHamNodeStates({})
    setHamEdgeStates({})
    let stepCount = 0

    const adj = {}
    hamNodes.forEach(n => { adj[n.id] = [] })
    hamEdges.forEach(e => {
      adj[e.from].push(e.to)
      adj[e.to].push(e.from)
    })

    const path = [hamNodes[0].id]
    const visited = new Set([hamNodes[0].id])

    const updateVisual = async (extraEdgeStates = {}) => {
      const ns = {}; path.forEach((id, i) => { ns[id] = i === path.length - 1 ? 'active' : 'inPath' })
      setHamNodeStates(ns)
      const es = {}
      for (let i = 1; i < path.length; i++) {
        const f = path[i - 1], t = path[i]
        es[`${Math.min(f, t)}-${Math.max(f, t)}`] = 'inPath'
      }
      Object.assign(es, extraEdgeStates)
      setHamEdgeStates(es)
      setHamPath([...path])
      await sleep(200)
    }

    const solve = async () => {
      if (!runningRef.current) return false
      if (path.length === hamNodes.length) {
        // Check if cycle exists back to start
        const last = path[path.length - 1]
        const first = path[0]
        if (adj[last].includes(first)) {
          path.push(first)
          await updateVisual()
          return true
        }
        return false
      }

      const current = path[path.length - 1]
      for (const next of adj[current]) {
        if (!visited.has(next)) {
          stepCount++; setStepsCount(stepCount)
          visited.add(next)
          path.push(next)
          setMessage(`Trying: ${path.map(id => hamNodes.find(n => n.id === id)?.label).join(' → ')}`)
          await updateVisual()

          if (await solve()) return true

          path.pop()
          visited.delete(next)
          await updateVisual()
        }
      }
      return false
    }

    const found = await solve()
    setMessage(found ? `✓ Hamiltonian cycle: ${path.map(id => hamNodes.find(n => n.id === id)?.label).join(' → ')}` : '✗ No Hamiltonian cycle exists.')
    setIsRunning(false); runningRef.current = false
  }

  /* ═══ Common handlers ═══ */
  const handleSolve = () => {
    if (algo === 'nqueens') solveNQueens()
    else if (algo === 'sudoku') solveSudoku()
    else if (algo === 'graphcolor') solveGraphColoring()
    else if (algo === 'hamiltonian') solveHamiltonian()
  }

  const handleReset = () => {
    runningRef.current = false
    setIsRunning(false)
    setStepsCount(0)
    if (algo === 'nqueens') {
      setBoard(Array.from({ length: boardSize }, () => Array(boardSize).fill(0)))
      setSolutionCount(0)
    } else if (algo === 'sudoku') {
      setSudokuGrid(defaultPuzzle.map(r => [...r]))
      setSudokuHighlight({ r: -1, c: -1 })
    } else if (algo === 'graphcolor') {
      setNodeColors({})
    } else if (algo === 'hamiltonian') {
      setHamPath([]); setHamNodeStates({}); setHamEdgeStates({})
    }
    setMessage('Reset.')
  }

  const getCellClass = (val, r, c) => {
    const isDark = (r + c) % 2 === 1
    let cls = isDark ? 'chess-cell dark' : 'chess-cell light'
    if (val === 1) cls += ' queen'
    if (val === 2) cls += ' trying'
    if (val === 3) cls += ' backtrack'
    return cls
  }

  /* ═══ Graph Coloring node states ═══ */
  const PALETTE = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899']
  const gcNodeStates = {}
  Object.entries(nodeColors).forEach(([id, colorIdx]) => {
    gcNodeStates[parseInt(id)] = 'active' // we'll use custom fill in render
  })

  return (
    <div className="ds-page">
      <div className="viz-header">
        <div>
          <span className="section-label">Backtracking</span>
          <h1 className="viz-title">{algoList.find(a => a.key === algo)?.name}</h1>
        </div>
        <div className="viz-stats">
          <div className="stat-item">
            <span className="stat-label">Steps</span>
            <span className="stat-value gradient-text">{stepsCount}</span>
          </div>
          {algo === 'nqueens' && (
            <div className="stat-item">
              <span className="stat-label">Solutions</span>
              <span className="stat-value">{solutionCount}</span>
            </div>
          )}
        </div>
      </div>

      <div className="algo-selector">
        {algoList.map(a => (
          <button key={a.key} className={`algo-btn ${algo === a.key ? 'active' : ''}`}
            onClick={() => { if (!isRunning) { setAlgo(a.key); handleReset() } }} disabled={isRunning}>
            {a.name}
          </button>
        ))}
      </div>

      <div className="ds-canvas glass-card">
        {/* N-Queens board */}
        {algo === 'nqueens' && (
          <div className="chess-container">
            <div className="chess-board" style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}>
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <div key={`${r}-${c}`} className={getCellClass(cell, r, c)}>
                    {cell === 1 && <span className="queen-icon">♛</span>}
                    {cell === 2 && <span className="trying-icon">?</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Sudoku board */}
        {algo === 'sudoku' && (
          <div className="sudoku-container">
            <div className="sudoku-board">
              {sudokuGrid.map((row, r) => (
                <div key={r} className="sudoku-row">
                  {row.map((cell, c) => {
                    const isHL = sudokuHighlight.r === r && sudokuHighlight.c === c
                    const isFixed = sudokuFixed[r][c]
                    const boxBorderR = r % 3 === 2 && r < 8
                    const boxBorderC = c % 3 === 2 && c < 8
                    return (
                      <div key={`${r}-${c}`} className={`sudoku-cell ${isFixed ? 'fixed' : ''} ${isHL ? 'highlight' : ''} ${cell > 0 ? 'filled' : ''} ${boxBorderR ? 'box-border-bottom' : ''} ${boxBorderC ? 'box-border-right' : ''}`}>
                        {cell > 0 ? cell : ''}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Graph Coloring */}
        {algo === 'graphcolor' && (
          <div className="graph-bt-container">
            <svg className="gc-overlay-svg" viewBox="0 0 600 450" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {/* Edges */}
              {gcEdges.map((e, i) => {
                const from = gcNodes.find(n => n.id === e.from)
                const to = gcNodes.find(n => n.id === e.to)
                if (!from || !to) return null
                return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--border-default)" strokeWidth="1.5" />
              })}
              {/* Nodes */}
              {gcNodes.map(node => {
                const colorIdx = nodeColors[node.id]
                const fill = colorIdx !== undefined ? PALETTE[colorIdx] : 'var(--bg-elevated)'
                const stroke = colorIdx !== undefined ? PALETTE[colorIdx] : 'var(--border-default)'
                return (
                  <g key={node.id}>
                    <circle cx={node.x} cy={node.y} r="22" fill={colorIdx !== undefined ? `${fill}30` : fill} stroke={stroke} strokeWidth="2" />
                    <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="11" fontWeight="700"
                      fontFamily="var(--font-mono)" fill={colorIdx !== undefined ? fill : 'var(--text-primary)'}>
                      {node.label}
                    </text>
                  </g>
                )
              })}
            </svg>
            <div style={{ minHeight: '400px' }}></div>
          </div>
        )}

        {/* Hamiltonian Cycle */}
        {algo === 'hamiltonian' && (
          <div className="graph-bt-container">
            <GraphCanvas
              nodes={hamNodes}
              edges={hamEdges}
              directed={false}
              onGraphChange={({ nodes, edges }) => { setHamNodes(nodes); setHamEdges(edges) }}
              nodeStates={hamNodeStates}
              edgeStates={hamEdgeStates}
              disabled={isRunning}
              showWeights={false}
            />
          </div>
        )}

        <div className="ds-message">{message}</div>
      </div>

      <div className="ds-controls glass">
        <div className="ds-inputs">
          {algo === 'nqueens' && (
            <div className="control-group">
              <label className="control-label">Board Size</label>
              <input type="range" min="4" max="12" value={boardSize}
                onChange={e => { if (!isRunning) { setBoardSize(Number(e.target.value)); setBoard(Array.from({ length: Number(e.target.value) }, () => Array(Number(e.target.value)).fill(0))) } }}
                className="range-slider" disabled={isRunning} />
              <span className="control-value">{boardSize}×{boardSize}</span>
            </div>
          )}
          {algo === 'graphcolor' && (
            <div className="control-group">
              <label className="control-label">Colors</label>
              <input type="range" min="2" max="6" value={numColors}
                onChange={e => setNumColors(Number(e.target.value))} className="range-slider" disabled={isRunning} />
              <span className="control-value">{numColors}</span>
            </div>
          )}
        </div>
        <div className="ds-buttons">
          <button className="btn-primary ds-btn" onClick={handleSolve} disabled={isRunning}>
            {isRunning ? 'Solving...' : '▶ Solve'}
          </button>
          <button className="btn-secondary ds-btn" onClick={() => { runningRef.current = false; setIsRunning(false) }} disabled={!isRunning}>Stop</button>
          <button className="btn-secondary ds-btn" onClick={handleReset} disabled={isRunning}>Reset</button>
        </div>
      </div>
    </div>
  )
}
