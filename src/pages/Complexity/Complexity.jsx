import { useState } from 'react'
import './Complexity.css'

const categories = ['All', 'Sorting', 'Searching', 'Graph', 'Data Structure']

const complexityData = [
  // Sorting
  { name: 'Bubble Sort', cat: 'Sorting', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true, inplace: true },
  { name: 'Selection Sort', cat: 'Sorting', best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: false, inplace: true },
  { name: 'Insertion Sort', cat: 'Sorting', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true, inplace: true },
  { name: 'Merge Sort', cat: 'Sorting', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: true, inplace: false },
  { name: 'Quick Sort', cat: 'Sorting', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: false, inplace: true },
  { name: 'Heap Sort', cat: 'Sorting', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: false, inplace: true },
  { name: 'Shell Sort', cat: 'Sorting', best: 'O(n log n)', avg: 'O(n^1.25)', worst: 'O(n²)', space: 'O(1)', stable: false, inplace: true },
  { name: 'Counting Sort', cat: 'Sorting', best: 'O(n+k)', avg: 'O(n+k)', worst: 'O(n+k)', space: 'O(k)', stable: true, inplace: false },
  { name: 'Radix Sort', cat: 'Sorting', best: 'O(nk)', avg: 'O(nk)', worst: 'O(nk)', space: 'O(n+k)', stable: true, inplace: false },
  // Searching
  { name: 'Linear Search', cat: 'Searching', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)' },
  { name: 'Binary Search', cat: 'Searching', best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
  { name: 'Jump Search', cat: 'Searching', best: 'O(1)', avg: 'O(√n)', worst: 'O(√n)', space: 'O(1)' },
  { name: 'Interpolation Search', cat: 'Searching', best: 'O(1)', avg: 'O(log log n)', worst: 'O(n)', space: 'O(1)' },
  // Graph
  { name: 'BFS', cat: 'Graph', best: 'O(V+E)', avg: 'O(V+E)', worst: 'O(V+E)', space: 'O(V)' },
  { name: 'DFS', cat: 'Graph', best: 'O(V+E)', avg: 'O(V+E)', worst: 'O(V+E)', space: 'O(V)' },
  { name: 'Dijkstra', cat: 'Graph', best: 'O(V+E log V)', avg: 'O(V+E log V)', worst: 'O(V+E log V)', space: 'O(V)' },
  { name: 'Bellman-Ford', cat: 'Graph', best: 'O(VE)', avg: 'O(VE)', worst: 'O(VE)', space: 'O(V)' },
  { name: 'Floyd-Warshall', cat: 'Graph', best: 'O(V³)', avg: 'O(V³)', worst: 'O(V³)', space: 'O(V²)' },
  { name: 'Kruskal', cat: 'Graph', best: 'O(E log E)', avg: 'O(E log E)', worst: 'O(E log E)', space: 'O(V+E)' },
  { name: 'Prim', cat: 'Graph', best: 'O(V+E log V)', avg: 'O(V+E log V)', worst: 'O(V+E log V)', space: 'O(V)' },
  // Data Structures
  { name: 'Array Access', cat: 'Data Structure', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(n)' },
  { name: 'Array Insert', cat: 'Data Structure', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(n)' },
  { name: 'Stack Push/Pop', cat: 'Data Structure', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(n)' },
  { name: 'Queue Enqueue/Dequeue', cat: 'Data Structure', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(n)' },
  { name: 'BST Search', cat: 'Data Structure', best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)', space: 'O(n)' },
  { name: 'BST Insert', cat: 'Data Structure', best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)', space: 'O(n)' },
  { name: 'Hash Table Lookup', cat: 'Data Structure', best: 'O(1)', avg: 'O(1)', worst: 'O(n)', space: 'O(n)' },
]

function getComplexityClass(c) {
  if (c.includes('1')) return 'cx-constant'
  if (c.includes('log log')) return 'cx-loglog'
  if (c.includes('log n') && !c.includes('n log')) return 'cx-log'
  if (c.includes('√n')) return 'cx-sqrt'
  if (c === 'O(n)' || c === 'O(n+k)' || c === 'O(nk)') return 'cx-linear'
  if (c.includes('n log')) return 'cx-nlogn'
  if (c.includes('n²') || c.includes('n^1.25')) return 'cx-quadratic'
  if (c.includes('V³') || c.includes('n³')) return 'cx-cubic'
  return 'cx-linear'
}

/* ── Frequency Count Method ── */
const freqExamples = [
  {
    name: 'Nested Loop (O(n²))',
    code: [
      'sum = 0;',
      'for (i = 0; i < n; i++)',
      '    for (j = 0; j < n; j++)',
      '        sum = sum + 1;',
    ],
    freq: ['1', 'n+1', 'n(n+1)', 'n²'],
    cost: ['1', '1', '1', '1'],
    total: '2n² + 2n + 2 → O(n²)',
  },
  {
    name: 'Single Loop (O(n))',
    code: [
      'sum = 0;',
      'for (i = 0; i < n; i++)',
      '    sum = sum + arr[i];',
    ],
    freq: ['1', 'n+1', 'n'],
    cost: ['1', '1', '1'],
    total: '2n + 2 → O(n)',
  },
  {
    name: 'Binary Search (O(log n))',
    code: [
      'low = 0; high = n-1;',
      'while (low <= high)',
      '    mid = (low+high)/2;',
      '    if (arr[mid] == key)',
      '        return mid;',
      '    else if (arr[mid] < key)',
      '        low = mid + 1;',
      '    else',
      '        high = mid - 1;',
    ],
    freq: ['1', 'log n + 1', 'log n', 'log n', '1', 'log n', 'log n', 'log n', 'log n'],
    cost: ['1', '1', '1', '1', '1', '1', '1', '1', '1'],
    total: '6 log n + 3 → O(log n)',
  },
  {
    name: 'Triple Nested (O(n³))',
    code: [
      'for (i = 0; i < n; i++)',
      '    for (j = 0; j < n; j++)',
      '        for (k = 0; k < n; k++)',
      '            c[i][j] += a[i][k]*b[k][j];',
    ],
    freq: ['n+1', 'n(n+1)', 'n²(n+1)', 'n³'],
    cost: ['1', '1', '1', '1'],
    total: '2n³ + 2n² + 2n + 1 → O(n³)',
  },
]

export default function Complexity() {
  const [filter, setFilter] = useState('All')
  const [freqIdx, setFreqIdx] = useState(0)
  const [highlightLine, setHighlightLine] = useState(-1)

  const filtered = filter === 'All' ? complexityData : complexityData.filter(d => d.cat === filter)
  const ex = freqExamples[freqIdx]

  const animateHighlight = () => {
    let i = 0
    const interval = setInterval(() => {
      setHighlightLine(i)
      i++
      if (i >= ex.code.length) {
        clearInterval(interval)
        setTimeout(() => setHighlightLine(-1), 1000)
      }
    }, 800)
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
                <th>Algorithm</th>
                <th>Best Ω</th>
                <th>Average Θ</th>
                <th>Worst O</th>
                <th>Space</th>
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
                  <td><span className={`cx-badge cx-space`}>{d.space}</span></td>
                  {(filter === 'All' || filter === 'Sorting') && d.stable !== undefined ? (
                    <>
                      <td>{d.stable ? '✓' : '✗'}</td>
                      <td>{d.inplace ? '✓' : '✗'}</td>
                    </>
                  ) : (filter === 'All' || filter === 'Sorting') ? <><td>—</td><td>—</td></> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ Frequency Count Method ═══ */}
      <div className="cx-section glass-card">
        <div className="cx-section-header">
          <h2 className="cx-section-title">🧮 Frequency Count Method</h2>
          <div className="cx-filters">
            {freqExamples.map((e, i) => (
              <button key={i} className={`cx-filter ${freqIdx === i ? 'active' : ''}`}
                onClick={() => { setFreqIdx(i); setHighlightLine(-1) }}>
                {e.name}
              </button>
            ))}
          </div>
        </div>
        <div className="cx-freq-layout">
          {/* Code */}
          <div className="cx-freq-code">
            <div className="cx-freq-code-header">
              <span>Code</span>
              <button className="btn-primary ds-btn" onClick={animateHighlight} style={{padding:'4px 10px', fontSize:'0.6rem'}}>
                ▶ Animate
              </button>
            </div>
            {ex.code.map((line, i) => (
              <div key={i} className={`cx-freq-line ${highlightLine === i ? 'active' : ''}`}>
                <span className="cx-freq-ln">{i + 1}</span>
                <code>{line}</code>
              </div>
            ))}
          </div>
          {/* Frequency Table */}
          <div className="cx-freq-table-wrap">
            <table className="cx-freq-table">
              <thead>
                <tr><th>Line</th><th>Statement</th><th>Frequency</th><th>Cost</th><th>Total</th></tr>
              </thead>
              <tbody>
                {ex.code.map((line, i) => (
                  <tr key={i} className={highlightLine === i ? 'active' : ''}>
                    <td>{i + 1}</td>
                    <td className="cx-freq-stmt"><code>{line}</code></td>
                    <td className="cx-freq-val">{ex.freq[i]}</td>
                    <td>{ex.cost[i]}</td>
                    <td className="cx-freq-val">{ex.freq[i]} × {ex.cost[i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cx-freq-result">
              <strong>T(n)</strong> = {ex.total}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
