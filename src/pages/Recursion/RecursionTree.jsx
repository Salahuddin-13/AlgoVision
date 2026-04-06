import { useState, useRef, useCallback, useEffect } from 'react'
import '../Sorting/Sorting.css'
import '../DataStructures/DS.css'
import './Recursion.css'

/* ── Presets ── */
const presets = {
  fibonacci: {
    name: 'Fibonacci',
    code: `function fib(n) {\n  if (n <= 1) return n;\n  return fib(n-1) + fib(n-2);\n}`,
    maxN: 8,
  },
  factorial: {
    name: 'Factorial',
    code: `function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n-1);\n}`,
    maxN: 10,
  },
}

/* ── Build tree WITH recursion execution order ──
   Generates a tree and a list of steps representing exactly how
   the recursion unfolds: call, return base, recurse-left, return-left,
   recurse-right, return-right, compute-return */

let _nodeId = 0

function buildFibTreeWithSteps(n, depth = 0) {
  const id = _nodeId++
  const node = { id, label: `fib(${n})`, n, depth, children: [], val: null, x: 0, y: 0 }

  if (n <= 1) {
    node.val = n
    return { node, steps: [
      { type: 'call', nodeId: id, label: `fib(${n})`, depth },
      { type: 'return', nodeId: id, label: `fib(${n})`, val: n, depth, desc: `fib(${n}) = ${n} (base case)` },
    ]}
  }

  const steps = []
  steps.push({ type: 'call', nodeId: id, label: `fib(${n})`, depth })

  // Recurse left: fib(n-1)
  const left = buildFibTreeWithSteps(n - 1, depth + 1)
  node.children.push(left.node)
  steps.push(...left.steps)

  // Recurse right: fib(n-2)
  const right = buildFibTreeWithSteps(n - 2, depth + 1)
  node.children.push(right.node)
  steps.push(...right.steps)

  // Compute
  node.val = left.node.val + right.node.val
  steps.push({
    type: 'return', nodeId: id, label: `fib(${n})`,
    val: node.val, depth,
    desc: `fib(${n}) = fib(${n-1}) + fib(${n-2}) = ${left.node.val} + ${right.node.val} = ${node.val}`,
  })

  return { node, steps }
}

function buildFactTreeWithSteps(n, depth = 0) {
  const id = _nodeId++
  const node = { id, label: `fact(${n})`, n, depth, children: [], val: null, x: 0, y: 0 }

  if (n <= 1) {
    node.val = 1
    return { node, steps: [
      { type: 'call', nodeId: id, label: `fact(${n})`, depth },
      { type: 'return', nodeId: id, label: `fact(${n})`, val: 1, depth, desc: `fact(${n}) = 1 (base case)` },
    ]}
  }

  const steps = []
  steps.push({ type: 'call', nodeId: id, label: `fact(${n})`, depth })

  const child = buildFactTreeWithSteps(n - 1, depth + 1)
  node.children.push(child.node)
  steps.push(...child.steps)

  node.val = n * child.node.val
  steps.push({
    type: 'return', nodeId: id, label: `fact(${n})`,
    val: node.val, depth,
    desc: `fact(${n}) = ${n} × fact(${n-1}) = ${n} × ${child.node.val} = ${node.val}`,
  })

  return { node, steps }
}

/* ── Position nodes in the tree (for SVG layout) ── */
function layoutTree(node, x, y, spread, maxDepth) {
  node.x = x
  node.y = y
  const gap = 65
  node.children.forEach((child, i) => {
    const offset = (i - (node.children.length - 1) / 2) * spread
    layoutTree(child, x + offset, y + gap, spread * 0.52, maxDepth)
  })
}

/* ── Flatten tree to arrays for rendering ── */
function flattenTree(node) {
  const nodes = []
  const edges = []
  function walk(n) {
    nodes.push(n)
    n.children.forEach(c => {
      edges.push({ from: { x: n.x, y: n.y, id: n.id }, to: { x: c.x, y: c.y, id: c.id } })
      walk(c)
    })
  }
  walk(node)
  return { nodes, edges }
}

/* ── Speed helpers ── */
function getDelayMs(speed) {
  if (speed <= 20) return 1200
  if (speed <= 40) return 800
  if (speed <= 60) return 500
  if (speed <= 80) return 300
  return 150
}

function getSpeedLabel(speed) {
  if (speed <= 20) return 'Slow'
  if (speed <= 40) return 'Normal'
  if (speed <= 60) return 'Fast'
  if (speed <= 80) return 'Faster'
  return 'Instant'
}

