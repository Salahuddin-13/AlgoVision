import { useState, useRef } from 'react'
import './Practice.css'

const problemCategories = [
  {
    name: 'Sorting',
    icon: '📊',
    problems: [
      { title: 'Sort using Bubble Sort', desc: 'Given an array, sort it in ascending order using Bubble Sort. Show each pass.' },
      { title: 'Sort using Selection Sort', desc: 'Find the minimum element in the unsorted part and place it at the beginning.' },
      { title: 'Sort using Merge Sort', desc: 'Divide the array into halves, sort each, and merge. Write the merged result.' },
      { title: 'Sort using Quick Sort', desc: 'Choose the last element as pivot, partition the array, and sort recursively.' },
      { title: 'Sort using Insertion Sort', desc: 'Insert each element into its correct position in the sorted portion.' },
    ],
  },
  {
    name: 'Searching',
    icon: '🔍',
    problems: [
      { title: 'Binary Search', desc: 'Find the target element in a sorted array using Binary Search. Show each step.' },
      { title: 'Linear Search', desc: 'Search for the target by checking each element. How many comparisons?' },
      { title: 'Find First & Last Occurrence', desc: 'In a sorted array with duplicates, find the first and last index of the target.' },
      { title: 'Search in Rotated Array', desc: 'The sorted array has been rotated. Find the target element.' },
      { title: 'Find Peak Element', desc: 'Find any element that is greater than both its neighbors.' },
    ],
  },
  {
    name: 'Stacks & Queues',
    icon: '📚',
    problems: [
      { title: 'Evaluate Postfix Expression', desc: 'Use a stack to evaluate the given postfix expression.' },
      { title: 'Check Balanced Parentheses', desc: 'Determine if the brackets in the expression are balanced.' },
      { title: 'Implement Queue using Stacks', desc: 'Show how to enqueue and dequeue using two stacks.' },
      { title: 'Next Greater Element', desc: 'Find the next greater element for each element using a stack.' },
      { title: 'Reverse a Queue', desc: 'Reverse the elements of the queue using a stack.' },
    ],
  },
  {
    name: 'Graphs',
    icon: '🕸️',
    problems: [
      { title: 'BFS Traversal', desc: 'Perform Breadth-First Search starting from the given node. List the visit order.' },
      { title: 'DFS Traversal', desc: 'Perform Depth-First Search starting from the given node. List the visit order.' },
      { title: 'Detect Cycle', desc: 'Determine if the directed graph contains a cycle.' },
      { title: 'Shortest Path (BFS)', desc: 'Find the shortest path between two nodes in an unweighted graph.' },
      { title: 'Topological Sort', desc: 'Find a valid topological ordering for the given DAG.' },
    ],
  },
  {
    name: 'Dynamic Programming',
    icon: '🧩',
    problems: [
      { title: 'Fibonacci (DP)', desc: 'Find the nth Fibonacci number using tabulation. Show the DP table.' },
      { title: '0/1 Knapsack', desc: 'Given items with weights and values, maximize value within capacity.' },
      { title: 'Longest Common Subsequence', desc: 'Find the LCS of two strings. Fill the DP table.' },
      { title: 'Coin Change', desc: 'Find the minimum coins needed to make the given amount.' },
      { title: 'Edit Distance', desc: 'Find the minimum operations to convert one string to another.' },
    ],
  },
]

