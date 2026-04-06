import React, { useState, useRef } from 'react'
import FullscreenMode from '../../components/FullscreenMode/FullscreenMode'
import { useAudioExplain } from '../../hooks/useAudioExplain'
import '../Sorting/Sorting.css'
import '../DataStructures/DS.css'
import './DP.css'

/* ═══════════════════════════════════════════
   DP PROBLEM ENGINES
   ═══════════════════════════════════════════ */

/* ── 1D: Fibonacci ── */
const fibonacci = {
  name: 'Fibonacci',
  type: '1d',
  desc: 'Compute Fibonacci numbers using bottom-up DP.',
  code: 'dp[i] = dp[i-1] + dp[i-2]',
  compute: (n) => {
    const dp = Array(n + 1).fill(0)
    dp[0] = 0; if (n > 0) dp[1] = 1
    const steps = [{ table: [...dp], fill: 0, deps: [] }, { table: [...dp], fill: 1, deps: [] }]
    for (let i = 2; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2]
      steps.push({ table: [...dp], fill: i, deps: [i - 1, i - 2], desc: `dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}` })
    }
    return steps
  },
}

/* ── 1D: Coin Change ── */
const coinChange = {
  name: 'Coin Change',
  type: '1d',
  desc: 'Minimum coins to make amount. Coins: [1, 3, 4]',
  code: 'dp[i] = min(dp[i-c] + 1) for each coin c',
  compute: (n) => {
    const coins = [1, 3, 4]
    const dp = Array(n + 1).fill(Infinity)
    dp[0] = 0
    const steps = [{ table: [...dp], fill: 0, deps: [], desc: 'dp[0] = 0' }]
    for (let i = 1; i <= n; i++) {
      for (const c of coins) {
        if (i >= c && dp[i - c] + 1 < dp[i]) dp[i] = dp[i - c] + 1
      }
      steps.push({ table: [...dp], fill: i, deps: coins.filter(c => i - c >= 0).map(c => i - c), desc: `dp[${i}] = ${dp[i] === Infinity ? '∞' : dp[i]}` })
    }
    return steps
  },
}

/* ── 2D: 0/1 Knapsack ── */
const knapsack01 = {
  name: '0/1 Knapsack',
  type: '2d',
  desc: 'Maximize value without exceeding capacity. Items cannot be fractioned.',
  code: 'dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i]] + val[i])',
  defaultItems: [
    { weight: 2, value: 12 },
    { weight: 1, value: 10 },
    { weight: 3, value: 20 },
    { weight: 2, value: 15 },
  ],
  defaultCap: 5,
  compute: (items, capacity) => {
    const n = items.length
    const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0))
    const steps = []

    steps.push({ table: dp.map(r => [...r]), row: 0, col: 0, desc: 'Initialize DP table with zeros' })

    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        if (items[i - 1].weight <= w) {
          dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - items[i - 1].weight] + items[i - 1].value)
        } else {
          dp[i][w] = dp[i - 1][w]
        }
        steps.push({
          table: dp.map(r => [...r]),
          row: i, col: w,
          deps: items[i - 1].weight <= w
            ? [{ r: i - 1, c: w }, { r: i - 1, c: w - items[i - 1].weight }]
            : [{ r: i - 1, c: w }],
          desc: `Item ${i} (w:${items[i-1].weight}, v:${items[i-1].value}) at cap ${w}: dp[${i}][${w}] = ${dp[i][w]}`,
        })
      }
    }

    // Traceback selected items
    const selected = []
    let w = capacity
    for (let i = n; i > 0; i--) {
      if (dp[i][w] !== dp[i - 1][w]) {
        selected.push(i - 1)
        w -= items[i - 1].weight
      }
    }

    steps.push({
      table: dp.map(r => [...r]),
      row: -1, col: -1,
      selected,
      desc: `✓ Maximum value: ${dp[n][capacity]} | Selected items: ${selected.map(i => `Item ${i+1}`).join(', ')}`,
    })

    return steps
  },
}

