import { useState, useRef, useEffect, useCallback } from 'react'
import { algorithms, pseudocode } from '../../engines/sorting/sortingEngines'
import './Sorting.css'

function generateArray(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5)
}

function getSpeedLabel(val) {
  if (val <= 10) return 'Slowest'
  if (val <= 30) return 'Slow'
  if (val <= 60) return 'Normal'
  if (val <= 85) return 'Fast'
  return 'Fastest'
}
function getDelayMs(v) { return Math.max(5, 500 - v * 5) }

/* ── Heap Tree Layout ── */
function getHeapTreeLayout(arr, highlightIndices, swapIndices, sortedIndices) {
  const nodes = [], edges = []
  const len = arr.length
  const treeWidth = 800, levelHeight = 65
  const getDepth = i => Math.floor(Math.log2(i + 1))
  const getX = (i, d) => {
    const count = Math.pow(2, d)
    const spacing = treeWidth / (count + 1)
    return spacing * (i - (Math.pow(2, d) - 1) + 1)
  }
  for (let i = 0; i < len; i++) {
    const d = getDepth(i)
    const x = getX(i, d), y = 35 + d * levelHeight
    let state = 'normal'
    if (sortedIndices.includes(i)) state = 'sorted'
    else if (swapIndices.includes(i)) state = 'swapping'
    else if (highlightIndices.includes(i)) state = 'comparing'
    nodes.push({ val: arr[i], x, y, index: i, state })
    const left = 2 * i + 1, right = 2 * i + 2
    for (const c of [left, right]) {
      if (c < len) {
        const cd = getDepth(c)
        edges.push({ from: { x, y }, to: { x: getX(c, cd), y: 35 + cd * levelHeight }, fromSorted: sortedIndices.includes(i), toSorted: sortedIndices.includes(c) })
      }
    }
  }
  return { nodes, edges }
}