/* ══════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════ */
export default function RecursionTree() {
  const [preset, setPreset] = useState('fibonacci')
  const [inputN, setInputN] = useState(5)
  const [speed, setSpeed] = useState(40)

  // Animation state
  const [treeRoot, setTreeRoot] = useState(null)
  const [allSteps, setAllSteps] = useState([])
  const [stepIndex, setStepIndex] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [message, setMessage] = useState('Choose a recursive function and click Build.')

  // Derived state per step
  const [visibleNodeIds, setVisibleNodeIds] = useState(new Set())
  const [activeNodeId, setActiveNodeId] = useState(null)
  const [returnedNodeIds, setReturnedNodeIds] = useState(new Set())
  const [callStack, setCallStack] = useState([])

  const runRef = useRef(false)
  const pauseRef = useRef(false)
  const stepRef = useRef(-1)
  const stepsRef = useRef([])

  /* ── Build the tree and generate steps ── */
  const handleBuild = useCallback(() => {
    const n = parseInt(inputN)
    if (isNaN(n) || n < 0 || n > presets[preset].maxN) {
      setMessage(`Enter a value between 0 and ${presets[preset].maxN}.`)
      return
    }

    _nodeId = 0
    let result
    if (preset === 'fibonacci') {
      result = buildFibTreeWithSteps(n)
    } else {
      result = buildFactTreeWithSteps(n)
    }

    const root = result.node
    const maxDepth = Math.max(...result.steps.map(s => s.depth))
    const baseSpread = Math.min(350, 80 * Math.pow(2, maxDepth - 1))
    layoutTree(root, 450, 35, baseSpread, maxDepth)

    setTreeRoot(root)
    setAllSteps(result.steps)
    stepsRef.current = result.steps
    setStepIndex(-1)
    stepRef.current = -1
    setVisibleNodeIds(new Set())
    setActiveNodeId(null)
    setReturnedNodeIds(new Set())
    setCallStack([])
    setIsRunning(false)
    setIsPaused(false)
    runRef.current = false
    pauseRef.current = false
    setMessage(`Built tree for ${presets[preset].name}(${n}). Press Play to animate.`)
  }, [inputN, preset])

  /* ── Apply a step to the UI state ── */
  const applyStep = useCallback((idx, steps) => {
    if (idx < 0 || idx >= steps.length) return
    const step = steps[idx]

    // Rebuild state from scratch up to idx for correctness
    const visible = new Set()
    const returned = new Set()
    const stack = []

    for (let i = 0; i <= idx; i++) {
      const s = steps[i]
      if (s.type === 'call') {
        visible.add(s.nodeId)
        stack.push(s.label)
      } else if (s.type === 'return') {
        returned.add(s.nodeId)
        // Pop the call from stack
        const popIdx = stack.lastIndexOf(s.label)
        if (popIdx !== -1) stack.splice(popIdx, 1)
      }
    }

    setVisibleNodeIds(visible)
    setReturnedNodeIds(returned)
    setCallStack([...stack])
    setActiveNodeId(step.nodeId)
    setMessage(step.desc || (step.type === 'call' ? `Calling ${step.label}` : `Returned ${step.label} = ${step.val}`))
  }, [])

  /* ── Step Forward ── */
  const handleStepForward = useCallback(() => {
    const steps = stepsRef.current
    if (steps.length === 0) return
    const next = stepRef.current + 1
    if (next >= steps.length) return
    stepRef.current = next
    setStepIndex(next)
    applyStep(next, steps)
  }, [applyStep])

  /* ── Step Back ── */
  const handleStepBack = useCallback(() => {
    const steps = stepsRef.current
    if (steps.length === 0) return
    const prev = stepRef.current - 1
    if (prev < 0) return
    stepRef.current = prev
    setStepIndex(prev)
    applyStep(prev, steps)
  }, [applyStep])

  /* ── Play / Pause / Stop ── */
  const handlePlay = useCallback(async () => {
    const steps = stepsRef.current
    if (steps.length === 0) return
    if (stepRef.current >= steps.length - 1) {
      // restart
      stepRef.current = -1
      setStepIndex(-1)
      setVisibleNodeIds(new Set())
      setActiveNodeId(null)
      setReturnedNodeIds(new Set())
      setCallStack([])
    }
    setIsRunning(true)
    setIsPaused(false)
    runRef.current = true
    pauseRef.current = false

    while (runRef.current && stepRef.current < steps.length - 1) {
      if (pauseRef.current) {
        await new Promise(r => setTimeout(r, 100))
        continue
      }
      const next = stepRef.current + 1
      stepRef.current = next
      setStepIndex(next)
      applyStep(next, steps)
      await new Promise(r => setTimeout(r, getDelayMs(speed)))
    }
    if (stepRef.current >= steps.length - 1) {
      setIsRunning(false)
      runRef.current = false
    }
  }, [applyStep, speed])

  const handlePause = useCallback(() => {
    pauseRef.current = true
    setIsPaused(true)
  }, [])

  const handleResume = useCallback(() => {
    pauseRef.current = false
    setIsPaused(false)
  }, [])

  const handleStop = useCallback(() => {
    runRef.current = false
    pauseRef.current = false
    setIsRunning(false)
    setIsPaused(false)
    stepRef.current = -1
    setStepIndex(-1)
    setVisibleNodeIds(new Set())
    setActiveNodeId(null)
    setReturnedNodeIds(new Set())
    setCallStack([])
    setMessage('Reset. Press Build to regenerate.')
  }, [])

  /* ── Flatten for rendering ── */
  let flatNodes = [], flatEdges = []
  if (treeRoot) {
    const f = flattenTree(treeRoot)
    flatNodes = f.nodes
    flatEdges = f.edges
  }

  /* ── SVG viewBox ── */
  const maxDepth = flatNodes.length > 0 ? Math.max(...flatNodes.map(n => n.depth)) : 0
  const svgHeight = Math.max(350, (maxDepth + 1) * 65 + 60)

  return (
    <div className="ds-page">
      <div className="viz-header">
        <div>
          <span className="section-label">Recursion</span>
          <h1 className="viz-title">Recursion Tree Visualizer</h1>
        </div>
        <div className="viz-stats">
          <div className="stat-item"><span className="stat-label">Nodes</span><span className="stat-value gradient-text">{flatNodes.length}</span></div>
          <div className="stat-item"><span className="stat-label">Step</span><span className="stat-value">{stepIndex >= 0 ? stepIndex + 1 : 0}/{allSteps.length}</span></div>
        </div>
      </div>

      <div className="algo-selector">
        {Object.entries(presets).map(([key, val]) => (
          <button key={key} className={`algo-btn ${preset === key ? 'active' : ''}`}
            onClick={() => !isRunning && setPreset(key)} disabled={isRunning}>
            {val.name}
          </button>
        ))}
      </div>

      <div className="viz-body">
        <div className="ds-canvas glass-card" style={{flex: 1}}>
          {!treeRoot ? (
            <div className="empty-state">
              <span className="empty-icon">🔄</span>
              <p>Enter a value and click Build to see the recursion tree</p>
            </div>
          ) : (
            <div className="bst-container">
              <svg className="bst-svg" viewBox={`0 0 900 ${svgHeight}`} style={{minHeight: `${svgHeight}px`}}>
                {/* Edges — only if both ends are visible */}
                {flatEdges.map((e, i) => {
                  const fromVisible = visibleNodeIds.has(e.from.id)
                  const toVisible = visibleNodeIds.has(e.to.id)
                  if (!fromVisible || !toVisible) return null
                  const fromReturned = returnedNodeIds.has(e.from.id)
                  const toReturned = returnedNodeIds.has(e.to.id)
                  return (
                    <line key={i} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
                      stroke={(fromReturned && toReturned) ? 'var(--accent-success)' : 'var(--border-default)'}
                      strokeWidth="1.5"
                      className="rec-edge-anim"
                    />
                  )
                })}
                {/* Nodes — only visible ones */}
                {flatNodes.map((n) => {
                  if (!visibleNodeIds.has(n.id)) return null
                  const isActive = n.id === activeNodeId
                  const isReturned = returnedNodeIds.has(n.id)
                  const isOnStack = !isReturned

                  let fill = 'var(--bg-elevated)'
                  let stroke = 'var(--border-default)'
                  let sw = 1.5
                  let textColor = 'var(--text-primary)'
                  let valColor = 'var(--text-tertiary)'

                  if (isActive && !isReturned) {
                    // Currently being called — highlight
                    fill = 'rgba(234,179,8,0.15)'
                    stroke = '#eab308'
                    sw = 2.5
                    textColor = '#eab308'
                  } else if (isActive && isReturned) {
                    // Just returned — green highlight
                    fill = 'rgba(34,197,94,0.15)'
                    stroke = 'var(--accent-success)'
                    sw = 2.5
                    textColor = 'var(--accent-success)'
                    valColor = 'var(--accent-success)'
                  } else if (isReturned) {
                    // Already returned — green dim
                    fill = 'rgba(34,197,94,0.06)'
                    stroke = 'rgba(34,197,94,0.5)'
                    sw = 1.5
                    textColor = 'rgba(34,197,94,0.7)'
                    valColor = 'rgba(34,197,94,0.7)'
                  } else if (isOnStack) {
                    // On the stack, waiting
                    fill = 'rgba(0,240,255,0.06)'
                    stroke = 'rgba(0,240,255,0.4)'
                    sw = 1.5
                    textColor = 'var(--text-secondary)'
                  }

                  return (
                    <g key={n.id} className={isActive ? 'rec-node-active' : 'rec-node-appear'}>
                      <circle cx={n.x} cy={n.y} r="22"
                        fill={fill} stroke={stroke} strokeWidth={sw}
                      />
                      <text x={n.x} y={n.y - 4} textAnchor="middle" fill={textColor}
                        fontSize="9" fontFamily="var(--font-mono)" fontWeight="600">
                        {n.label}
                      </text>
                      {isReturned && (
                        <text x={n.x} y={n.y + 10} textAnchor="middle" fill={valColor}
                          fontSize="8" fontFamily="var(--font-mono)">
                          ={n.val}
                        </text>
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>
          )}
          <div className="ds-message">{message}</div>
        </div>

        {/* Right Panel: Call Stack + Code */}
        <div className="code-panel glass-card">
          <div className="code-panel-header">
            <span className="code-panel-title">Call Stack</span>
            <span className="stack-count">{callStack.length} frame{callStack.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="call-stack-panel">
            {callStack.length === 0 ? (
              <div className="stack-empty-state">
                {stepIndex >= allSteps.length - 1 && allSteps.length > 0
                  ? <p>✓ Stack is empty — all calls returned</p>
                  : <p>Stack frames appear here during execution</p>
                }
              </div>
            ) : (
              [...callStack].reverse().map((frame, i) => (
                <div key={`${frame}-${i}`} className={`stack-frame ${i === 0 ? 'active' : ''}`}>
                  {frame}
                </div>
              ))
            )}
          </div>

          {/* Legend */}
          <div className="rec-legend">
            <div className="legend-item"><span className="legend-dot" style={{background: '#eab308'}}></span>Calling</div>
            <div className="legend-item"><span className="legend-dot" style={{background: 'rgba(0,240,255,0.6)'}}></span>Waiting</div>
            <div className="legend-item"><span className="legend-dot" style={{background: 'var(--accent-success)'}}></span>Returned</div>
          </div>

          <div className="code-panel-header" style={{marginTop: 'auto'}}>
            <div className="code-dots"><span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span></div>
            <span className="code-panel-title">Source Code</span>
          </div>
          <pre className="pseudocode" style={{fontSize: '0.7rem'}}>
            <code>{presets[preset].code}</code>
          </pre>
        </div>
      </div>

      {/* Controls bar */}
      <div className="controls-bar glass">
        <div className="controls-left">
          <div className="control-group">
            <label className="control-label">n =</label>
            <input type="number" value={inputN} onChange={e => setInputN(e.target.value)}
              className="ds-input ds-input-sm" min="0" max={presets[preset].maxN} disabled={isRunning}
              style={{width: '50px'}}
            />
          </div>
          <button className="btn-primary ds-btn" onClick={handleBuild} disabled={isRunning}
            style={{padding: '6px 16px', fontSize: '0.78rem'}}>
            Build
          </button>
        </div>

        <div className="controls-center">
          <div className="control-group" style={{marginRight: '12px'}}>
            <label className="control-label">Speed</label>
            <input type="range" min="1" max="100" value={speed} onChange={e => setSpeed(+e.target.value)} className="range-slider" />
            <span className="control-value speed-tag">{getSpeedLabel(speed)}</span>
          </div>

          <button className="btn-icon playback-btn" onClick={handleStepBack} disabled={stepIndex <= 0}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"/></svg>
          </button>
          {isRunning && !isPaused ? (
            <button className="btn-icon playback-btn play-btn" onClick={handlePause}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
          ) : (
            <button className="btn-icon playback-btn play-btn" onClick={isPaused ? handleResume : handlePlay} disabled={allSteps.length === 0}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
            </button>
          )}
          <button className="btn-icon playback-btn" onClick={handleStepForward} disabled={stepIndex >= allSteps.length - 1 && allSteps.length > 0}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"/></svg>
          </button>
        </div>

        <div className="controls-right">
          <button className="btn-secondary" onClick={handleStop} style={{padding: '6px 16px', fontSize: '0.78rem'}}>Reset</button>
        </div>
      </div>
    </div>
  )
}