function generateTestCase(category, problemIdx) {
  const randArr = (size, max) => Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1)
  const randStr = (len) => Array.from({ length: len }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('')

  if (category === 'Sorting') {
    const size = 6 + Math.floor(Math.random() * 5)
    return { input: `Array: [${randArr(size, 99).join(', ')}]`, expected: null }
  }
  if (category === 'Searching') {
    const size = 8 + Math.floor(Math.random() * 4)
    const arr = randArr(size, 50).sort((a, b) => a - b)
    const target = arr[Math.floor(Math.random() * arr.length)]
    if (problemIdx === 3) {
      const rot = Math.floor(Math.random() * size)
      const rotated = [...arr.slice(rot), ...arr.slice(0, rot)]
      return { input: `Array: [${rotated.join(', ')}]\nTarget: ${target}`, expected: null }
    }
    return { input: `Array: [${arr.join(', ')}]\nTarget: ${target}`, expected: null }
  }
  if (category === 'Stacks & Queues') {
    if (problemIdx === 0) {
      const ops = ['+', '-', '*']
      const a = Math.floor(Math.random() * 9) + 1
      const b = Math.floor(Math.random() * 9) + 1
      const c = Math.floor(Math.random() * 9) + 1
      const op1 = ops[Math.floor(Math.random() * 3)]
      const op2 = ops[Math.floor(Math.random() * 3)]
      return { input: `Expression: ${a} ${b} ${op1} ${c} ${op2}`, expected: null }
    }
    if (problemIdx === 1) {
      const brackets = ['()', '[]', '{}']
      let expr = ''
      for (let i = 0; i < 4 + Math.floor(Math.random() * 4); i++) {
        const b = brackets[Math.floor(Math.random() * 3)]
        expr += Math.random() > 0.3 ? b : b[Math.floor(Math.random() * 2)]
      }
      return { input: `Expression: ${expr}`, expected: null }
    }
    const arr = randArr(5, 20)
    return { input: `Elements: [${arr.join(', ')}]`, expected: null }
  }
  if (category === 'Graphs') {
    const n = 4 + Math.floor(Math.random() * 3)
    const edges = []
    for (let i = 0; i < n - 1; i++) {
      edges.push(`${i} → ${i + 1}`)
      if (Math.random() > 0.5 && i + 2 < n) edges.push(`${i} → ${i + 2}`)
    }
    if (problemIdx === 2 && Math.random() > 0.5) edges.push(`${n - 1} → 0`)
    return { input: `Nodes: 0 to ${n - 1}\nEdges: ${edges.join(', ')}\nStart: 0`, expected: null }
  }
  if (category === 'Dynamic Programming') {
    if (problemIdx === 0) return { input: `n = ${7 + Math.floor(Math.random() * 8)}`, expected: null }
    if (problemIdx === 1) {
      const items = Math.floor(Math.random() * 3) + 3
      const w = randArr(items, 10)
      const v = randArr(items, 50)
      const cap = Math.floor(Math.random() * 10) + 10
      return { input: `Weights: [${w.join(', ')}]\nValues: [${v.join(', ')}]\nCapacity: ${cap}`, expected: null }
    }
    if (problemIdx === 2 || problemIdx === 4) {
      return { input: `String A: "${randStr(4 + Math.floor(Math.random() * 3))}"\nString B: "${randStr(4 + Math.floor(Math.random() * 3))}"`, expected: null }
    }
    if (problemIdx === 3) {
      const coins = [1, 2, 5, 10].slice(0, 2 + Math.floor(Math.random() * 3))
      return { input: `Coins: [${coins.join(', ')}]\nAmount: ${5 + Math.floor(Math.random() * 15)}`, expected: null }
    }
  }
  return { input: `Array: [${randArr(6, 50).join(', ')}]`, expected: null }
}

function generateCustomTestCase(type, size, rangeMin, rangeMax) {
  const arr = Array.from({ length: size }, () => Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin)
  if (type === 'sorted') arr.sort((a, b) => a - b)
  else if (type === 'reverse') arr.sort((a, b) => b - a)
  else if (type === 'nearly') { arr.sort((a, b) => a - b); for (let i = 0; i < Math.floor(size * 0.1); i++) { const j = Math.floor(Math.random() * size); const k = Math.floor(Math.random() * size); [arr[j], arr[k]] = [arr[k], arr[j]] } }
  else if (type === 'duplicates') arr.fill(arr[0])
  return `[${arr.join(', ')}]`
}

