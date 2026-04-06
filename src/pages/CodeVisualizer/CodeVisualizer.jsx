import { useState, useRef, useCallback } from 'react'
import { runCCode } from '../../engines/cEngine'
import './CodeVisualizer.css'

/* ═══════════════════════════════════════════
   EXAMPLES
   ═══════════════════════════════════════════ */
const examples = {
  helloWorld: {
    name: 'Hello World',
    code: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  },
  variables: {
    name: 'Variables',
    code: `#include <stdio.h>

int main() {
    int x = 10;
    int y = 20;
    int sum = x + y;
    printf("Sum = %d\\n", sum);
    return 0;
}`,
  },
  forLoop: {
    name: 'For Loop',
    code: `#include <stdio.h>

int main() {
    int sum = 0;
    for (int i = 1; i <= 5; i++) {
        sum += i;
    }
    printf("Sum = %d\\n", sum);
    return 0;
}`,
  },
  ifElse: {
    name: 'If-Else',
    code: `#include <stdio.h>

int main() {
    int x = 15;
    if (x > 10) {
        printf("x is greater than 10\\n");
    } else {
        printf("x is 10 or less\\n");
    }
    return 0;
}`,
  },
  arrays: {
    name: 'Arrays',
    code: `#include <stdio.h>

int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum += arr[i];
    }
    printf("Sum = %d\\n", sum);
    return 0;
}`,
  },
  bubbleSort: {
    name: 'Bubble Sort',
    code: `#include <stdio.h>

int main() {
    int arr[5] = {64, 34, 25, 12, 22};
    int n = 5;
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
    printf("Sorted: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    return 0;
}`,
  },
  factorial: {
    name: 'Factorial',
    code: `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main() {
    int result = factorial(5);
    printf("5! = %d\\n", result);
    return 0;
}`,
  },
  fibonacci: {
    name: 'Fibonacci',
    code: `#include <stdio.h>

int main() {
    int n = 8;
    int a = 0;
    int b = 1;
    printf("%d ", a);
    printf("%d ", b);
    for (int i = 2; i < n; i++) {
        int c = a + b;
        printf("%d ", c);
        a = b;
        b = c;
    }
    return 0;
}`,
  },
  linearSearch: {
    name: 'Linear Search',
    code: `#include <stdio.h>

int linearSearch(int arr[], int n, int key) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == key) {
            return i;
        }
    }
    return -1;
}

int main() {
    int arr[6] = {5, 3, 8, 1, 9, 2};
    int key = 8;
    int result = linearSearch(arr, 6, key);
    printf("Found %d at index %d\\n", key, result);
    return 0;
}`,
  },
  swap: {
    name: 'Swap',
    code: `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 10;
    int y = 20;
    printf("Before: x=%d, y=%d\\n", x, y);
    swap(&x, &y);
    printf("After: x=%d, y=%d\\n", x, y);
    return 0;
}`,
  },
}

/* ═══════════════════════════════════════════
   WANDBOX API — Code Executor
   ═══════════════════════════════════════════ */
async function executeCode(code, stdin = '') {
  const res = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, compiler: 'gcc-head-c', 'compiler-option-raw': '-lm', stdin }),
  })
  if (!res.ok) throw new Error(`Compilation server error: ${res.status}`)
  const data = await res.json()
  return {
    output: data.program_output || '',
    error: data.compiler_error || data.program_error || '',
    status: data.status || 0,
  }
}

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
function displayValue(v) {
  if (v === null || v === undefined) return '?'
  if (typeof v === 'object') {
    if (v.isArray && Array.isArray(v.val)) return null // rendered separately
    if ('val' in v) {
      if (v.type === 'char') return `'${v.val}'`
      return String(v.val)
    }
    if (v.members) return `{${Object.entries(v.members).map(([k, mv]) => `${k}: ${mv}`).join(', ')}}`
  }
  return String(v)
}

function getArrayVars(locals) {
  return Object.entries(locals).filter(([, v]) => v && typeof v === 'object' && v.isArray && Array.isArray(v.val))
}

