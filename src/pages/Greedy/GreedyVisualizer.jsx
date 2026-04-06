import { useState, useRef, useCallback } from 'react'
import GraphCanvas, { GRAPH_PRESETS } from '../../components/GraphCanvas/GraphCanvas'
import '../Sorting/Sorting.css'
import '../DataStructures/DS.css'
import './Greedy.css'

/* ═══════════════════════════════════════════
   GREEDY ALGORITHM ENGINES
   ═══════════════════════════════════════════ */

/* ── Fractional Knapsack ── */
function fractionalKnapsackSteps(items, capacity) {
  const sorted = items.map((it, i) => ({ ...it, idx: i, ratio: it.value / it.weight }))
    .sort((a, b) => b.ratio - a.ratio)
  const steps = []
  let remaining = capacity
  let totalValue = 0
  const taken = []

  steps.push({
    phase: 'sort',
    sorted: sorted.map(s => s.idx),
    taken: [],
    remaining,
    totalValue,
    desc: `Sorted items by value/weight ratio: ${sorted.map(s => `Item ${s.idx}(${s.ratio.toFixed(1)})`).join(' > ')}`,
  })

  for (const item of sorted) {
    if (remaining <= 0) break
    const fraction = Math.min(1, remaining / item.weight)
    const valueTaken = fraction * item.value
    totalValue += valueTaken
    remaining -= fraction * item.weight
    taken.push({ idx: item.idx, fraction, valueTaken })

    steps.push({
      phase: 'take',
      currentItem: item.idx,
      fraction,
      taken: [...taken],
      remaining: Math.max(0, remaining),
      totalValue,
      desc: fraction === 1
        ? `Take 100% of Item ${item.idx} (weight: ${item.weight}, value: ${item.value}) → Total: ${totalValue.toFixed(1)}`
        : `Take ${(fraction * 100).toFixed(0)}% of Item ${item.idx} (weight: ${(fraction * item.weight).toFixed(1)}, value: ${valueTaken.toFixed(1)}) → Total: ${totalValue.toFixed(1)}`,
    })
  }

  steps.push({
    phase: 'done',
    taken: [...taken],
    remaining: 0,
    totalValue,
    desc: `✓ Maximum value: ${totalValue.toFixed(1)} with capacity ${capacity}`,
  })

  return steps
}

/* ── Job Sequencing with Deadlines ── */
function jobSequencingSteps(jobs) {
  const sorted = jobs.map((j, i) => ({ ...j, idx: i }))
    .sort((a, b) => b.profit - a.profit)
  const maxDeadline = Math.max(...jobs.map(j => j.deadline))
  const slots = Array(maxDeadline).fill(null)
  const steps = []
  let totalProfit = 0

  steps.push({
    phase: 'sort',
    sorted: sorted.map(s => s.idx),
    slots: [...slots],
    totalProfit,
    desc: `Sorted jobs by profit: ${sorted.map(s => `J${s.idx}($${s.profit})`).join(' > ')}`,
  })

  for (const job of sorted) {
    let placed = false
    for (let t = job.deadline - 1; t >= 0; t--) {
      if (slots[t] === null) {
        slots[t] = job.idx
        totalProfit += job.profit
        placed = true
        steps.push({
          phase: 'place',
          currentJob: job.idx,
          slot: t,
          slots: [...slots],
          totalProfit,
          placed: true,
          desc: `✓ Job ${job.idx} (profit: $${job.profit}, deadline: ${job.deadline}) → Slot ${t + 1}`,
        })
        break
      }
    }
    if (!placed) {
      steps.push({
        phase: 'reject',
        currentJob: job.idx,
        slots: [...slots],
        totalProfit,
        placed: false,
        desc: `✗ Job ${job.idx} (profit: $${job.profit}, deadline: ${job.deadline}) — no available slot`,
      })
    }
  }

  steps.push({
    phase: 'done',
    slots: [...slots],
    totalProfit,
    desc: `✓ Maximum profit: $${totalProfit} | Jobs: ${slots.filter(s => s !== null).map(s => `J${s}`).join(', ')}`,
  })

  return steps
}

