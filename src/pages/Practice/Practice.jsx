import { useState } from 'react'
import './Practice.css'

const defaultSolution = `function solution(arr) {
  // Your solution here
  // Example: sort the array
  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr.length - 1; j++)
      if (arr[j] > arr[j+1])
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
  return arr;
}`

const defaultBrute = `function brute(arr) {
  // Correct brute-force solution
  return [...arr].sort((a, b) => a - b);
}`

const defaultGenerator = `function generate() {
  // Return random input as an array of arguments
  const n = 2 + Math.floor(Math.random() * 15);
  const arr = Array.from({length: n},
    () => Math.floor(Math.random() * 200) - 100);
  return [arr]; // each element = one argument
}`

const templates = [
  {
    name: 'Sorting',
    solution: `function solution(arr) {\n  // Your sorting implementation\n  \n  return arr;\n}`,
    brute: `function brute(arr) {\n  return [...arr].sort((a, b) => a - b);\n}`,
    generator: `function generate() {\n  const n = 2 + Math.floor(Math.random() * 20);\n  const arr = Array.from({length: n}, () => Math.floor(Math.random() * 200) - 100);\n  return [arr];\n}`,
  },
  {
    name: 'Searching',
    solution: `function solution(arr, target) {\n  // Your search implementation\n  // Return index of target or -1\n  \n}`,
    brute: `function brute(arr, target) {\n  return arr.indexOf(target);\n}`,
    generator: `function generate() {\n  const n = 5 + Math.floor(Math.random() * 15);\n  const arr = Array.from({length: n}, () => Math.floor(Math.random() * 50)).sort((a,b)=>a-b);\n  const target = Math.random() > 0.3 ? arr[Math.floor(Math.random()*n)] : 999;\n  return [arr, target];\n}`,
  },
  {
    name: 'Two Sum',
    solution: `function solution(nums, target) {\n  // Return indices of two numbers that add up to target\n  \n}`,
    brute: `function brute(nums, target) {\n  for (let i = 0; i < nums.length; i++)\n    for (let j = i+1; j < nums.length; j++)\n      if (nums[i]+nums[j] === target) return [i,j];\n  return [-1,-1];\n}`,
    generator: `function generate() {\n  const n = 3 + Math.floor(Math.random() * 8);\n  const nums = Array.from({length: n}, () => Math.floor(Math.random() * 100));\n  const i = Math.floor(Math.random()*n), j = (i+1)%n;\n  return [nums, nums[i]+nums[j]];\n}`,
  },
  {
    name: 'Max Subarray',
    solution: `function solution(nums) {\n  // Kadane's algorithm - return max subarray sum\n  \n}`,
    brute: `function brute(nums) {\n  let max = -Infinity;\n  for (let i = 0; i < nums.length; i++) {\n    let s = 0;\n    for (let j = i; j < nums.length; j++) {\n      s += nums[j];\n      max = Math.max(max, s);\n    }\n  }\n  return max;\n}`,
    generator: `function generate() {\n  const n = 1 + Math.floor(Math.random() * 15);\n  const nums = Array.from({length: n}, () => Math.floor(Math.random() * 200) - 100);\n  return [nums];\n}`,
  },
  {
    name: 'Custom (blank)',
    solution: `function solution(/* your params */) {\n  // Write your solution\n  \n}`,
    brute: `function brute(/* same params */) {\n  // Write the correct brute-force\n  \n}`,
    generator: `function generate() {\n  // Return array of arguments\n  // e.g. return [arg1, arg2]\n  return [];\n}`,
  },
]