/* ── 2D: LCS ── */
const lcs = {
  name: 'LCS',
  type: '2d',
  desc: 'Find longest common subsequence between two strings.',
  code: 'dp[i][j] = dp[i-1][j-1]+1 if match, else max(dp[i-1][j], dp[i][j-1])',
  defaultA: 'ABCBDAB',
  defaultB: 'BDCAB',
  compute: (strA, strB) => {
    const m = strA.length, n = strB.length
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
    const steps = []

    steps.push({ table: dp.map(r => [...r]), row: 0, col: 0, desc: `Comparing "${strA}" and "${strB}"` })

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (strA[i - 1] === strB[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1
          steps.push({
            table: dp.map(r => [...r]),
            row: i, col: j,
            match: true,
            deps: [{ r: i - 1, c: j - 1 }],
            desc: `'${strA[i-1]}' == '${strB[j-1]}' → dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${dp[i][j]}`,
          })
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
          steps.push({
            table: dp.map(r => [...r]),
            row: i, col: j,
            match: false,
            deps: [{ r: i - 1, c: j }, { r: i, c: j - 1 }],
            desc: `'${strA[i-1]}' ≠ '${strB[j-1]}' → dp[${i}][${j}] = max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}`,
          })
        }
      }
    }

    // Traceback LCS
    let lcsStr = ''
    let i = m, j = n
    while (i > 0 && j > 0) {
      if (strA[i - 1] === strB[j - 1]) {
        lcsStr = strA[i - 1] + lcsStr
        i--; j--
      } else if (dp[i - 1][j] > dp[i][j - 1]) i--
      else j--
    }

    steps.push({
      table: dp.map(r => [...r]),
      row: -1, col: -1,
      desc: `✓ LCS length: ${dp[m][n]} | LCS: "${lcsStr}"`,
    })

    return steps
  },
}

/* ── 2D: Matrix Chain Multiplication ── */
const matrixChain = {
  name: 'Matrix Chain',
  type: '2d',
  desc: 'Find minimum multiplications to multiply chain of matrices.',
  code: 'dp[i][j] = min(dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j])',
  defaultDims: [30, 35, 15, 5, 10, 20, 25],
  compute: (dims) => {
    const n = dims.length - 1
    const dp = Array.from({ length: n }, () => Array(n).fill(0))
    const split = Array.from({ length: n }, () => Array(n).fill(0))
    const steps = []

    steps.push({ table: dp.map(r => [...r]), row: 0, col: 0, desc: `Matrices: ${Array.from({length: n}, (_, i) => `A${i+1}(${dims[i]}×${dims[i+1]})`).join(', ')}` })

    // Fill by chain length
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i < n - len + 1; i++) {
        const j = i + len - 1
        dp[i][j] = Infinity
        for (let k = i; k < j; k++) {
          const cost = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]
          if (cost < dp[i][j]) {
            dp[i][j] = cost
            split[i][j] = k
          }
        }
        steps.push({
          table: dp.map(r => [...r]),
          row: i, col: j,
          desc: `Chain A${i+1}..A${j+1}: min cost = ${dp[i][j]} (split at k=${split[i][j]+1})`,
        })
      }
    }

    // Build parenthesization
    function parenthesize(i, j) {
      if (i === j) return `A${i + 1}`
      return `(${parenthesize(i, split[i][j])} × ${parenthesize(split[i][j] + 1, j)})`
    }

    steps.push({
      table: dp.map(r => [...r]),
      row: -1, col: -1,
      desc: `✓ Minimum multiplications: ${dp[0][n-1]} | Parenthesization: ${parenthesize(0, n-1)}`,
    })

    return steps
  },
}