/* ── Prim's MST ── */
function primMSTSteps(nodes, edges) {
  const n = nodes.length
  if (n === 0) return []
  const adj = {}
  nodes.forEach(nd => { adj[nd.id] = [] })
  edges.forEach(e => {
    adj[e.from].push({ to: e.to, weight: e.weight })
    adj[e.to].push({ to: e.from, weight: e.weight })
  })

  const inMST = new Set()
  const mstEdges = []
  const steps = []
  let totalWeight = 0

  // Start from node 0
  inMST.add(nodes[0].id)
  steps.push({
    inMST: new Set(inMST),
    mstEdges: [],
    activeEdge: null,
    totalWeight: 0,
    desc: `Start from node ${nodes[0].label}`,
  })

  while (inMST.size < n) {
    let minEdge = null
    let minWeight = Infinity
    for (const u of inMST) {
      for (const { to: v, weight } of adj[u]) {
        if (!inMST.has(v) && weight < minWeight) {
          minWeight = weight
          minEdge = { from: u, to: v, weight }
        }
      }
    }
    if (!minEdge) break

    // Show considering
    steps.push({
      inMST: new Set(inMST),
      mstEdges: [...mstEdges],
      activeEdge: minEdge,
      considering: true,
      totalWeight,
      desc: `Minimum edge: ${nodes.find(n => n.id === minEdge.from)?.label} → ${nodes.find(n => n.id === minEdge.to)?.label} (weight: ${minEdge.weight})`,
    })

    inMST.add(minEdge.to)
    mstEdges.push(minEdge)
    totalWeight += minEdge.weight

    steps.push({
      inMST: new Set(inMST),
      mstEdges: [...mstEdges],
      activeEdge: minEdge,
      totalWeight,
      desc: `✓ Add edge ${nodes.find(n => n.id === minEdge.from)?.label}—${nodes.find(n => n.id === minEdge.to)?.label} (${minEdge.weight}). MST weight: ${totalWeight}`,
    })
  }

  steps.push({
    inMST: new Set(inMST),
    mstEdges: [...mstEdges],
    activeEdge: null,
    totalWeight,
    done: true,
    desc: `✓ MST complete! Total weight: ${totalWeight}`,
  })

  return steps
}

/* ── Kruskal's MST ── */
function kruskalMSTSteps(nodes, edges) {
  const sorted = [...edges].sort((a, b) => a.weight - b.weight)
  const parent = {}
  const rank = {}
  nodes.forEach(n => { parent[n.id] = n.id; rank[n.id] = 0 })

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x])
    return parent[x]
  }
  function union(x, y) {
    const px = find(x), py = find(y)
    if (px === py) return false
    if (rank[px] < rank[py]) parent[px] = py
    else if (rank[px] > rank[py]) parent[py] = px
    else { parent[py] = px; rank[px]++ }
    return true
  }

  const steps = []
  const mstEdges = []
  let totalWeight = 0

  steps.push({
    sortedEdges: sorted.map(e => ({ from: e.from, to: e.to, weight: e.weight })),
    mstEdges: [],
    currentEdge: null,
    totalWeight: 0,
    desc: `Sorted ${sorted.length} edges by weight`,
  })

  for (const edge of sorted) {
    const fromLabel = nodes.find(n => n.id === edge.from)?.label
    const toLabel = nodes.find(n => n.id === edge.to)?.label

    steps.push({
      mstEdges: [...mstEdges],
      currentEdge: edge,
      considering: true,
      totalWeight,
      desc: `Consider edge ${fromLabel}—${toLabel} (weight: ${edge.weight})`,
    })

    if (union(edge.from, edge.to)) {
      mstEdges.push(edge)
      totalWeight += edge.weight
      steps.push({
        mstEdges: [...mstEdges],
        currentEdge: edge,
        accepted: true,
        totalWeight,
        desc: `✓ Accept ${fromLabel}—${toLabel} (${edge.weight}). No cycle. MST weight: ${totalWeight}`,
      })
    } else {
      steps.push({
        mstEdges: [...mstEdges],
        currentEdge: edge,
        rejected: true,
        totalWeight,
        desc: `✗ Reject ${fromLabel}—${toLabel} (${edge.weight}) — would form a cycle`,
      })
    }

    if (mstEdges.length === nodes.length - 1) break
  }

  steps.push({
    mstEdges: [...mstEdges],
    currentEdge: null,
    totalWeight,
    done: true,
    desc: `✓ MST complete! Total weight: ${totalWeight} | ${mstEdges.length} edges`,
  })

  return steps
}