export default function Practice() {
  const [solCode, setSolCode] = useState(defaultSolution)
  const [bruteCode, setBruteCode] = useState(defaultBrute)
  const [genCode, setGenCode] = useState(defaultGenerator)
  const [testCount, setTestCount] = useState(1000)
  const [results, setResults] = useState(null)
  const [running, setRunning] = useState(false)
  const [failCases, setFailCases] = useState([])

  const loadTemplate = (t) => {
    setSolCode(t.solution)
    setBruteCode(t.brute)
    setGenCode(t.generator)
    setResults(null)
    setFailCases([])
  }

  const runStress = () => {
    setRunning(true)
    setResults(null)
    setFailCases([])

    // Use setTimeout to let UI update
    setTimeout(() => {
      try {
        const solFn = new Function('return ' + solCode)()
        const bruteFn = new Function('return ' + bruteCode)()
        const genFn = new Function('return ' + genCode)()

        const fails = []
        let passed = 0

        for (let i = 0; i < testCount; i++) {
          let args
          try { args = genFn() } catch (e) {
            setResults({ error: `Generator error on case #${i+1}: ${e.message}` })
            setRunning(false); return
          }

          // Deep copy args for both functions
          const argsForSol = JSON.parse(JSON.stringify(args))
          const argsForBrute = JSON.parse(JSON.stringify(args))

          let solResult, bruteResult
          try { solResult = solFn(...argsForSol) } catch (e) {
            fails.push({ num: i+1, input: JSON.stringify(args), expected: '—', got: `Error: ${e.message}` })
            if (fails.length >= 5) break
            continue
          }
          try { bruteResult = bruteFn(...argsForBrute) } catch (e) {
            setResults({ error: `Brute-force error on case #${i+1}: ${e.message}` })
            setRunning(false); return
          }

          const solStr = JSON.stringify(solResult)
          const bruteStr = JSON.stringify(bruteResult)

          if (solStr !== bruteStr) {
            fails.push({ num: i+1, input: JSON.stringify(args), expected: bruteStr, got: solStr })
            if (fails.length >= 5) break // collect up to 5 failing cases
          } else {
            passed++
          }
        }

        setFailCases(fails)
        setResults({
          total: Math.min(testCount, passed + fails.length),
          passed,
          failed: fails.length,
          allPassed: fails.length === 0,
        })
      } catch (e) {
        setResults({ error: `Syntax error: ${e.message}` })
      }
      setRunning(false)
    }, 50)
  }

  return (
    <div className="pr-page">
      <div className="viz-header">
        <div>
          <span className="section-label">Testing</span>
          <h1 className="viz-title">Stress Tester</h1>
        </div>
        <div className="pr-templates">
          {templates.map((t, i) => (
            <button key={i} className="pr-template-btn" onClick={() => loadTemplate(t)}>{t.name}</button>
          ))}
        </div>
      </div>

      <div className="pr-body">
        {/* Three editor panels */}
        <div className="pr-editors">
          {/* Solution */}
          <div className="pr-editor-box">
            <div className="pr-editor-bar">
              <div className="pr-dots"><span /><span /><span /></div>
              <span className="pr-file-name">solution.js</span>
              <span className="pr-badge-sol">YOUR CODE</span>
            </div>
            <textarea className="pr-code-editor" value={solCode} onChange={e => setSolCode(e.target.value)} spellCheck={false} />
          </div>

          {/* Brute Force */}
          <div className="pr-editor-box">
            <div className="pr-editor-bar">
              <div className="pr-dots"><span /><span /><span /></div>
              <span className="pr-file-name">brute.js</span>
              <span className="pr-badge-brute">CORRECT</span>
            </div>
            <textarea className="pr-code-editor" value={bruteCode} onChange={e => setBruteCode(e.target.value)} spellCheck={false} />
          </div>

          {/* Generator */}
          <div className="pr-editor-box">
            <div className="pr-editor-bar">
              <div className="pr-dots"><span /><span /><span /></div>
              <span className="pr-file-name">generator.js</span>
              <span className="pr-badge-gen">TEST GEN</span>
            </div>
            <textarea className="pr-code-editor" value={genCode} onChange={e => setGenCode(e.target.value)} spellCheck={false} />
          </div>
        </div>

        {/* Controls + Results */}
        <div className="pr-bottom">
          <div className="pr-run-bar">
            <div className="pr-run-config">
              <label>
                <span>Test cases:</span>
                <input type="number" min="1" max="100000" value={testCount}
                  onChange={e => setTestCount(Number(e.target.value))} />
              </label>
            </div>
            <button className="btn-primary pr-run-btn" onClick={runStress} disabled={running}>
              {running ? '⏳ Running...' : `🔥 Stress Test (${testCount} cases)`}
            </button>
          </div>

          {/* Results */}
          {results && (
            <div className="pr-results-panel">
              {results.error ? (
                <div className="pr-result-error">
                  <span>❌</span> {results.error}
                </div>
              ) : (
                <>
                  <div className={`pr-result-summary ${results.allPassed ? 'pass' : 'fail'}`}>
                    <div className="pr-result-icon">{results.allPassed ? '✅' : '❌'}</div>
                    <div>
                      <strong>{results.allPassed ? 'All Passed!' : `${results.failed} Failed`}</strong>
                      <span className="pr-result-count">{results.passed}/{results.total} passed</span>
                    </div>
                  </div>

                  {failCases.length > 0 && (
                    <div className="pr-fail-list">
                      <div className="pr-fail-title">Failing Test Cases (first {failCases.length})</div>
                      {failCases.map((fc, i) => (
                        <div key={i} className="pr-fail-case">
                          <div className="pr-fail-num">Case #{fc.num}</div>
                          <div className="pr-fail-row">
                            <strong>Input:</strong> <code>{fc.input}</code>
                          </div>
                          <div className="pr-fail-row">
                            <strong>Expected:</strong> <code className="pr-expected">{fc.expected}</code>
                          </div>
                          <div className="pr-fail-row">
                            <strong>Your output:</strong> <code className="pr-wrong">{fc.got}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
