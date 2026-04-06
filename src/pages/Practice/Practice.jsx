import { useState, useRef } from 'react'
import './Practice.css'

/* ═══════════════════════════════════════════
   PROBLEM BANK — LeetCode-style problems
   ═══════════════════════════════════════════ */
const problems = [
  {
    id: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays',
    desc: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to target.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
    ],
    constraints: ['2 ≤ nums.length ≤ 100', '-100 ≤ nums[i] ≤ 100', 'Exactly one solution exists'],
    template: `function twoSum(nums, target) {\n  // Write your solution here\n  \n}`,
    testFn: (fn) => {
      const cases = [
        { args: [[2,7,11,15], 9], expected: [0,1] },
        { args: [[3,2,4], 6], expected: [1,2] },
        { args: [[3,3], 6], expected: [0,1] },
        { args: [[1,5,3,7], 8], expected: [1,2] },
      ]
      return cases.map(c => {
        try {
          const result = fn(...c.args.map(a => Array.isArray(a) ? [...a] : a))
          const pass = JSON.stringify(result?.sort()) === JSON.stringify(c.expected.sort())
          return { input: JSON.stringify(c.args), expected: JSON.stringify(c.expected), got: JSON.stringify(result), pass }
        } catch (e) { return { input: JSON.stringify(c.args), expected: JSON.stringify(c.expected), got: 'Error: ' + e.message, pass: false } }
      })
    },
    stressGen: () => {
      const n = 3 + Math.floor(Math.random() * 8)
      const nums = Array.from({ length: n }, () => Math.floor(Math.random() * 201) - 100)
      const i = Math.floor(Math.random() * n)
      let j = Math.floor(Math.random() * n)
      while (j === i) j = Math.floor(Math.random() * n)
      const target = nums[i] + nums[j]
      return { args: [nums, target], expected: [i, j].sort() }
    },
    bruteFn: (nums, target) => {
      for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length; j++)
          if (nums[i] + nums[j] === target) return [i, j]
      return []
    },
  },
  {
    id: 2, title: 'Reverse Array', difficulty: 'Easy', topic: 'Arrays',
    desc: 'Given an array, reverse it in-place and return the reversed array.',
    examples: [
      { input: 'arr = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'arr = [10,20]', output: '[20,10]' },
    ],
    constraints: ['1 ≤ arr.length ≤ 1000'],
    template: `function reverseArray(arr) {\n  // Write your solution here\n  \n}`,
    testFn: (fn) => {
      const cases = [
        { args: [[1,2,3,4,5]], expected: [5,4,3,2,1] },
        { args: [[10,20]], expected: [20,10] },
        { args: [[1]], expected: [1] },
        { args: [[3,1,4,1,5,9]], expected: [9,5,1,4,1,3] },
      ]
      return cases.map(c => {
        try {
          const result = fn([...c.args[0]])
          const pass = JSON.stringify(result) === JSON.stringify(c.expected)
          return { input: JSON.stringify(c.args), expected: JSON.stringify(c.expected), got: JSON.stringify(result), pass }
        } catch (e) { return { input: JSON.stringify(c.args), expected: JSON.stringify(c.expected), got: 'Error: ' + e.message, pass: false } }
      })
    },
    stressGen: () => {
      const n = 2 + Math.floor(Math.random() * 20)
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 100))
      return { args: [arr], expected: [...arr].reverse() }
    },
    bruteFn: (arr) => [...arr].reverse(),
  },
  {
    id: 3, title: 'Bubble Sort', difficulty: 'Easy', topic: 'Sorting',
    desc: 'Implement Bubble Sort. Given an array, return it sorted in ascending order.',
    examples: [
      { input: 'arr = [64,34,25,12,22,11,90]', output: '[11,12,22,25,34,64,90]' },
      { input: 'arr = [5,1,4,2,8]', output: '[1,2,4,5,8]' },
    ],
    constraints: ['1 ≤ arr.length ≤ 500', '-1000 ≤ arr[i] ≤ 1000'],
    template: `function bubbleSort(arr) {\n  // Implement bubble sort\n  // Return the sorted array\n  \n}`,
    testFn: (fn) => {
      const cases = [
        { args: [[64,34,25,12,22,11,90]], expected: [11,12,22,25,34,64,90] },
        { args: [[5,1,4,2,8]], expected: [1,2,4,5,8] },
        { args: [[1]], expected: [1] },
        { args: [[3,3,3]], expected: [3,3,3] },
        { args: [[5,4,3,2,1]], expected: [1,2,3,4,5] },
      ]
      return cases.map(c => {
        try {
          const result = fn([...c.args[0]])
          const pass = JSON.stringify(result) === JSON.stringify(c.expected)
          return { input: JSON.stringify(c.args), expected: JSON.stringify(c.expected), got: JSON.stringify(result), pass }
        } catch (e) { return { input: JSON.stringify(c.args), expected: JSON.stringify(c.expected), got: 'Error: ' + e.message, pass: false } }
      })
    },
    stressGen: () => {
      const n = 2 + Math.floor(Math.random() * 30)
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 200) - 100)
      return { args: [arr], expected: [...arr].sort((a, b) => a - b) }
    },
    bruteFn: (arr) => [...arr].sort((a, b) => a - b),
  },
  {
    id: 4, title: 'Binary Search', difficulty: 'Easy', topic: 'Searching',
    desc: 'Given a sorted array and a target, return the index of the target. Return -1 if not found.',
    examples: [
      { input: 'arr = [1,3,5,7,9,11], target = 7', output: '3' },
      { input: 'arr = [2,4,6,8], target = 5', output: '-1' },
    ],
    constraints: ['1 ≤ arr.length ≤ 1000', 'Array is sorted in ascending order'],
    template: `function binarySearch(arr, target) {\n  // Implement binary search\n  // Return index of target, or -1\n  \n}`,
    testFn: (fn) => {
      const cases = [
        { args: [[1,3,5,7,9,11], 7], expected: 3 },
        { args: [[2,4,6,8], 5], expected: -1 },
        { args: [[1], 1], expected: 0 },
        { args: [[1,2,3,4,5], 1], expected: 0 },
        { args: [[10,20,30,40,50], 50], expected: 4 },
      ]
      return cases.map(c => {
        try {
          const result = fn([...c.args[0]], c.args[1])
          const pass = result === c.expected
          return { input: JSON.stringify(c.args), expected: String(c.expected), got: String(result), pass }
        } catch (e) { return { input: JSON.stringify(c.args), expected: String(c.expected), got: 'Error: ' + e.message, pass: false } }
      })
    },
    stressGen: () => {
      const n = 3 + Math.floor(Math.random() * 20)
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 100)).sort((a, b) => a - b)
      const useExisting = Math.random() > 0.3
      const target = useExisting ? arr[Math.floor(Math.random() * n)] : Math.floor(Math.random() * 100)
      return { args: [arr, target], expected: arr.indexOf(target) }
    },
    bruteFn: (arr, target) => arr.indexOf(target),
  },
  {
    id: 5, title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stacks',
    desc: 'Given a string containing only `()[]{}`, determine if it is valid. A string is valid if every open bracket is closed correctly.',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: ['0 ≤ s.length ≤ 1000', 's consists only of ()[]{}'],
    template: `function isValid(s) {\n  // Return true if valid, false otherwise\n  \n}`,
    testFn: (fn) => {
      const cases = [
        { args: ['()'], expected: true },
        { args: ['()[]{}'], expected: true },
        { args: ['(]'], expected: false },
        { args: ['([)]'], expected: false },
        { args: ['{[]}'], expected: true },
        { args: [''], expected: true },
        { args: ['('], expected: false },
      ]
      return cases.map(c => {
        try {
          const result = fn(c.args[0])
          const pass = result === c.expected
          return { input: JSON.stringify(c.args), expected: String(c.expected), got: String(result), pass }
        } catch (e) { return { input: JSON.stringify(c.args), expected: String(c.expected), got: 'Error: ' + e.message, pass: false } }
      })
    },
    stressGen: () => {
      const pairs = ['()', '[]', '{}']
      let s = ''
      const n = Math.floor(Math.random() * 6)
      for (let i = 0; i < n; i++) s += pairs[Math.floor(Math.random() * 3)]
      if (Math.random() > 0.5) { const chars = s.split(''); const i = Math.floor(Math.random() * chars.length); chars.splice(i, 1); s = chars.join('') }
      return { args: [s] }
    },
    bruteFn: (s) => {
      const stack = [], map = { ')': '(', ']': '[', '}': '{' }
      for (const c of s) { if ('([{'.includes(c)) stack.push(c); else if (stack.pop() !== map[c]) return false }
      return stack.length === 0
    },
  },
  {
    id: 6, title: 'Max Subarray Sum', difficulty: 'Medium', topic: 'Arrays',
    desc: 'Given an integer array, find the contiguous subarray with the largest sum and return that sum (Kadane\'s Algorithm).',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has sum 6' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [-1,-2,-3]', output: '-1' },
    ],
    constraints: ['1 ≤ nums.length ≤ 1000', '-10000 ≤ nums[i] ≤ 10000'],
    template: `function maxSubarraySum(nums) {\n  // Implement Kadane's algorithm\n  \n}`,
    testFn: (fn) => {
      const cases = [
        { args: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 },
        { args: [[1]], expected: 1 },
        { args: [[-1,-2,-3]], expected: -1 },
        { args: [[5,4,-1,7,8]], expected: 23 },
      ]
      return cases.map(c => {
        try {
          const result = fn([...c.args[0]])
          const pass = result === c.expected
          return { input: JSON.stringify(c.args), expected: String(c.expected), got: String(result), pass }
        } catch (e) { return { input: JSON.stringify(c.args), expected: String(c.expected), got: 'Error: ' + e.message, pass: false } }
      })
    },
    stressGen: () => {
      const n = 2 + Math.floor(Math.random() * 20)
      const nums = Array.from({ length: n }, () => Math.floor(Math.random() * 200) - 100)
      return { args: [nums] }
    },
    bruteFn: (nums) => {
      let max = nums[0]
      for (let i = 0; i < nums.length; i++) { let s = 0; for (let j = i; j < nums.length; j++) { s += nums[j]; if (s > max) max = s } }
      return max
    },
  },
  {
    id: 7, title: 'Fibonacci', difficulty: 'Easy', topic: 'DP',
    desc: 'Return the nth Fibonacci number. F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).',
    examples: [{ input: 'n = 6', output: '8' }, { input: 'n = 10', output: '55' }],
    constraints: ['0 ≤ n ≤ 40'],
    template: `function fibonacci(n) {\n  // Return F(n)\n  \n}`,
    testFn: (fn) => {
      const fib = n => { let a=0,b=1; for(let i=0;i<n;i++){[a,b]=[b,a+b]} return a }
      const cases = [0,1,2,5,10,15].map(n => ({ args: [n], expected: fib(n) }))
      return cases.map(c => {
        try {
          const result = fn(c.args[0])
          return { input: String(c.args[0]), expected: String(c.expected), got: String(result), pass: result === c.expected }
        } catch(e) { return { input: String(c.args[0]), expected: String(c.expected), got: 'Error: '+e.message, pass: false } }
      })
    },
    stressGen: () => ({ args: [Math.floor(Math.random() * 30)] }),
    bruteFn: (n) => { let a=0,b=1; for(let i=0;i<n;i++){[a,b]=[b,a+b]} return a },
  },
  {
    id: 8, title: 'Merge Two Sorted Arrays', difficulty: 'Easy', topic: 'Sorting',
    desc: 'Given two sorted arrays, merge them into one sorted array.',
    examples: [
      { input: 'a = [1,3,5], b = [2,4,6]', output: '[1,2,3,4,5,6]' },
    ],
    constraints: ['0 ≤ a.length, b.length ≤ 500'],
    template: `function mergeSorted(a, b) {\n  // Merge two sorted arrays\n  \n}`,
    testFn: (fn) => {
      const cases = [
        { args: [[1,3,5],[2,4,6]], expected: [1,2,3,4,5,6] },
        { args: [[],[1,2,3]], expected: [1,2,3] },
        { args: [[1],[2]], expected: [1,2] },
        { args: [[1,1,1],[1,1,1]], expected: [1,1,1,1,1,1] },
      ]
      return cases.map(c => {
        try {
          const result = fn([...c.args[0]], [...c.args[1]])
          const pass = JSON.stringify(result) === JSON.stringify(c.expected)
          return { input: JSON.stringify(c.args), expected: JSON.stringify(c.expected), got: JSON.stringify(result), pass }
        } catch(e) { return { input: JSON.stringify(c.args), expected: JSON.stringify(c.expected), got: 'Error: '+e.message, pass: false } }
      })
    },
    stressGen: () => {
      const a = Array.from({length: Math.floor(Math.random()*10)+1}, () => Math.floor(Math.random()*50)).sort((a,b)=>a-b)
      const b = Array.from({length: Math.floor(Math.random()*10)+1}, () => Math.floor(Math.random()*50)).sort((a,b)=>a-b)
      return { args: [a, b], expected: [...a,...b].sort((a,b)=>a-b) }
    },
    bruteFn: (a, b) => [...a, ...b].sort((x, y) => x - y),
  },
]