function getScalarVars(locals) {
  return Object.entries(locals).filter(([, v]) => {
    if (!v) return false
    if (typeof v === 'object' && v.isArray) return false
    return true
  })
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function CodeVisualizer() {
  const [mode, setMode] = useState('execute') // 'execute' | 'visualize'
  const [code, setCode] = useState(examples.helloWorld.code)
  const [activeExample, setActiveExample] = useState('helloWorld')
  const [stdin, setStdin] = useState('')

  // Execute state
  const [execOutput, setExecOutput] = useState(null)
  const [execError, setExecError] = useState(null)
  const [isRunning, setIsRunning] = useState(false)

  // Visualize state
  const [vizSteps, setVizSteps] = useState(null)
  const [vizError, setVizError] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const playRef = useRef(null)

  const codeLines = code.split('\n')

  const handleExampleSelect = (key) => {
    setActiveExample(key)
    setCode(examples[key].code)
    resetAll()
  }

  const resetAll = () => {
    setExecOutput(null)
    setExecError(null)
    setVizSteps(null)
    setVizError(null)
    setCurrentStep(0)
    stopPlaying()
  }

  // ── Execute ──
  const handleRun = async () => {
    setIsRunning(true)
    setExecOutput(null)
    setExecError(null)
    try {
      const result = await executeCode(code, stdin)
      if (result.error) setExecError(result.error)
      if (result.output) setExecOutput(result.output)
      if (!result.output && !result.error) setExecOutput('(program exited with no output)')
    } catch (e) {
      setExecError(`Connection failed: ${e.message}`)
    }
    setIsRunning(false)
  }

  // ── Visualize ──
  const handleVisualize = useCallback(() => {
    setVizError(null)
    setVizSteps(null)
    try {
      const result = runCCode(code, stdin)
      if (result.error) setVizError(result.error)
      if (result.steps && result.steps.length > 0) {
        setVizSteps(result.steps)
        setCurrentStep(0)
      } else if (!result.error) {
        setVizError('Could not generate steps. Check your code syntax.')
      }
    } catch (e) {
      setVizError(`Engine error: ${e.message}`)
    }
  }, [code, stdin])

  // ── Playback ──
  const startPlaying = () => {
    if (!vizSteps) return
    setIsPlaying(true)
    playRef.current = setInterval(() => {
      setCurrentStep(s => {
        if (s >= vizSteps.length - 1) { stopPlaying(); return s }
        return s + 1
      })
    }, 600)
  }
  const stopPlaying = () => { setIsPlaying(false); clearInterval(playRef.current) }

  const step = vizSteps ? vizSteps[currentStep] : null

  return (
    <div className="cv-page">
      {/* ── Header ── */}
      <div className="cv-header">
        <div className="cv-header-left">
          <span className="cv-badge">C</span>
          <h1 className="cv-title">Code Engine</h1>
          <span className="cv-subtitle">Write · Execute · Visualize</span>
        </div>
        <div className="cv-mode-switch">
          <button className={`cv-mode ${mode === 'execute' ? 'active' : ''}`}
            onClick={() => { setMode('execute'); stopPlaying() }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
            Execute
          </button>
          <button className={`cv-mode ${mode === 'visualize' ? 'active' : ''}`}
            onClick={() => { setMode('visualize'); stopPlaying() }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
            Visualize
          </button>
        </div>
      </div>

      {/* ── Examples ── */}
      <div className="cv-examples">
        {Object.entries(examples).map(([key, val]) => (
          <button key={key} className={`cv-ex-btn ${activeExample === key ? 'active' : ''}`}
            onClick={() => handleExampleSelect(key)}>
            {val.name}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════
           EXECUTE MODE
         ═══════════════════════════════════ */}
      {mode === 'execute' && (
        <div className="cv-layout">
          <div className="cv-panel cv-editor">
            <div className="cv-panel-bar">
              <div className="cv-dots"><span/><span/><span/></div>
              <span className="cv-file">main.c</span>
              <span className="cv-compiler-tag">GCC</span>
              <button className="cv-action-btn run" onClick={handleRun} disabled={isRunning}>
                {isRunning ? <><span className="spin-sm"/>Compiling...</> : <>▶ Run Code</>}
              </button>
            </div>
            <div className="cv-code-area">
              <div className="cv-lines">{codeLines.map((_, i) => <div key={i}>{i + 1}</div>)}</div>
              <textarea className="cv-textarea" value={code}
                onChange={e => { setCode(e.target.value); setExecOutput(null); setExecError(null) }}
                spellCheck={false} />
            </div>
            <div className="cv-stdin-row">
              <label>INPUT</label>
              <input type="text" value={stdin} onChange={e => setStdin(e.target.value)}
                placeholder="stdin (optional)" />
            </div>
          </div>

          <div className="cv-panel cv-output">
            <div className="cv-panel-bar">
              <span className="cv-panel-label">● Output</span>
            </div>
            <div className="cv-output-body">
              {isRunning && <div className="cv-loading"><div className="cv-spin"/><p>Compiling & running...</p></div>}
              {!isRunning && execError && <pre className="cv-err">{execError}</pre>}
              {!isRunning && execOutput && <pre className="cv-out">{execOutput}</pre>}
              {!isRunning && !execOutput && !execError && (
                <div className="cv-placeholder">
                  <div className="cv-ph-icon">▶</div>
                  <p>Click <strong>Run Code</strong> to compile & execute</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════
           VISUALIZE MODE
         ═══════════════════════════════════ */}
      {mode === 'visualize' && (
        <div className="cv-layout viz">
          {/* ── Left: Code Panel ── */}
          <div className="cv-panel cv-editor">
            <div className="cv-panel-bar">
              <div className="cv-dots"><span/><span/><span/></div>
              <span className="cv-file">main.c</span>
              {vizSteps ? (
                <button className="cv-action-btn edit" onClick={() => { setVizSteps(null); setVizError(null); stopPlaying() }}>
                  ✎ Edit
                </button>
              ) : (
                <button className="cv-action-btn run" onClick={handleVisualize}>⚡ Visualize</button>
              )}
            </div>

            {vizSteps ? (
              /* ── Code with line markers ── */
              <div className="cv-code-display">
                {codeLines.map((line, i) => (
                  <div key={i} className={`cv-dline ${step && step.line === i ? 'current' : ''}`}>
                    <span className="cv-dln">{i + 1}</span>
                    {step && step.line === i && <span className="cv-marker">▸</span>}
                    <code>{line || '\u00A0'}</code>
                  </div>
                ))}
              </div>
            ) : (
              /* ── Editable ── */
              <div className="cv-code-area">
                <div className="cv-lines">{codeLines.map((_, i) => <div key={i}>{i + 1}</div>)}</div>
                <textarea className="cv-textarea" value={code}
                  onChange={e => setCode(e.target.value)} spellCheck={false} />
              </div>
            )}

            {/* ── Playback Controls ── */}
            {vizSteps && (
              <div className="cv-controls">
                <button onClick={() => setCurrentStep(0)} disabled={currentStep === 0}>⏮</button>
                <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0}>◀</button>
                {isPlaying ? (
                  <button className="cv-pause" onClick={stopPlaying}>⏸</button>
                ) : (
                  <button className="cv-play" onClick={startPlaying}
                    disabled={currentStep >= vizSteps.length - 1}>▶</button>
                )}
                <button onClick={() => setCurrentStep(s => Math.min(vizSteps.length - 1, s + 1))}
                  disabled={currentStep >= vizSteps.length - 1}>▶</button>
                <button onClick={() => setCurrentStep(vizSteps.length - 1)}
                  disabled={currentStep >= vizSteps.length - 1}>⏭</button>
                <div className="cv-step-info">
                  <span className="cv-step-num">{currentStep + 1}</span>
                  <span className="cv-step-sep">/</span>
                  <span className="cv-step-total">{vizSteps.length}</span>
                </div>
                <input type="range" className="cv-slider" min={0} max={vizSteps.length - 1}
                  value={currentStep} onChange={e => { stopPlaying(); setCurrentStep(parseInt(e.target.value)) }} />
              </div>
            )}
          </div>

          {/* ── Right: Execution State ── */}
          <div className="cv-panel cv-state">
            {vizSteps && step ? (
              <>
                {/* Event */}
                <div className="cv-event">{step.description || 'Program start'}</div>

                {/* Call Stack */}
                <div className="cv-state-section">
                  <div className="cv-section-head">
                    <span className="cv-section-icon">☰</span>
                    CALL STACK
                    <span className="cv-frame-count">{step.frames.length} frame{step.frames.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="cv-frames">
                    {step.frames.map((frame, fi) => (
                      <div key={fi} className={`cv-frame ${frame.isCurrent ? 'active' : ''}`}>
                        <div className="cv-frame-header">
                          <span className="cv-fn-name">{frame.name}()</span>
                          {frame.isCurrent && <span className="cv-active-badge">ACTIVE</span>}
                        </div>
                        {/* Scalar variables */}
                        <div className="cv-var-grid">
                          {getScalarVars(frame.locals).length === 0 && (
                            <div className="cv-no-vars">no variables yet</div>
                          )}
                          {getScalarVars(frame.locals).map(([name, v]) => (
                            <div key={name} className="cv-var-card">
                              <div className="cv-var-label">{name}</div>
                              <div className="cv-var-value">{displayValue(v)}</div>
                              {v && typeof v === 'object' && v.type && (
                                <div className="cv-var-type">{v.type}</div>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* Arrays */}
                        {getArrayVars(frame.locals).map(([name, v]) => (
                          <div key={`arr-${name}`} className="cv-array-section">
                            <div className="cv-array-name">{name}[]</div>
                            <div className="cv-array-row">
                              {v.val.map((cell, ci) => (
                                <div key={ci} className="cv-cell">
                                  <div className="cv-cell-i">{ci}</div>
                                  <div className="cv-cell-v">{cell}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Console */}
                <div className="cv-state-section">
                  <div className="cv-section-head">
                    <span className="cv-section-icon">›_</span>
                    OUTPUT
                  </div>
                  <pre className="cv-console">{step.stdout || '(no output yet)'}</pre>
                </div>
              </>
            ) : vizError ? (
              <div className="cv-error-state">
                <div className="cv-err-icon">⚠</div>
                <h3>Could not visualize</h3>
                <pre>{vizError}</pre>
              </div>
            ) : (
              <div className="cv-empty-state">
                <div className="cv-es-icon">🔬</div>
                <h3>Step-by-Step Visualizer</h3>
                <p>Write any C code and click <strong>⚡ Visualize</strong></p>
                <div className="cv-feature-list">
                  <div className="cv-feat"><span>✓</span> Line-by-line execution</div>
                  <div className="cv-feat"><span>✓</span> Call stack with variables</div>
                  <div className="cv-feat"><span>✓</span> Array visualization</div>
                  <div className="cv-feat"><span>✓</span> Recursion tracking</div>
                  <div className="cv-feat"><span>✓</span> Console output</div>
                  <div className="cv-feat"><span>✓</span> Auto-play mode</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