/* ── 2D: Floyd-Warshall ── */
const floydWarshall = {
  name: 'Floyd-Warshall',
  type: '2d',
  desc: 'Find shortest paths between all pairs of vertices.',
  code: 'dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])',
  defaultGraph: {
    n: 4,
    edges: [
      [0, 1, 3], [0, 3, 7], [1, 0, 8], [1, 2, 2],
      [2, 0, 5], [2, 3, 1], [3, 0, 2],
    ],
  },
  compute: (n, edgeList) => {
    const INF = 999
    const dist = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => i === j ? 0 : INF)
    )
    edgeList.forEach(([u, v, w]) => { dist[u][v] = w })

    const steps = []
    steps.push({ table: dist.map(r => [...r]), k: -1, i: -1, j: -1, desc: 'Initial distance matrix' })

    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            const old = dist[i][j]
            dist[i][j] = dist[i][k] + dist[k][j]
            steps.push({
              table: dist.map(r => [...r]),
              k, i, j,
              improved: true,
              desc: `k=${k}: dist[${i}][${j}] = min(${old === INF ? '∞' : old}, ${dist[i][k]}+${dist[k][j]}) = ${dist[i][j]}`,
            })
          }
        }
      }
      steps.push({
        table: dist.map(r => [...r]),
        k, i: -1, j: -1,
        phaseEnd: true,
        desc: `✓ Phase k=${k} complete`,
      })
    }

    steps.push({
      table: dist.map(r => [...r]),
      k: -1, i: -1, j: -1,
      done: true,
      desc: '✓ All-pairs shortest paths computed!',
    })

    return steps
  },
}