const topics = ['All', ...new Set(problems.map(p => p.topic))]
const difficulties = ['All', 'Easy', 'Medium', 'Hard']

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function Practice() {
  const [topicFilter, setTopicFilter] = useState('All')
  const [diffFilter, setDiffFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [code, setCode] = useState('')
  const [results, setResults] = useState(null)
  const [stressResult, setStressResult] = useState(null)
  const [stressCount, setStressCount] = useState(100)
  const [tab, setTab] = useState('problem') // 'problem' | 'stress'
  const textareaRef = useRef(null)

  const filtered = problems.filter(p =>
    (topicFilter === 'All' || p.topic === topicFilter) &&
    (diffFilter === 'All' || p.difficulty === diffFilter)
  )

  const selectProblem = (p) => {
    setSelected(p)
    setCode(p.template)
    setResults(null)
    setStressResult(null)
    setTab('problem')
  }

  const runTests = () => {
    if (!selected) return
    try {
      const fn = new Function('return ' + code)()
      const res = selected.testFn(fn)
      setResults(res)
    } catch (e) {
      setResults([{ input: '—', expected: '—', got: 'Syntax Error: ' + e.message, pass: false }])
    }
  }

  const runStress = () => {
    if (!selected || !selected.stressGen || !selected.bruteFn) return
    setStressResult(null)
    try {
      const userFn = new Function('return ' + code)()
      let failCase = null
      for (let i = 0; i < stressCount; i++) {
        const tc = selected.stressGen()
        const expected = selected.bruteFn(...tc.args.map(a => Array.isArray(a) ? [...a] : a))
        let userResult
        try {
          userResult = userFn(...tc.args.map(a => Array.isArray(a) ? [...a] : a))
        } catch (e) {
          failCase = { iteration: i + 1, input: JSON.stringify(tc.args), expected: JSON.stringify(expected), got: 'Runtime Error: ' + e.message }
          break
        }
        const expStr = JSON.stringify(Array.isArray(expected) ? expected : expected)
        const gotStr = JSON.stringify(Array.isArray(userResult) ? userResult : userResult)
        if (expStr !== gotStr) {
          failCase = { iteration: i + 1, input: JSON.stringify(tc.args), expected: JSON.stringify(expected), got: JSON.stringify(userResult) }
          break
        }
      }
      if (failCase) {
        setStressResult({ pass: false, ...failCase })
      } else {
        setStressResult({ pass: true, count: stressCount })
      }
    } catch (e) {
      setStressResult({ pass: false, iteration: 0, input: '—', expected: '—', got: 'Syntax Error: ' + e.message })
    }
  }

  const passCount = results ? results.filter(r => r.pass).length : 0
  const totalCount = results ? results.length : 0

  return (
    <div className="pr-page">
      <div className="viz-header">
        <div>
          <span className="section-label">Practice</span>
          <h1 className="viz-title">Practice Lab</h1>
        </div>
        <div className="pr-filters">
          <select className="pr-select" value={topicFilter} onChange={e => setTopicFilter(e.target.value)}>
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="pr-select" value={diffFilter} onChange={e => setDiffFilter(e.target.value)}>
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="pr-body">
        {/* Problem List */}
        <div className="pr-list glass-card">
          <div className="pr-list-title">Problems ({filtered.length})</div>
          {filtered.map(p => (
            <button key={p.id} className={`pr-prob-item ${selected?.id === p.id ? 'active' : ''}`}
              onClick={() => selectProblem(p)}>
              <span className="pr-prob-num">#{p.id}</span>
              <span className="pr-prob-name">{p.title}</span>
              <span className={`pr-diff pr-diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
            </button>
          ))}
        </div>

        {/* Main Area */}
        {selected ? (
          <div className="pr-main">
            {/* Tabs */}
            <div className="pr-tabs">
              <button className={`pr-tab ${tab === 'problem' ? 'active' : ''}`} onClick={() => setTab('problem')}>
                📝 Problem
              </button>
              <button className={`pr-tab ${tab === 'stress' ? 'active' : ''}`} onClick={() => setTab('stress')}>
                🔥 Stress Test
              </button>
            </div>

            <div className="pr-workspace">
              {/* Left: Description / Stress Test */}
              <div className="pr-desc-panel glass-card">
                {tab === 'problem' ? (
                  <>
                    <h2 className="pr-title">{selected.title}
                      <span className={`pr-diff pr-diff-${selected.difficulty.toLowerCase()}`}>{selected.difficulty}</span>
                      <span className="pr-topic-badge">{selected.topic}</span>
                    </h2>
                    <p className="pr-desc-text">{selected.desc}</p>

                    <div className="pr-examples">
                      {selected.examples.map((ex, i) => (
                        <div key={i} className="pr-example">
                          <div className="pr-ex-label">Example {i + 1}</div>
                          <div className="pr-ex-row"><strong>Input:</strong> <code>{ex.input}</code></div>
                          <div className="pr-ex-row"><strong>Output:</strong> <code>{ex.output}</code></div>
                          {ex.explanation && <div className="pr-ex-row"><strong>Explanation:</strong> {ex.explanation}</div>}
                        </div>
                      ))}
                    </div>

                    <div className="pr-constraints">
                      <div className="pr-ex-label">Constraints</div>
                      {selected.constraints.map((c, i) => (
                        <div key={i} className="pr-constraint">• {c}</div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="pr-title">🔥 Stress Tester</h2>
                    <p className="pr-desc-text">
                      Find the test case that breaks your solution. The system generates random inputs, runs your code against a correct brute-force solution, and reports the first mismatch.
                    </p>
                    <p className="pr-desc-text" style={{fontSize:'0.65rem', color:'var(--text-tertiary)'}}>
                      Just like when your CodeChef solution passes samples but fails on hidden test cases — this finds that failing case for you.
                    </p>

                    <div className="pr-stress-config">
                      <label>
                        <span>Test Cases</span>
                        <input type="number" min="10" max="10000" value={stressCount}
                          onChange={e => setStressCount(Number(e.target.value))} />
                      </label>
                      <button className="btn-primary ds-btn" onClick={runStress} style={{flex:1}}>
                        🔥 Run Stress Test ({stressCount} cases)
                      </button>
                    </div>

                    {stressResult && (
                      <div className={`pr-stress-result ${stressResult.pass ? 'pass' : 'fail'}`}>
                        {stressResult.pass ? (
                          <>
                            <div className="pr-stress-icon">✅</div>
                            <div>All <strong>{stressResult.count}</strong> test cases passed!</div>
                          </>
                        ) : (
                          <>
                            <div className="pr-stress-icon">❌</div>
                            <div className="pr-stress-fail-info">
                              <div>Failed on test case <strong>#{stressResult.iteration}</strong></div>
                              <div className="pr-stress-detail">
                                <div><strong>Input:</strong> <code>{stressResult.input}</code></div>
                                <div><strong>Expected:</strong> <code>{stressResult.expected}</code></div>
                                <div><strong>Your output:</strong> <code className="pr-wrong">{stressResult.got}</code></div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right: Code Editor + Results */}
              <div className="pr-editor-panel">
                <div className="pr-editor-header">
                  <div className="pr-dots"><span /><span /><span /></div>
                  <span className="pr-file-name">solution.js</span>
                  <div className="pr-editor-actions">
                    <button className="btn-secondary ds-btn" onClick={() => setCode(selected.template)}>↺ Reset</button>
                    <button className="btn-primary ds-btn" onClick={runTests}>▶ Run Tests</button>
                  </div>
                </div>
                <textarea
                  ref={textareaRef}
                  className="pr-code-editor"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  spellCheck={false}
                />

                {/* Test Results */}
                {results && (
                  <div className="pr-results">
                    <div className={`pr-results-header ${passCount === totalCount ? 'all-pass' : 'some-fail'}`}>
                      {passCount === totalCount ? '✅ All Passed' : `❌ ${passCount}/${totalCount} Passed`}
                    </div>
                    <div className="pr-results-body">
                      {results.map((r, i) => (
                        <div key={i} className={`pr-result-row ${r.pass ? 'pass' : 'fail'}`}>
                          <span className="pr-result-status">{r.pass ? '✓' : '✗'}</span>
                          <div className="pr-result-detail">
                            <div><span className="pr-result-label">Input:</span> <code>{r.input}</code></div>
                            <div><span className="pr-result-label">Expected:</span> <code>{r.expected}</code></div>
                            {!r.pass && <div><span className="pr-result-label">Got:</span> <code className="pr-wrong">{r.got}</code></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="pr-empty glass-card">
            <div className="pr-empty-icon">💻</div>
            <h3>Select a Problem</h3>
            <p>Pick a problem from the list to start coding. Write your solution in JavaScript, run tests, and use the Stress Tester to find edge cases.</p>
          </div>
        )}
      </div>
    </div>
  )
}