export default function Practice() {
  const [selectedCat, setSelectedCat] = useState(null)
  const [currentProblem, setCurrentProblem] = useState(null)
  const [testCase, setTestCase] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showTimer, setShowTimer] = useState(false)
  const [timer, setTimer] = useState(300) // 5 min
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef(null)

  // Custom test case state
  const [customSize, setCustomSize] = useState(10)
  const [customMin, setCustomMin] = useState(1)
  const [customMax, setCustomMax] = useState(100)
  const [customType, setCustomType] = useState('random')
  const [customResult, setCustomResult] = useState('')

  const pickProblem = (cat, idx) => {
    const prob = problemCategories.find(c => c.name === cat)
    setCurrentProblem({ cat, idx, ...prob.problems[idx] })
    setTestCase(generateTestCase(cat, idx))
    setUserAnswer('')
    stopTimer()
  }

  const newTestCase = () => {
    if (currentProblem) {
      setTestCase(generateTestCase(currentProblem.cat, currentProblem.idx))
      setUserAnswer('')
    }
  }

  const startTimer = () => {
    setTimerActive(true)
    setTimer(300)
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); setTimerActive(false); return 0 } return t - 1 })
    }, 1000)
  }

  const stopTimer = () => {
    clearInterval(timerRef.current)
    setTimerActive(false)
    setTimer(300)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="pr-page">
      <div className="viz-header">
        <div>
          <span className="section-label">Practice</span>
          <h1 className="viz-title">Practice Lab</h1>
        </div>
      </div>

      <div className="pr-body">
        {/* Left: Category + Problem list */}
        <div className="pr-sidebar glass-card">
          <div className="pr-sb-title">Choose Topic</div>
          {problemCategories.map(cat => (
            <div key={cat.name} className="pr-cat-group">
              <button className={`pr-cat-btn ${selectedCat === cat.name ? 'active' : ''}`}
                onClick={() => setSelectedCat(selectedCat === cat.name ? null : cat.name)}>
                <span>{cat.icon}</span> {cat.name}
              </button>
              {selectedCat === cat.name && (
                <div className="pr-prob-list">
                  {cat.problems.map((p, i) => (
                    <button key={i} className={`pr-prob-btn ${currentProblem?.cat === cat.name && currentProblem?.idx === i ? 'active' : ''}`}
                      onClick={() => pickProblem(cat.name, i)}>
                      {p.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Custom Test Case Generator */}
          <div className="pr-custom-section">
            <div className="pr-sb-title" style={{marginTop:'var(--space-md)'}}>⚙️ Custom Test Case</div>
            <div className="pr-custom-controls">
              <label>
                <span>Size</span>
                <input type="number" min="2" max="50" value={customSize} onChange={e => setCustomSize(Number(e.target.value))} />
              </label>
              <label>
                <span>Min</span>
                <input type="number" value={customMin} onChange={e => setCustomMin(Number(e.target.value))} />
              </label>
              <label>
                <span>Max</span>
                <input type="number" value={customMax} onChange={e => setCustomMax(Number(e.target.value))} />
              </label>
              <label>
                <span>Type</span>
                <select value={customType} onChange={e => setCustomType(e.target.value)}>
                  <option value="random">Random</option>
                  <option value="sorted">Sorted</option>
                  <option value="reverse">Reverse Sorted</option>
                  <option value="nearly">Nearly Sorted</option>
                  <option value="duplicates">All Duplicates</option>
                </select>
              </label>
            </div>
            <button className="btn-primary ds-btn" style={{width:'100%',marginTop:'6px'}}
              onClick={() => setCustomResult(generateCustomTestCase(customType, customSize, customMin, customMax))}>
              Generate
            </button>
            {customResult && (
              <div className="pr-custom-result">
                <code>{customResult}</code>
                <button className="pr-copy-btn" onClick={() => navigator.clipboard.writeText(customResult)}>📋 Copy</button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Problem workspace */}
        <div className="pr-workspace">
          {currentProblem ? (
            <>
              <div className="pr-problem-card glass-card">
                <div className="pr-problem-header">
                  <h2 className="pr-problem-title">{currentProblem.title}</h2>
                  <div className="pr-problem-actions">
                    <button className="btn-secondary ds-btn" onClick={newTestCase}>🔄 New Test Case</button>
                    {!timerActive ? (
                      <button className="btn-secondary ds-btn" onClick={() => { setShowTimer(true); startTimer() }}>⏱ Start Timer</button>
                    ) : (
                      <button className="btn-secondary ds-btn" onClick={stopTimer}>⏹ Stop</button>
                    )}
                  </div>
                </div>
                <p className="pr-problem-desc">{currentProblem.desc}</p>

                {showTimer && (
                  <div className={`pr-timer ${timer <= 30 ? 'warning' : ''}`}>
                    {formatTime(timer)}
                  </div>
                )}

                {testCase && (
                  <div className="pr-test-case">
                    <div className="pr-tc-label">Test Case</div>
                    <pre className="pr-tc-input">{testCase.input}</pre>
                  </div>
                )}

                <div className="pr-answer-area">
                  <div className="pr-tc-label">Your Answer</div>
                  <textarea
                    className="pr-answer-textarea"
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    placeholder="Write your answer/solution here..."
                    rows={6}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="pr-empty glass-card">
              <div className="pr-empty-icon">🏋️</div>
              <h3>Select a Problem</h3>
              <p>Choose a topic from the left, then pick a problem to practice.</p>
              <p style={{fontSize:'0.65rem', color:'var(--text-tertiary)'}}>
                Random test cases are generated each time. Use the custom generator to create specific test data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
