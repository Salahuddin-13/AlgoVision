import { useState } from 'react'
import './Complexity.css'

const categories = ['All', 'Sorting', 'Searching', 'Graph', 'Data Structure']

const complexityData = [
  { name: 'Bubble Sort', cat: 'Sorting', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true, inplace: true },
  { name: 'Selection Sort', cat: 'Sorting', best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: false, inplace: true },
  { name: 'Insertion Sort', cat: 'Sorting', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true, inplace: true },
  { name: 'Merge Sort', cat: 'Sorting', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: true, inplace: false },
  { name: 'Quick Sort', cat: 'Sorting', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: false, inplace: true },
  { name: 'Heap Sort', cat: 'Sorting', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: false, inplace: true },
  { name: 'Shell Sort', cat: 'Sorting', best: 'O(n log n)', avg: 'O(n^1.25)', worst: 'O(n²)', space: 'O(1)', stable: false, inplace: true },
  { name: 'Counting Sort', cat: 'Sorting', best: 'O(n+k)', avg: 'O(n+k)', worst: 'O(n+k)', space: 'O(k)', stable: true, inplace: false },
  { name: 'Radix Sort', cat: 'Sorting', best: 'O(nk)', avg: 'O(nk)', worst: 'O(nk)', space: 'O(n+k)', stable: true, inplace: false },
  { name: 'Linear Search', cat: 'Searching', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
  { name: 'Binary Search', cat: 'Searching', best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
  { name: 'Jump Search', cat: 'Searching', best: 'O(1)', avg: 'O(√n)', worst: 'O(√n)', space: 'O(1)' },
  { name: 'Interpolation Search', cat: 'Searching', best: 'O(1)', avg: 'O(log log n)', worst: 'O(n)', space: 'O(1)' },
  { name: 'BFS', cat: 'Graph', best: 'O(V+E)', avg: 'O(V+E)', worst: 'O(V+E)', space: 'O(V)' },
  { name: 'DFS', cat: 'Graph', best: 'O(V+E)', avg: 'O(V+E)', worst: 'O(V+E)', space: 'O(V)' },
  { name: 'Dijkstra', cat: 'Graph', best: 'O(V+E log V)', avg: 'O(V+E log V)', worst: 'O(V+E log V)', space: 'O(V)' },
  { name: 'Bellman-Ford', cat: 'Graph', best: 'O(VE)', avg: 'O(VE)', worst: 'O(VE)', space: 'O(V)' },
  { name: 'Floyd-Warshall', cat: 'Graph', best: 'O(V³)', avg: 'O(V³)', worst: 'O(V³)', space: 'O(V²)' },
  { name: 'Kruskal', cat: 'Graph', best: 'O(E log E)', avg: 'O(E log E)', worst: 'O(E log E)', space: 'O(V+E)' },
  { name: 'Prim', cat: 'Graph', best: 'O(V+E log V)', avg: 'O(V+E log V)', worst: 'O(V+E log V)', space: 'O(V)' },
  { name: 'Array Access', cat: 'Data Structure', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(n)' },
  { name: 'Array Insert', cat: 'Data Structure', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(n)' },
  { name: 'Stack Push/Pop', cat: 'Data Structure', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(n)' },
  { name: 'Queue Enqueue/Dequeue', cat: 'Data Structure', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(n)' },
  { name: 'BST Search', cat: 'Data Structure', best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)', space: 'O(n)' },
  { name: 'BST Insert', cat: 'Data Structure', best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)', space: 'O(n)' },
  { name: 'Hash Table Lookup', cat: 'Data Structure', best: 'O(1)', avg: 'O(1)', worst: 'O(n)', space: 'O(n)' },
]

function getComplexityClass(c) {
  if (c.includes('1') && !c.includes('n')) return 'cx-constant'
  if (c.includes('log log')) return 'cx-loglog'
  if (c.includes('log n') && !c.includes('n log')) return 'cx-log'
  if (c.includes('√n')) return 'cx-sqrt'
  if (/^O\(n\)$/.test(c) || c === 'O(n+k)' || c === 'O(nk)') return 'cx-linear'
  if (c.includes('n log')) return 'cx-nlogn'
  if (c.includes('n²') || c.includes('n^1.25') || c.includes('VE')) return 'cx-quadratic'
  if (c.includes('V³') || c.includes('n³')) return 'cx-cubic'
  return 'cx-linear'
}

/* ═══════════════════════════════════════════
   Frequency Count Analyzer — for user code
   ═══════════════════════════════════════════ */
function analyzeCode(codeText) {
  const lines = codeText.split('\n').filter(l => l.trim().length > 0)
  if (lines.length === 0) return { lines: [], totalComplexity: '—', details: [] }

  // Determine nesting depth of each line
  const details = lines.map(line => {
    const trimmed = line.trim()
    const indent = line.search(/\S/)
    // Count how many loop-like constructs are above this line at lower indentation
    let depth = 0
    const tabSize = 4
    if (indent > 0) depth = Math.floor(indent / tabSize) || Math.floor(indent / 2) || 0

    // Detect what kind of statement it is
    let freq = '1'
    let type = 'simple'

    if (/^\s*for\s*\(/.test(line)) {
      type = 'for-loop'
      freq = 'n'
    } else if (/^\s*while\s*\(/.test(line)) {
      type = 'while-loop'
      freq = 'n'
    } else if (/^\s*do\s*\{?/.test(line)) {
      type = 'do-loop'
      freq = 'n'
    } else if (/^\s*if\s*\(/.test(line) || /^\s*else/.test(line)) {
      type = 'conditional'
      freq = '1'
    } else if (/^\s*return/.test(line)) {
      type = 'return'
      freq = '1'
    } else if (/^\s*\{|\s*\}/.test(trimmed) && trimmed.length <= 2) {
      type = 'brace'
      freq = '—'
    }

    return { line: trimmed, indent, depth, type, freq, cost: '1' }
  })

  // Now calculate actual frequency based on nesting
  // Track loop depths
  let loopStack = [] // stack of {indent, multiplier}
  const analyzed = details.map((d, i) => {
    // Remove loops from stack that have closed (same or lesser indent)
    while (loopStack.length > 0 && loopStack[loopStack.length - 1].indent >= d.indent) {
      loopStack.pop()
    }

    const parentMultiplier = loopStack.length > 0 ? loopStack[loopStack.length - 1].exponent : 0

    if (d.type === 'for-loop' || d.type === 'while-loop' || d.type === 'do-loop') {
      const exp = parentMultiplier + 1
      loopStack.push({ indent: d.indent, exponent: exp })
      // Loop header executes one extra time for the exit check
      d.freq = exp === 1 ? 'n+1' : `n^${exp}·(n+1)`
      d.computedFreq = exp === 1 ? 'n+1' : `n^${exp}+n^${exp-1}`
    } else if (d.type === 'brace') {
      d.freq = '—'
    } else {
      // Body statement under loops
      const exp = parentMultiplier + (loopStack.length > 0 ? 0 : 0)
      const nestLevel = loopStack.length > 0 ? loopStack[loopStack.length - 1].exponent : 0
      if (nestLevel === 0) d.freq = '1'
      else if (nestLevel === 1) d.freq = 'n'
      else d.freq = `n^${nestLevel}`
    }

    return d
  })

  // Determine overall complexity
  let maxExponent = 0
  analyzed.forEach(d => {
    if (d.freq === '—') return
    const match = d.freq.match(/n\^(\d+)/)
    if (match) maxExponent = Math.max(maxExponent, parseInt(match[1]))
    else if (d.freq.includes('n')) maxExponent = Math.max(maxExponent, 1)
  })

  let totalComplexity = 'O(1)'
  if (maxExponent === 1) totalComplexity = 'O(n)'
  else if (maxExponent === 2) totalComplexity = 'O(n²)'
  else if (maxExponent === 3) totalComplexity = 'O(n³)'
  else if (maxExponent > 3) totalComplexity = `O(n^${maxExponent})`

  return { lines: analyzed, totalComplexity }
}

const defaultCode = `sum = 0;
for (i = 0; i < n; i++)
    for (j = 0; j < n; j++)
        sum = sum + 1;`

export default function Complexity() {
  const [filter, setFilter] = useState('All')
  const [userCode, setUserCode] = useState(defaultCode)
  const [analysis, setAnalysis] = useState(() => analyzeCode(defaultCode))
  const [highlightLine, setHighlightLine] = useState(-1)

  const filtered = filter === 'All' ? complexityData : complexityData.filter(d => d.cat === filter)

  const handleAnalyze = () => {
    setAnalysis(analyzeCode(userCode))
    setHighlightLine(-1)
  }

  const animateHighlight = () => {
    let i = 0
    const lines = analysis.lines
    const interval = setInterval(() => {
      setHighlightLine(i)
      i++
      if (i >= lines.length) {
        clearInterval(interval)
        setTimeout(() => setHighlightLine(-1), 1200)
      }
    }, 700)
  }

  return (
    <div className="cx-page">
      <div className="viz-header">
        <div>
          <span className="section-label">Analysis</span>
          <h1 className="viz-title">Time Complexity</h1>
        </div>
      </div>

      {/* ═══ Complexity Table ═══ */}
      <div className="cx-section glass-card">
        <div className="cx-section-header">
          <h2 className="cx-section-title">📊 Algorithm Complexity Table</h2>
          <div className="cx-filters">
            {categories.map(c => (
              <button key={c} className={`cx-filter ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="cx-table-wrap">
          <table className="cx-table">
            <thead>
              <tr>
                <th>Algorithm</th><th>Best Ω</th><th>Average Θ</th><th>Worst O</th><th>Space</th>
                {filter === 'All' || filter === 'Sorting' ? <><th>Stable</th><th>In-Place</th></> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={i}>
                  <td className="cx-name">{d.name}</td>
                  <td><span className={`cx-badge ${getComplexityClass(d.best)}`}>{d.best}</span></td>
                  <td><span className={`cx-badge ${getComplexityClass(d.avg)}`}>{d.avg}</span></td>
                  <td><span className={`cx-badge ${getComplexityClass(d.worst)}`}>{d.worst}</span></td>
                  <td><span className="cx-badge cx-space">{d.space}</span></td>
                  {(filter === 'All' || filter === 'Sorting') && d.stable !== undefined ? (
                    <><td>{d.stable ? '✓' : '✗'}</td><td>{d.inplace ? '✓' : '✗'}</td></>
                  ) : (filter === 'All' || filter === 'Sorting') ? <><td>—</td><td>—</td></> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ Frequency Count — User Code ═══ */}
      <div className="cx-section glass-card">
        <div className="cx-section-header">
          <h2 className="cx-section-title">🧮 Frequency Count Method</h2>
          <span className="cx-section-sub">Paste any code → get complexity analysis</span>
        </div>
        <div className="cx-freq-layout">
          {/* Editor */}
          <div className="cx-freq-editor">
            <div className="cx-freq-code-header">
              <span>✎ Paste your code below</span>
              <div style={{display:'flex', gap:'4px'}}>
                <button className="btn-primary ds-btn" onClick={handleAnalyze} style={{padding:'4px 10px',fontSize:'0.6rem'}}>
                  ⚡ Analyze
                </button>
                <button className="btn-secondary ds-btn" onClick={animateHighlight} style={{padding:'4px 10px',fontSize:'0.6rem'}} disabled={analysis.lines.length === 0}>
                  ▶ Animate
                </button>
              </div>
            </div>
            <textarea
              className="cx-freq-textarea"
              value={userCode}
              onChange={e => setUserCode(e.target.value)}
              spellCheck={false}
              placeholder="Paste your C/pseudocode here..."
              rows={10}
            />
          </div>

          {/* Analysis Results */}
          <div className="cx-freq-results">
            {analysis.lines.length > 0 ? (
              <>
                <table className="cx-freq-table">
                  <thead>
                    <tr><th>#</th><th>Statement</th><th>Type</th><th>Frequency</th><th>Cost</th></tr>
                  </thead>
                  <tbody>
                    {analysis.lines.map((d, i) => (
                      <tr key={i} className={highlightLine === i ? 'active' : ''}>
                        <td>{i + 1}</td>
                        <td className="cx-freq-stmt"><code>{d.line}</code></td>
                        <td><span className={`cx-type-badge cx-type-${d.type}`}>{d.type}</span></td>
                        <td className="cx-freq-val">{d.freq}</td>
                        <td>{d.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="cx-freq-result">
                  <strong>Overall Time Complexity:</strong>&nbsp;
                  <span className={`cx-badge ${getComplexityClass(analysis.totalComplexity)}`} style={{fontSize:'0.75rem',padding:'2px 10px'}}>
                    {analysis.totalComplexity}
                  </span>
                </div>
              </>
            ) : (
              <div className="cx-freq-empty">Paste code and click ⚡ Analyze</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