/* ── Dijkstra's SSSP ── */
function dijkstraSteps(nodes, edges, sourceId) {
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach(e => {
    adj[e.from].push({ to: e.to, weight: e.weight })
  })

  const dist = {}
  const prev = {}
  const visited = new Set()
  nodes.forEach(n => { dist[n.id] = Infinity; prev[n.id] = null })
  dist[sourceId] = 0

  const steps = []
  steps.push({
    dist: { ...dist },
    visited: new Set(),
    current: sourceId,
    desc: `Initialize: dist[${nodes.find(n => n.id === sourceId)?.label}] = 0, all others = ∞`,
  })

  for (let i = 0; i < nodes.length; i++) {
    // Find min dist unvisited
    let u = null, minD = Infinity
    for (const n of nodes) {
      if (!visited.has(n.id) && dist[n.id] < minD) {
        minD = dist[n.id]
        u = n.id
      }
    }
    if (u === null) break

    visited.add(u)
    const uLabel = nodes.find(n => n.id === u)?.label

    steps.push({
      dist: { ...dist },
      visited: new Set(visited),
      current: u,
      desc: `Visit node ${uLabel} (dist: ${dist[u]})`,
    })

    for (const { to: v, weight: w } of adj[u]) {
      if (!visited.has(v)) {
        const newDist = dist[u] + w
        const vLabel = nodes.find(n => n.id === v)?.label
        if (newDist < dist[v]) {
          dist[v] = newDist
          prev[v] = u
          steps.push({
            dist: { ...dist },
            visited: new Set(visited),
            current: u,
            relaxing: v,
            desc: `Relax: dist[${vLabel}] = ${dist[u]} + ${w} = ${newDist} (improved from ${dist[v] === Infinity ? '∞' : dist[v] + w + w})`,
          })
        }
      }
    }
  }

  // Build shortest path tree
  const pathEdges = []
  for (const n of nodes) {
    if (prev[n.id] !== null) {
      pathEdges.push({ from: prev[n.id], to: n.id })
    }
  }

  steps.push({
    dist: { ...dist },
    visited: new Set(visited),
    current: null,
    pathEdges,
    done: true,
    desc: `✓ Done! Shortest distances: ${nodes.map(n => `${n.label}:${dist[n.id] === Infinity ? '∞' : dist[n.id]}`).join(', ')}`,
  })

  return steps
}

/* ── Optimal Merge Pattern ── */
function optimalMergeSteps(sizes) {
  if (sizes.length <= 1) return [{ heap: [...sizes], merged: [], totalCost: 0, desc: 'Only one file, no merging needed.' }]

  const heap = [...sizes].sort((a, b) => a - b)
  const steps = []
  let totalCost = 0
  const mergeHistory = []

  steps.push({
    heap: [...heap],
    merged: [],
    totalCost: 0,
    desc: `Initial files sorted: [${heap.join(', ')}]`,
  })

  while (heap.length > 1) {
    const a = heap.shift()
    const b = heap.shift()
    const merged = a + b
    totalCost += merged

    // Insert merged back in sorted position
    let inserted = false
    for (let i = 0; i < heap.length; i++) {
      if (merged <= heap[i]) {
        heap.splice(i, 0, merged)
        inserted = true
        break
      }
    }
    if (!inserted) heap.push(merged)

    mergeHistory.push({ a, b, merged })

    steps.push({
      heap: [...heap],
      merging: { a, b, merged },
      mergeHistory: [...mergeHistory],
      totalCost,
      desc: `Merge ${a} + ${b} = ${merged} (cost: ${merged}). Total cost: ${totalCost}`,
    })
  }

  steps.push({
    heap: [...heap],
    mergeHistory: [...mergeHistory],
    totalCost,
    done: true,
    desc: `✓ Optimal merge cost: ${totalCost}`,
  })

  return steps
}