/* ── Merge Sort Tree Component ── */
function MergeSortTree({ tree, activeNode, action, array }) {
  if (!tree || tree.length === 0) {
    // Before running, show initial array as root of tree
    return (
      <div className="merge-tree-view">
        <div className="merge-tree-level" style={{ justifyContent: 'center' }}>
          <div className="merge-node idle">
            {array.map((v, i) => (
              <div key={i} className="merge-cell">{v}</div>
            ))}
          </div>
        </div>
        <div className="merge-tree-hint">Press Play to see divide & conquer step by step</div>
      </div>
    )
  }

  // Only show visible nodes — tree builds progressively
  const visibleNodes = tree.filter(n => n.visible)
  const maxDepth = visibleNodes.length > 0 ? Math.max(...visibleNodes.map(n => n.depth)) : 0
  const levels = []
  for (let d = 0; d <= maxDepth; d++) {
    const nodesAtDepth = visibleNodes.filter(n => n.depth === d)
    if (nodesAtDepth.length > 0) levels.push({ depth: d, nodes: nodesAtDepth })
  }

  const getNodeClass = (node) => {
    let cls = 'merge-node'
    if (node.id === activeNode) cls += ' active'
    if (node.state === 'splitting') cls += ' splitting'
    else if (node.state === 'active') cls += ' entering'
    else if (node.state === 'merging') cls += ' merging'
    else if (node.state === 'merged') cls += ' merged'
    else if (node.state === 'waiting') cls += ' waiting'
    else cls += ' idle'
    return cls
  }

  return (
    <div className="merge-tree-view">
      {levels.map(({ depth, nodes: levelNodes }) => (
        <div key={depth} className="merge-tree-level">
          {levelNodes.map((node) => (
            <div key={node.id} className="merge-node-wrapper">
              {/* Connector line from parent */}
              {depth > 0 && (
                <div className="merge-connector">
                  <svg width="100%" height="20" className="merge-connector-svg">
                    <line x1="50%" y1="0" x2="50%" y2="20"
                      stroke={node.state === 'merged' ? 'var(--accent-success)' : node.state === 'merging' ? 'var(--accent-primary)' : 'var(--border-default)'}
                      strokeWidth="1.5" strokeDasharray="4,3" />
                  </svg>
                </div>
              )}
              <div className={getNodeClass(node)}>
                {node.values.map((v, i) => (
                  <div key={i} className="merge-cell">{v}</div>
                ))}
              </div>
              <div className="merge-node-indices">
                {node.values.map((_, i) => (
                  <span key={i} className="merge-idx">{node.start + i}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function Sorting() {
  const [arraySize, setArraySize] = useState(15)
  const [speed, setSpeed] = useState(50)
  const [algo, setAlgo] = useState('bubble')
  const [array, setArray] = useState(() => generateArray(15))
  const [originalArray, setOriginalArray] = useState([])
  const [comparing, setComparing] = useState([])
  const [swapping, setSwapping] = useState([])
  const [sorted, setSorted] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentLine, setCurrentLine] = useState(-1)
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 })
  const [steps, setSteps] = useState([])
  const [stepIndex, setStepIndex] = useState(-1)
  const [meta, setMeta] = useState(null)
  const [customInput, setCustomInput] = useState('')

  const runningRef = useRef(false)
  const pausedRef = useRef(false)
  const speedRef = useRef(speed)
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { setOriginalArray([...array]) }, [])

  const clearVizState = () => {
    runningRef.current = false; setIsRunning(false); setIsPaused(false); pausedRef.current = false
    setComparing([]); setSwapping([]); setSorted([]); setCurrentLine(-1)
    setStats({ comparisons: 0, swaps: 0 }); setSteps([]); setStepIndex(-1); setMeta(null)
  }

  const handleGenerateRandom = () => {
    clearVizState(); const a = generateArray(arraySize); setArray(a); setOriginalArray([...a]); setCustomInput('')
  }
  const handleApplyCustom = () => {
    const nums = customInput.split(/[,\s]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 999)
    if (nums.length < 2) return
    clearVizState(); setArray(nums); setOriginalArray([...nums]); setArraySize(nums.length)
  }
  const handleSizeChange = (s) => {
    setArraySize(s); clearVizState(); const a = generateArray(s); setArray(a); setOriginalArray([...a]); setCustomInput('')
  }
  const handleAlgoChange = (k) => {
    if (isRunning) return; clearVizState(); setAlgo(k); setArray([...originalArray])
  }

  const generateSteps = useCallback(() => {
    const gen = algorithms[algo].fn([...array]); const all = []; let r = gen.next()
    while (!r.done) { all.push(r.value); r = gen.next() }
    return all
  }, [algo, array])

  const applyStep = (step) => {
    setArray(step.array); setComparing(step.comparing); setSwapping(step.swapping)
    setSorted(step.sorted); setCurrentLine(step.line); setMeta(step.meta || null)
  }

  const runVisualization = useCallback(async () => {
    const all = generateSteps(); setSteps(all); setIsRunning(true); runningRef.current = true
    let comps = 0, swps = 0
    for (let i = 0; i < all.length; i++) {
      while (pausedRef.current) { await new Promise(r => setTimeout(r, 50)); if (!runningRef.current) return }
      if (!runningRef.current) return
      applyStep(all[i]); setStepIndex(i)
      if (all[i].comparing.length > 0) comps++
      if (all[i].swapping.length > 0) swps++
      setStats({ comparisons: comps, swaps: swps })
      await new Promise(r => setTimeout(r, getDelayMs(speedRef.current)))
    }
    setIsRunning(false); runningRef.current = false
  }, [generateSteps])

  const handlePlay = () => { if (isRunning && isPaused) { setIsPaused(false); pausedRef.current = false } else if (!isRunning) { runVisualization() } }
  const handlePause = () => { setIsPaused(true); pausedRef.current = true }
  const handleStop = () => { runningRef.current = false; setIsRunning(false); setIsPaused(false); pausedRef.current = false; setArray([...originalArray]); clearVizState() }

  const handleStepForward = () => {
    if (steps.length === 0) {
      const all = generateSteps(); setSteps(all)
      if (all.length > 0) { applyStep(all[0]); setStepIndex(0); setStats({ comparisons: all[0].comparing.length > 0 ? 1 : 0, swaps: all[0].swapping.length > 0 ? 1 : 0 }) }
      return
    }
    const next = stepIndex + 1
    if (next < steps.length) {
      applyStep(steps[next]); setStepIndex(next)
      setStats(p => ({ comparisons: p.comparisons + (steps[next].comparing.length > 0 ? 1 : 0), swaps: p.swaps + (steps[next].swapping.length > 0 ? 1 : 0) }))
    }
  }
  const handleStepBack = () => {
    if (steps.length === 0 || stepIndex <= 0) return
    applyStep(steps[stepIndex - 1]); setStepIndex(stepIndex - 1)
  }

  const maxVal = Math.max(...array, 1)
  const showNumbers = array.length <= 30
  const isHeap = algo === 'heap'
  const isMerge = algo === 'merge'

  /* ── Per-bar color/state logic ── */
  const getBarState = (i) => {
    if (sorted.includes(i)) return 'sorted'
    if (swapping.includes(i)) return 'swapping'
    if (comparing.includes(i)) return 'comparing'

    // Algo-specific states
    if (meta) {
      // Quick Sort: show pivot distinctly, partition regions
      if (meta.type === 'quick') {
        if (meta.pivot === i) return 'pivot'
        if (meta.pivotPlaced === i) return 'pivot-placed'
        if (meta.i !== undefined && meta.j !== undefined) {
          if (i >= meta.partitionRange?.[0] && i < meta.i) return 'less-partition' // < pivot region
        }
      }
      // Selection: show current minimum distinctly
      if (meta.type === 'selection' && meta.currentMin === i) return 'min-tracked'
      // Insertion: show the key being inserted
      if (meta.type === 'insertion' && meta.keyIndex === i) return 'key'
      // Merge: (tree view handles this, no bar state needed)
      // Bubble: sorted boundary indicator
      if (meta.type === 'bubble' && meta.unsortedEnd !== undefined && i > meta.unsortedEnd) return 'sorted'
    }
    return 'default'
  }

  const stateColors = {
    'sorted': { bg: 'var(--accent-success)', opacity: 1 },
    'swapping': { bg: 'var(--accent-danger)', opacity: 1 },
    'comparing': { bg: 'var(--accent-warm)', opacity: 1 },
    'pivot': { bg: '#a855f7', opacity: 1 },           // purple for pivot
    'pivot-placed': { bg: '#a855f7', opacity: 1 },
    'less-partition': { bg: 'rgba(0,212,170,0.7)', opacity: 0.85 },  // teal for < pivot
    'min-tracked': { bg: '#f59e0b', opacity: 1 },      // gold for tracked min
    'key': { bg: '#f59e0b', opacity: 1 },               // gold for insertion key
    'merge-region': { bg: 'rgba(0,240,255,0.5)', opacity: 0.7 },
    'default': { bg: 'var(--accent-primary)', opacity: 0.35 },
  }

  const getBarColor = (i) => (stateColors[getBarState(i)] || stateColors.default).bg
  const getBarOpacity = (i) => (stateColors[getBarState(i)] || stateColors.default).opacity

  /* ── Step description ── */
  const getStepDesc = () => {
    if (stepIndex < 0) return 'Press Play or Step Forward to begin.'
    if (sorted.length === array.length) return '✓ Array is fully sorted!'
    if (meta?.type === 'quick' && meta.pivot !== undefined)
      return `Pivot = ${meta.pivotValue} (idx ${meta.pivot})  |  Comparing arr[${comparing[0] ?? '—'}] with pivot`
    if (meta?.type === 'selection' && comparing.length === 2)
      return `Finding min: comparing arr[${comparing[0]}]=${array[comparing[0]]} vs arr[${comparing[1]}]=${array[comparing[1]]}  |  Current min at idx ${meta.currentMin}`
    if (meta?.type === 'insertion' && meta.keyValue !== undefined)
      return `Inserting key = ${meta.keyValue} into sorted portion`
    if (meta?.type === 'merge' && meta.desc)
      return meta.desc
    if (meta?.type === 'heap' && meta.heapSize !== undefined)
      return `Heap size = ${meta.heapSize}  |  ${swapping.length ? 'Swapping' : 'Comparing'} nodes`
    if (comparing.length === 2) return `Comparing arr[${comparing[0]}]=${array[comparing[0]]} vs arr[${comparing[1]}]=${array[comparing[1]]}`
    if (swapping.length === 2) return `Swapping arr[${swapping[0]}] ↔ arr[${swapping[1]}]`
    return `Step ${stepIndex + 1}...`
  }

  /* ── Algo-specific legend ── */
  const getLegend = () => {
    const base = [
      { label: 'Unsorted', color: 'var(--accent-primary)', opacity: 0.35 },
      { label: 'Comparing', color: 'var(--accent-warm)', opacity: 1 },
      { label: 'Swapping', color: 'var(--accent-danger)', opacity: 1 },
      { label: 'Sorted', color: 'var(--accent-success)', opacity: 1 },
    ]
    if (algo === 'quick') {
      base.push({ label: 'Pivot', color: '#a855f7', opacity: 1 })
      base.push({ label: '< Pivot', color: 'rgba(0,212,170,0.7)', opacity: 1 })
    }
    if (algo === 'selection') base.push({ label: 'Current Min', color: '#f59e0b', opacity: 1 })
    if (algo === 'insertion') base.push({ label: 'Key', color: '#f59e0b', opacity: 1 })
    if (algo === 'merge') {
      return [
        { label: 'Idle', color: 'var(--border-subtle)', opacity: 0.6 },
        { label: 'Active', color: '#eab308', opacity: 1 },
        { label: 'Splitting', color: 'var(--accent-warm)', opacity: 1 },
        { label: 'Merging', color: 'var(--accent-primary)', opacity: 1 },
        { label: 'Merged', color: 'var(--accent-success)', opacity: 1 },
      ]
    }
    return base
  }

  const codeLines = (pseudocode[algo] || '').split('\n')
  const heapTree = isHeap ? getHeapTreeLayout(array, comparing, swapping, sorted) : null

  return (
    <div className="sorting-page">
      {/* Header */}
      <div className="viz-header">
        <div>
          <span className="section-label">Sorting Algorithms</span>
          <h1 className="viz-title">{algorithms[algo].name}</h1>
        </div>
        <div className="viz-stats">
          <div className="stat-item"><span className="stat-label">Time</span><span className="stat-value gradient-text">{algorithms[algo].complexity}</span></div>
          <div className="stat-item"><span className="stat-label">Space</span><span className="stat-value">{algorithms[algo].space}</span></div>
          <div className="stat-item"><span className="stat-label">Comparisons</span><span className="stat-value">{stats.comparisons}</span></div>
          <div className="stat-item"><span className="stat-label">Swaps</span><span className="stat-value">{stats.swaps}</span></div>
        </div>
      </div>

      {/* Algo selector */}
      <div className="algo-selector">
        {Object.entries(algorithms).map(([k, v]) => (
          <button key={k} className={`algo-btn ${algo === k ? 'active' : ''}`} onClick={() => handleAlgoChange(k)} disabled={isRunning}>{v.name}</button>
        ))}
      </div>

      {/* Input controls */}
      <div className="input-controls glass">
        <div className="input-left">
          <div className="control-group">
            <label className="control-label">Size</label>
            <input type="range" min="5" max={isHeap ? 31 : (isMerge ? 16 : 50)} value={arraySize} onChange={e => handleSizeChange(+e.target.value)} disabled={isRunning} className="range-slider" />
            <span className="control-value">{arraySize}</span>
          </div>
          <button className="btn-secondary input-btn" onClick={handleGenerateRandom} disabled={isRunning}>🔀 Random</button>
        </div>
        <div className="input-right">
          <div className="custom-input-group">
            <input type="text" placeholder="Custom: 45, 12, 78, 3, 90..." value={customInput} onChange={e => setCustomInput(e.target.value)} className="custom-input" disabled={isRunning} onKeyDown={e => e.key === 'Enter' && handleApplyCustom()} />
            <button className="btn-primary input-btn" onClick={handleApplyCustom} disabled={isRunning}>Apply</button>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="viz-body">
        <div className="viz-canvas-area glass-card">
          {/* Dynamic legend */}
          <div className="viz-legend">
            {getLegend().map((l, i) => (
              <div key={i} className="legend-item">
                <span className="legend-dot" style={{ background: l.color, opacity: l.opacity }}></span>
                {l.label}
              </div>
            ))}
          </div>

          {isHeap ? (
            /* ── Heap Sort: Array + Tree ── */
            <div className="heap-dual-view">
              <div className="heap-array-row">
                {array.map((val, i) => {
                  let cls = 'heap-cell'
                  if (sorted.includes(i)) cls += ' sorted'
                  else if (swapping.includes(i)) cls += ' swapping'
                  else if (comparing.includes(i)) cls += ' comparing'
                  return (
                    <div key={i} className="heap-cell-wrapper">
                      <div className={cls}>{val}</div>
                      <span className="heap-cell-idx">{i}</span>
                    </div>
                  )
                })}
              </div>
              <div className="heap-tree-container">
                <svg viewBox="0 0 800 340" className="heap-tree-svg">
                  {heapTree.edges.map((e, i) => (
                    <line key={i} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
                      stroke={(e.fromSorted && e.toSorted) ? 'rgba(34,197,94,0.2)' : 'var(--border-default)'}
                      strokeWidth="1.5" strokeDasharray={(e.fromSorted && e.toSorted) ? '4,4' : 'none'} />
                  ))}
                  {heapTree.nodes.map((n, i) => {
                    let fill = 'var(--bg-elevated)', stroke = 'var(--border-default)', sw = 1.5, tc = 'var(--text-primary)'
                    if (n.state === 'sorted') { fill = 'rgba(34,197,94,0.08)'; stroke = 'rgba(34,197,94,0.4)'; sw = 1.5; tc = 'rgba(34,197,94,0.5)' }
                    else if (n.state === 'swapping') { fill = 'rgba(239,68,68,0.15)'; stroke = 'var(--accent-danger)'; sw = 2.5; tc = 'var(--accent-danger)' }
                    else if (n.state === 'comparing') { fill = 'rgba(245,158,11,0.15)'; stroke = 'var(--accent-warm)'; sw = 2.5; tc = 'var(--accent-warm)' }
                    return (
                      <g key={i}>
                        <circle cx={n.x} cy={n.y} r="20" fill={fill} stroke={stroke} strokeWidth={sw} />
                        <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fill={tc} fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">{n.val}</text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          ) : isMerge ? (
            /* ── Merge Sort: Divide & Conquer Tree ── */
            <MergeSortTree tree={meta?.tree} activeNode={meta?.activeNode} action={meta?.action} array={array} />
          ) : (
            /* ── Bar chart for other algos ── */
            <div className="bars-container">
              {array.map((val, i) => {
                const state = getBarState(i)
                const isPivot = state === 'pivot' || state === 'pivot-placed'
                return (
                  <div key={i} className="bar-wrapper" style={{ width: `${100 / array.length}%` }}>
                    {showNumbers && (
                      <span className={`bar-value ${state}`}>{val}</span>
                    )}
                    <div className={`bar ${state}`} style={{
                      height: `${(val / maxVal) * 100}%`,
                      backgroundColor: getBarColor(i),
                      opacity: getBarOpacity(i),
                      boxShadow: ['comparing','swapping','pivot','key','min-tracked'].includes(state) ? `0 0 12px ${getBarColor(i)}` : 'none',
                      transition: `height ${Math.max(30, getDelayMs(speed) * 0.8)}ms ease, background-color 150ms ease`,
                      borderTop: isPivot ? '3px solid #a855f7' : 'none',
                    }} />
                    {showNumbers && <span className="bar-index">{i}</span>}
                    {meta?.type === 'bubble' && meta.unsortedEnd === i && (
                      <div className="boundary-marker">▲ boundary</div>
                    )}
                    {meta?.type === 'selection' && meta.sortedBoundary === i && sorted.length > 0 && (
                      <div className="boundary-marker sel">▲ sorted end</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Step description */}
          <div className="step-description">{getStepDesc()}</div>
        </div>

        {/* Pseudocode panel */}
        <div className="code-panel glass-card">
          <div className="code-panel-header">
            <div className="code-dots"><span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span></div>
            <span className="code-panel-title">Pseudocode</span>
          </div>
          <pre className="pseudocode">
            {codeLines.map((line, i) => (
              <div key={i} className={`code-line ${currentLine === i ? 'active' : ''}`}>
                <span className="line-num">{i + 1}</span><span className="line-text">{line}</span>
              </div>
            ))}
          </pre>
          <div className="array-state">
            <span className="array-state-label">Current Array</span>
            <div className="array-state-values">[{array.slice(0, 12).join(', ')}{array.length > 12 ? ', ...' : ''}]</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-bar glass">
        <div className="controls-left">
          <div className="control-group">
            <label className="control-label">Speed</label>
            <input type="range" min="1" max="100" value={speed} onChange={e => setSpeed(+e.target.value)} className="range-slider" />
            <span className="control-value speed-tag">{getSpeedLabel(speed)}</span>
          </div>
          <span className="delay-indicator">{getDelayMs(speed)}ms</span>
        </div>
        <div className="controls-center">
          <button className="btn-icon playback-btn" onClick={handleStepBack} disabled={stepIndex <= 0}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"/></svg>
          </button>
          {isRunning && !isPaused ? (
            <button className="btn-icon playback-btn play-btn" onClick={handlePause}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
          ) : (
            <button className="btn-icon playback-btn play-btn" onClick={handlePlay}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
            </button>
          )}
          <button className="btn-icon playback-btn" onClick={handleStepForward} disabled={stepIndex >= steps.length - 1 && steps.length > 0}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"/></svg>
          </button>
        </div>
        <div className="controls-right">
          <span className="step-counter">Step {stepIndex >= 0 ? stepIndex + 1 : 0}/{steps.length || '—'}</span>
          <button className="btn-secondary" onClick={handleStop} style={{padding: '6px 16px', fontSize: '0.78rem'}}>Reset</button>
        </div>
      </div>
    </div>
  )
}