/* ── Problem registry ── */
const dpProblems = {
  fibonacci: { ...fibonacci, maxN: 30 },
  coinChange: { ...coinChange, maxN: 30 },
  knapsack01: { ...knapsack01 },
  lcs: { ...lcs },
  matrixChain: { ...matrixChain },
  floydWarshall: { ...floydWarshall },
}

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */
export default function DPVisualizer() {
  const [problem, setProblem] = useState('fibonacci')
  const [inputN, setInputN] = useState(10)
  const [steps, setSteps] = useState([])
  const [stepIdx, setStepIdx] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(40)
  const [message, setMessage] = useState('Select a problem and click Solve.')
  const runRef = useRef(false)
  const { speak, toggle: toggleAudio, isOn: audioOn } = useAudioExplain()

  // 2D-specific inputs
  const [lcsA, setLcsA] = useState(lcs.defaultA)
  const [lcsB, setLcsB] = useState(lcs.defaultB)
  const [knapsackCap, setKnapsackCap] = useState(knapsack01.defaultCap)
  const [matrixDims, setMatrixDims] = useState(matrixChain.defaultDims.join(','))

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))
  const getDelay = () => {
    if (speed <= 20) return 600
    if (speed <= 40) return 300
    if (speed <= 60) return 120
    if (speed <= 80) return 50
    return 15
  }

  const solve = async () => {
    const prob = dpProblems[problem]
    let allSteps
    if (prob.type === '1d') {
      const n = parseInt(inputN)
      if (isNaN(n) || n < 0 || n > (prob.maxN || 30)) {
        setMessage(`Enter a value between 0 and ${prob.maxN || 30}.`)
        return
      }
      allSteps = prob.compute(n)
    } else if (problem === 'knapsack01') {
      allSteps = prob.compute(prob.defaultItems, knapsackCap)
    } else if (problem === 'lcs') {
      if (!lcsA || !lcsB) { setMessage('Enter both strings.'); return }
      allSteps = prob.compute(lcsA, lcsB)
    } else if (problem === 'matrixChain') {
      const dims = matrixDims.split(',').map(Number).filter(n => !isNaN(n) && n > 0)
      if (dims.length < 3) { setMessage('Need at least 3 dimensions (2 matrices).'); return }
      allSteps = prob.compute(dims)
    } else if (problem === 'floydWarshall') {
      const fw = floydWarshall.defaultGraph
      allSteps = prob.compute(fw.n, fw.edges)
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
    setMessage('Reset.')
  }

  const currentStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null
  const prob = dpProblems[problem]
  const is2D = prob.type === '2d'

  /* ── Row/Col headers for 2D tables ── */
  const get2DHeaders = () => {
    if (problem === 'knapsack01') {
      return {
        rows: ['0', ...knapsack01.defaultItems.map((it, i) => `Item ${i+1}`)],
        cols: Array.from({ length: knapsackCap + 1 }, (_, i) => String(i)),
      }
    } else if (problem === 'lcs') {
      return {
        rows: ['', ...lcsA.split('')],
        cols: ['', ...lcsB.split('')],
      }
    } else if (problem === 'matrixChain') {
      const dims = matrixDims.split(',').map(Number).filter(n => !isNaN(n))
      const n = dims.length - 1
      return {
        rows: Array.from({ length: n }, (_, i) => `A${i+1}`),
        cols: Array.from({ length: n }, (_, i) => `A${i+1}`),
      }
    } else if (problem === 'floydWarshall') {
      return {
        rows: Array.from({ length: floydWarshall.defaultGraph.n }, (_, i) => String(i)),
        cols: Array.from({ length: floydWarshall.defaultGraph.n }, (_, i) => String(i)),
      }
    }
    return { rows: [], cols: [] }
  }

  return (
    <div className="ds-page">
      <div style={{position:'relative'}}>
        <FullscreenMode codeContent={[p.code]} currentLine={-1} />
        <button className={`audio-fab ${audioOn ? 'on' : ''}`} onClick={toggleAudio} style={{position:'absolute',top:8,right:36,zIndex:10}} title={audioOn ? 'Mute' : 'Narrate'}>{audioOn ? '🔊' : '🔇'}</button>
      </div>
      <div className="viz-header">
        <div>
          <span className="section-label">Dynamic Programming</span>
          <h1 className="viz-title">{prob.name}</h1>
        </div>
        <div className="viz-stats">
          <div className="stat-item">
            <span className="stat-label">Step</span>
            <span className="stat-value gradient-text">{stepIdx >= 0 ? stepIdx + 1 : 0}/{steps.length || '—'}</span>
          </div>
        </div>
      </div>

      <div className="algo-selector">
        {Object.entries(dpProblems).map(([key, val]) => (
          <button key={key} className={`algo-btn ${problem === key ? 'active' : ''}`}
            onClick={() => { if (!isRunning) { setProblem(key); setSteps([]); setStepIdx(-1) } }}
            disabled={isRunning}>
            {val.name}
          </button>
        ))}
      </div>

      <div className="viz-body">
        <div className="ds-canvas glass-card" style={{ flex: 1 }}>
          <div className="dp-container">
            <p className="dp-desc">{prob.desc}</p>

            {/* 1D Table */}
            {!is2D && currentStep && (
              <div className="dp-table-wrapper">
                <div className="dp-indices">
                  {currentStep.table.map((_, i) => (
                    <div key={i} className="dp-index">{i}</div>
                  ))}
                </div>
                <div className="dp-cells">
                  {currentStep.table.map((val, i) => (
                    <div key={i} className={`dp-cell ${
                      i === currentStep.fill ? 'filling' :
                      currentStep.deps?.includes(i) ? 'dependency' :
                      i < currentStep.fill ? 'filled' : ''
                    }`}>
                      {val === Infinity ? '∞' : val}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2D Table */}
            {is2D && currentStep && (() => {
              const headers = get2DHeaders()
              return (
                <div className="dp-2d-wrapper">
                  <div className="dp-2d-table" style={{
                    gridTemplateColumns: `40px repeat(${currentStep.table[0]?.length || 1}, 1fr)`,
                  }}>
                    {/* Corner cell */}
                    <div className="dp-2d-corner"></div>
                    {/* Column headers */}
                    {headers.cols.map((h, j) => (
                      <div key={`ch-${j}`} className="dp-2d-header col-header">{h}</div>
                    ))}
                    {/* Rows */}
                    {currentStep.table.map((row, i) => (
                      <React.Fragment key={`row-${i}`}>
                        <div className="dp-2d-header row-header">{headers.rows[i] || i}</div>
                        {row.map((val, j) => {
                          const isFilling = i === currentStep.row && j === currentStep.col
                          const isDep = currentStep.deps?.some(d => d.r === i && d.c === j)
                          const isFilled = (currentStep.row > 0 && (i < currentStep.row || (i === currentStep.row && j < currentStep.col)))
                          const isMatch = currentStep.match && isFilling

                          return (
                            <div key={`${i}-${j}`} className={`dp-2d-cell ${
                              isFilling ? (isMatch ? 'filling match' : 'filling') :
                              isDep ? 'dependency' :
                              isFilled ? 'filled' : ''
                            }`}>
                              {val === Infinity || val === 999 ? '∞' : val}
                            </div>
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )
            })()}

            {!currentStep && (
              <div className="empty-state">
                <span className="empty-icon">🧮</span>
                <p>Configure inputs and click Solve to see the DP table fill step by step</p>
              </div>
            )}
          </div>
          <div className="ds-message">{message}</div>
        </div>

        {/* Right Panel */}
        <div className="code-panel glass-card">
          <div className="code-panel-header">
            <div className="code-dots"><span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span></div>
            <span className="code-panel-title">Recurrence</span>
          </div>
          <pre className="pseudocode" style={{ fontSize: '0.7rem', padding: 'var(--space-md)' }}>
            <code>{prob.code}</code>
          </pre>

          {/* Legend */}
          <div className="dp-legend">
            <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent-primary)' }}></span>Filling</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#eab308' }}></span>Dependency</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--accent-success)' }}></span>Match</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: 'rgba(0,240,255,0.3)' }}></span>Filled</div>
          </div>

          {/* Problem-specific inputs */}
          <div className="dp-inputs-panel">
            {prob.type === '1d' && (
              <div className="control-group">
                <label className="control-label">n =</label>
                <input type="number" value={inputN} onChange={e => setInputN(e.target.value)}
                  className="ds-input ds-input-sm" min="0" max={prob.maxN || 30} disabled={isRunning} />
              </div>
            )}
            {problem === 'lcs' && (
              <>
                <div className="control-group">
                  <label className="control-label">String A:</label>
                  <input type="text" value={lcsA} onChange={e => setLcsA(e.target.value.toUpperCase())}
                    className="ds-input" disabled={isRunning} style={{ width: '100%' }} />
                </div>
                <div className="control-group">
                  <label className="control-label">String B:</label>
                  <input type="text" value={lcsB} onChange={e => setLcsB(e.target.value.toUpperCase())}
                    className="ds-input" disabled={isRunning} style={{ width: '100%' }} />
                </div>
              </>
            )}
            {problem === 'knapsack01' && (
              <div className="control-group">
                <label className="control-label">Capacity:</label>
                <input type="number" value={knapsackCap} onChange={e => setKnapsackCap(+e.target.value)}
                  className="ds-input ds-input-sm" min="1" max="20" disabled={isRunning} />
              </div>
            )}
            {problem === 'matrixChain' && (
              <div className="control-group">
                <label className="control-label">Dimensions (comma):</label>
                <input type="text" value={matrixDims} onChange={e => setMatrixDims(e.target.value)}
                  className="ds-input" disabled={isRunning} style={{ width: '100%' }} />
              </div>
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
          <button className="btn-primary ds-btn" onClick={solve} disabled={isRunning}>
            {isRunning ? 'Solving...' : '▶ Solve'}
          </button>
          <button className="btn-secondary ds-btn" onClick={reset}>Reset</button>
        </div>
        <div className="controls-right" />
      </div>
    </div>
  )
}