/* ═══════════════════════════════════════════
   DEFAULT DATA
   ═══════════════════════════════════════════ */
const DEFAULT_KNAPSACK_ITEMS = [
  { weight: 10, value: 60 },
  { weight: 20, value: 100 },
  { weight: 30, value: 120 },
  { weight: 15, value: 75 },
  { weight: 5, value: 30 },
]

const DEFAULT_JOBS = [
  { profit: 100, deadline: 2 },
  { profit: 19, deadline: 1 },
  { profit: 27, deadline: 2 },
  { profit: 25, deadline: 1 },
  { profit: 15, deadline: 3 },
]

const DEFAULT_MERGE_SIZES = [5, 10, 20, 30, 15]

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */
const algoList = [
  { key: 'knapsack', name: 'Fractional Knapsack' },
  { key: 'jobseq', name: 'Job Sequencing' },
  { key: 'prims', name: "Prim's MST" },
  { key: 'kruskals', name: "Kruskal's MST" },
  { key: 'dijkstra', name: "Dijkstra's SSSP" },
  { key: 'merge-pattern', name: 'Optimal Merge' },
]

export default function GreedyVisualizer() {
  const [algo, setAlgo] = useState('knapsack')
  const [steps, setSteps] = useState([])
  const [stepIdx, setStepIdx] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(40)
  const [message, setMessage] = useState('Select an algorithm and configure inputs.')
  const runRef = useRef(false)

  // Knapsack state
  const [knapsackItems, setKnapsackItems] = useState(DEFAULT_KNAPSACK_ITEMS)
  const [knapsackCap, setKnapsackCap] = useState(50)

  // Job sequencing state
  const [jobs, setJobs] = useState(DEFAULT_JOBS)

  // Graph state (for Prim, Kruskal, Dijkstra)
  const [graphNodes, setGraphNodes] = useState(GRAPH_PRESETS.mst.nodes)
  const [graphEdges, setGraphEdges] = useState(GRAPH_PRESETS.mst.edges)
  const [graphDirected, setGraphDirected] = useState(false)

  // Optimal merge state
  const [mergeSizes, setMergeSizes] = useState(DEFAULT_MERGE_SIZES)

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))
  const getDelay = () => {
    if (speed <= 20) return 1200
    if (speed <= 40) return 700
    if (speed <= 60) return 400
    if (speed <= 80) return 200
    return 80
  }

  const handleAlgoChange = (key) => {
    if (isRunning) return
    setAlgo(key)
    setSteps([])
    setStepIdx(-1)
    setMessage('Configure inputs and click Run.')

    // Load appropriate graph preset
    if (key === 'prims' || key === 'kruskals') {
      setGraphNodes(GRAPH_PRESETS.mst.nodes)
      setGraphEdges(GRAPH_PRESETS.mst.edges)
      setGraphDirected(false)
    } else if (key === 'dijkstra') {
      setGraphNodes(GRAPH_PRESETS.dijkstra.nodes)
      setGraphEdges(GRAPH_PRESETS.dijkstra.edges)
      setGraphDirected(true)
    }
  }

  const handleGraphChange = ({ nodes, edges }) => {
    setGraphNodes(nodes)
    setGraphEdges(edges)
  }

  /* ── Run algorithm ── */
  const run = async () => {
    let allSteps
    if (algo === 'knapsack') {
      allSteps = fractionalKnapsackSteps(knapsackItems, knapsackCap)
    } else if (algo === 'jobseq') {
      allSteps = jobSequencingSteps(jobs)
    } else if (algo === 'prims') {
      allSteps = primMSTSteps(graphNodes, graphEdges)
    } else if (algo === 'kruskals') {
      allSteps = kruskalMSTSteps(graphNodes, graphEdges)
    } else if (algo === 'dijkstra') {
      allSteps = dijkstraSteps(graphNodes, graphEdges, graphNodes[0]?.id ?? 0)
    } else if (algo === 'merge-pattern') {
      allSteps = optimalMergeSteps(mergeSizes)
    }

    if (!allSteps || allSteps.length === 0) return

    setSteps(allSteps)
    setIsRunning(true)
    runRef.current = true

    for (let i = 0; i < allSteps.length; i++) {
      if (!runRef.current) break
      setStepIdx(i)
      setMessage(allSteps[i].desc || '')
      await sleep(getDelay())
    }

    setIsRunning(false)
    runRef.current = false
  }

  const reset = () => {
    runRef.current = false
    setIsRunning(false)
    setSteps([])
    setStepIdx(-1)
    setMessage('Reset. Configure and run again.')
  }

  const step = steps[stepIdx] || null

  /* ── Compute graph visual states for current step ── */
  const getGraphNodeStates = () => {
    if (!step) return {}
    const states = {}
    if (algo === 'prims') {
      if (step.inMST) step.inMST.forEach(id => { states[id] = 'inMST' })
      if (step.activeEdge) {
        states[step.activeEdge.to] = step.considering ? 'active' : 'inMST'
      }
    } else if (algo === 'kruskals') {
      const mstNodes = new Set()
      step.mstEdges?.forEach(e => { mstNodes.add(e.from); mstNodes.add(e.to) })
      mstNodes.forEach(id => { states[id] = 'inMST' })
      if (step.currentEdge) {
        if (step.considering) {
          states[step.currentEdge.from] = 'active'
          states[step.currentEdge.to] = 'active'
        } else if (step.rejected) {
          states[step.currentEdge.from] = step.mstEdges?.some(e => e.from === step.currentEdge.from || e.to === step.currentEdge.from) ? 'inMST' : 'rejected'
          states[step.currentEdge.to] = step.mstEdges?.some(e => e.from === step.currentEdge.to || e.to === step.currentEdge.to) ? 'inMST' : 'rejected'
        }
      }
    } else if (algo === 'dijkstra') {
      if (step.visited) step.visited.forEach(id => { states[id] = 'visited' })
      if (step.current !== null && step.current !== undefined) states[step.current] = 'active'
      if (step.relaxing !== null && step.relaxing !== undefined) states[step.relaxing] = 'visiting'
      states[graphNodes[0]?.id] = 'source'
      if (step.done) {
        step.pathEdges?.forEach(e => {
          states[e.to] = 'inPath'
        })
        states[graphNodes[0]?.id] = 'source'
      }
    }
    return states
  }

  const getGraphEdgeStates = () => {
    if (!step) return {}
    const states = {}
    const getKey = (f, t) => graphDirected ? `${f}->${t}` : `${Math.min(f, t)}-${Math.max(f, t)}`
    if (algo === 'prims' || algo === 'kruskals') {
      step.mstEdges?.forEach(e => {
        states[getKey(e.from, e.to)] = 'inMST'
      })
      if (step.currentEdge) {
        const k = getKey(step.currentEdge.from, step.currentEdge.to)
        if (step.considering) states[k] = 'considering'
        else if (step.rejected) states[k] = 'rejected'
        else if (step.accepted) states[k] = 'inMST'
      }
      if (step.activeEdge && step.considering) {
        states[getKey(step.activeEdge.from, step.activeEdge.to)] = 'considering'
      }
    } else if (algo === 'dijkstra') {
      if (step.done) {
        step.pathEdges?.forEach(e => { states[getKey(e.from, e.to)] = 'inPath' })
      }
    }
    return states
  }

  const getDistLabels = () => {
    if (algo !== 'dijkstra' || !step?.dist) return {}
    const labels = {}
    graphNodes.forEach(n => {
      const d = step.dist[n.id]
      labels[n.id] = d === Infinity ? '∞' : String(d)
    })
    return labels
  }

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  const isGraphAlgo = ['prims', 'kruskals', 'dijkstra'].includes(algo)

  return (
    <div className="ds-page">
      <div className="viz-header">
        <div>
          <span className="section-label">Greedy Algorithms</span>
          <h1 className="viz-title">{algoList.find(a => a.key === algo)?.name}</h1>
        </div>
        <div className="viz-stats">
          <div className="stat-item">
            <span className="stat-label">Step</span>
            <span className="stat-value gradient-text">{stepIdx >= 0 ? stepIdx + 1 : 0}/{steps.length || '—'}</span>
          </div>
        </div>
      </div>

      <div className="algo-selector">
        {algoList.map(a => (
          <button key={a.key} className={`algo-btn ${algo === a.key ? 'active' : ''}`}
            onClick={() => handleAlgoChange(a.key)} disabled={isRunning}>
            {a.name}
          </button>
        ))}
      </div>

      <div className="viz-body">
        <div className="ds-canvas glass-card" style={{ flex: 1 }}>
          {/* ── Knapsack Visualization ── */}
          {algo === 'knapsack' && (
            <div className="greedy-viz-area">
              <div className="knapsack-container">
                <div className="knapsack-items">
                  <h3 className="greedy-section-title">Items (sorted by value/weight)</h3>
                  <div className="knapsack-item-list">
                    {knapsackItems.map((item, i) => {
                      const takenEntry = step?.taken?.find(t => t.idx === i)
                      const isCurrent = step?.currentItem === i
                      return (
                        <div key={i} className={`knapsack-item ${takenEntry ? 'taken' : ''} ${isCurrent ? 'current' : ''}`}>
                          <span className="ki-label">Item {i}</span>
                          <span className="ki-detail">W: {item.weight} | V: {item.value}</span>
                          <span className="ki-ratio">Ratio: {(item.value / item.weight).toFixed(1)}</span>
                          {takenEntry && (
                            <div className="ki-fraction-bar">
                              <div className="ki-fraction-fill" style={{ width: `${takenEntry.fraction * 100}%` }}></div>
                              <span className="ki-fraction-text">{(takenEntry.fraction * 100).toFixed(0)}%</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="knapsack-bag">
                  <h3 className="greedy-section-title">Knapsack (Cap: {knapsackCap})</h3>
                  <div className="knapsack-bag-visual">
                    <div className="bag-fill" style={{ height: `${step ? ((knapsackCap - (step.remaining || 0)) / knapsackCap * 100) : 0}%` }}></div>
                    <span className="bag-label">
                      {step ? `${(knapsackCap - (step.remaining || 0)).toFixed(1)} / ${knapsackCap}` : `0 / ${knapsackCap}`}
                    </span>
                  </div>
                  {step && <div className="bag-value">Total Value: <strong>{step.totalValue?.toFixed(1) || 0}</strong></div>}
                </div>
              </div>
            </div>
          )}

          {/* ── Job Sequencing Visualization ── */}
          {algo === 'jobseq' && (
            <div className="greedy-viz-area">
              <div className="job-container">
                <div className="job-list">
                  <h3 className="greedy-section-title">Jobs (sorted by profit)</h3>
                  {jobs.map((job, i) => {
                    const isPlaced = step?.slots?.includes(i)
                    const isCurrent = step?.currentJob === i
                    const wasRejected = step?.phase === 'reject' && step?.currentJob === i
                    return (
                      <div key={i} className={`job-card ${isPlaced ? 'placed' : ''} ${isCurrent ? 'current' : ''} ${wasRejected ? 'rejected' : ''}`}>
                        <span className="job-name">J{i}</span>
                        <span className="job-profit">${job.profit}</span>
                        <span className="job-deadline">d={job.deadline}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="job-timeline">
                  <h3 className="greedy-section-title">Schedule Timeline</h3>
                  <div className="timeline-slots">
                    {step?.slots?.map((slot, i) => (
                      <div key={i} className={`timeline-slot ${slot !== null ? 'filled' : ''}`}>
                        <span className="slot-time">t={i + 1}</span>
                        <span className="slot-job">{slot !== null ? `J${slot}` : '—'}</span>
                      </div>
                    )) || (
                      <div className="empty-state" style={{ padding: '40px' }}>
                        <p>Click Run to see job scheduling</p>
                      </div>
                    )}
                  </div>
                  {step && <div className="job-profit-total">Total Profit: <strong>${step.totalProfit}</strong></div>}
                </div>
              </div>
            </div>
          )}

          {/* ── Graph Algorithms (Prim, Kruskal, Dijkstra) ── */}
          {isGraphAlgo && (
            <div className="greedy-viz-area">
              <GraphCanvas
                nodes={graphNodes}
                edges={graphEdges}
                directed={graphDirected}
                onGraphChange={handleGraphChange}
                nodeStates={getGraphNodeStates()}
                edgeStates={getGraphEdgeStates()}
                disabled={isRunning}
                showWeights={true}
              />
              {algo === 'dijkstra' && step?.dist && (
                <div className="dijkstra-dist-table">
                  <h3 className="greedy-section-title">Distance Table</h3>
                  <div className="dist-cells">
                    {graphNodes.map(n => (
                      <div key={n.id} className={`dist-cell ${step.visited?.has(n.id) ? 'visited' : ''} ${step.current === n.id ? 'current' : ''}`}>
                        <span className="dist-node">{n.label}</span>
                        <span className="dist-val">{step.dist[n.id] === Infinity ? '∞' : step.dist[n.id]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(algo === 'prims' || algo === 'kruskals') && step && (
                <div className="mst-info">
                  <span>MST Weight: <strong className="gradient-text">{step.totalWeight}</strong></span>
                  <span>Edges: <strong>{step.mstEdges?.length || 0}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* ── Optimal Merge Pattern ── */}
          {algo === 'merge-pattern' && (
            <div className="greedy-viz-area">
              <div className="merge-pattern-container">
                <h3 className="greedy-section-title">File Queue (Min-Heap)</h3>
                <div className="merge-heap-visual">
                  {step?.heap?.map((size, i) => (
                    <div key={i} className={`merge-file ${i < 2 && step.merging ? 'merging' : ''}`}>
                      {size}
                    </div>
                  )) || mergeSizes.map((size, i) => (
                    <div key={i} className="merge-file">{size}</div>
                  ))}
                </div>
                {step?.merging && (
                  <div className="merge-operation">
                    <span>{step.merging.a}</span>
                    <span className="merge-op">+</span>
                    <span>{step.merging.b}</span>
                    <span className="merge-op">=</span>
                    <span className="merge-result">{step.merging.merged}</span>
                  </div>
                )}
                {step && (
                  <div className="merge-cost">
                    Total Cost: <strong className="gradient-text">{step.totalCost}</strong>
                  </div>
                )}
                {step?.mergeHistory && step.mergeHistory.length > 0 && (
                  <div className="merge-history">
                    <h3 className="greedy-section-title">Merge History</h3>
                    {step.mergeHistory.map((m, i) => (
                      <div key={i} className="merge-hist-item">
                        Step {i + 1}: {m.a} + {m.b} = {m.merged}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="ds-message">{message}</div>
        </div>

        {/* Right Panel: Algorithm Info */}
        <div className="code-panel glass-card">
          <div className="code-panel-header">
            <div className="code-dots"><span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span></div>
            <span className="code-panel-title">Algorithm</span>
          </div>
          <div className="greedy-info-panel">
            {algo === 'knapsack' && (
              <>
                <p className="greedy-algo-desc">Take items with highest value/weight ratio first. Fractions allowed.</p>
                <div className="greedy-complexity">
                  <span>Time: <strong>O(n log n)</strong></span>
                  <span>Space: <strong>O(n)</strong></span>
                </div>
                <div className="greedy-input-section">
                  <label>Capacity:</label>
                  <input type="number" value={knapsackCap} onChange={e => setKnapsackCap(+e.target.value)}
                    className="ds-input ds-input-sm" disabled={isRunning} style={{ width: '60px' }} />
                </div>
              </>
            )}
            {algo === 'jobseq' && (
              <>
                <p className="greedy-algo-desc">Schedule jobs to maximize profit. Each job takes 1 unit time.</p>
                <div className="greedy-complexity">
                  <span>Time: <strong>O(n²)</strong></span>
                  <span>Space: <strong>O(n)</strong></span>
                </div>
              </>
            )}
            {algo === 'prims' && (
              <>
                <p className="greedy-algo-desc">Grow MST from a source by always adding the cheapest edge to an unvisited node.</p>
                <div className="greedy-complexity">
                  <span>Time: <strong>O(E log V)</strong></span>
                  <span>Space: <strong>O(V)</strong></span>
                </div>
              </>
            )}
            {algo === 'kruskals' && (
              <>
                <p className="greedy-algo-desc">Sort all edges by weight. Add each edge if it doesn't form a cycle (Union-Find).</p>
                <div className="greedy-complexity">
                  <span>Time: <strong>O(E log E)</strong></span>
                  <span>Space: <strong>O(V)</strong></span>
                </div>
              </>
            )}
            {algo === 'dijkstra' && (
              <>
                <p className="greedy-algo-desc">Find shortest paths from source to all nodes. Relaxes edges greedily.</p>
                <div className="greedy-complexity">
                  <span>Time: <strong>O(E log V)</strong></span>
                  <span>Space: <strong>O(V)</strong></span>
                </div>
              </>
            )}
            {algo === 'merge-pattern' && (
              <>
                <p className="greedy-algo-desc">Merge two smallest files repeatedly (Huffman-like). Minimizes total merge cost.</p>
                <div className="greedy-complexity">
                  <span>Time: <strong>O(n log n)</strong></span>
                  <span>Space: <strong>O(n)</strong></span>
                </div>
                <div className="greedy-input-section">
                  <label>File sizes (comma-separated):</label>
                  <input type="text" value={mergeSizes.join(',')}
                    onChange={e => setMergeSizes(e.target.value.split(',').map(Number).filter(n => !isNaN(n) && n > 0))}
                    className="ds-input" disabled={isRunning} style={{ width: '100%' }} />
                </div>
              </>
            )}

            {isGraphAlgo && (
              <div className="greedy-input-section">
                <label>Preset Graph:</label>
                <select className="ds-input" disabled={isRunning}
                  onChange={e => {
                    const preset = GRAPH_PRESETS[e.target.value]
                    if (preset) {
                      setGraphNodes(preset.nodes)
                      setGraphEdges(preset.edges)
                      setGraphDirected(preset.directed)
                    }
                  }}
                >
                  {algo === 'dijkstra' ? (
                    <>
                      <option value="dijkstra">Dijkstra Example</option>
                      <option value="directed">Directed (6 nodes)</option>
                    </>
                  ) : (
                    <>
                      <option value="mst">MST Example (7 nodes)</option>
                      <option value="simple">Simple (5 nodes)</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="greedy-legend">
            {algo === 'knapsack' && (
              <>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#eab308' }}></span>Current</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent-success)' }}></span>Taken</div>
              </>
            )}
            {algo === 'jobseq' && (
              <>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#eab308' }}></span>Current</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent-success)' }}></span>Placed</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent-danger)' }}></span>Rejected</div>
              </>
            )}
            {(algo === 'prims' || algo === 'kruskals') && (
              <>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#eab308' }}></span>Considering</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent-success)' }}></span>In MST</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent-danger)' }}></span>Rejected</div>
              </>
            )}
            {algo === 'dijkstra' && (
              <>
                <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent-primary)' }}></span>Source</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#eab308' }}></span>Current</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent-success)' }}></span>Visited</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-bar glass">
        <div className="controls-left">
          <div className="control-group">
            <label className="control-label">Speed</label>
            <input type="range" min="1" max="100" value={speed}
              onChange={e => setSpeed(+e.target.value)} className="range-slider" />
          </div>
        </div>
        <div className="controls-center">
          <button className="btn-primary ds-btn" onClick={run} disabled={isRunning}>
            {isRunning ? 'Running...' : '▶ Run'}
          </button>
          <button className="btn-secondary ds-btn" onClick={reset} disabled={false}>Reset</button>
        </div>
        <div className="controls-right" />
      </div>
    </div>
  )
}
