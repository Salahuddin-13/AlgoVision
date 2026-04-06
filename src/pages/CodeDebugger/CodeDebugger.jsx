import { useState, useRef } from 'react'
import './CodeDebugger.css'

const defaultCode = `#include <stdio.h>

int main() {
    int x = 10;
    int y = 20;
    int sum = x + y;
    printf("Sum = %d\\n", sum);
    return 0;
}`

const examples = [
  {
    name: 'Variables',
    code: `#include <stdio.h>\n\nint main() {\n    int x = 10;\n    int y = 20;\n    int sum = x + y;\n    printf("Sum = %d\\n", sum);\n    return 0;\n}`,
  },
  {
    name: 'Pointers',
    code: `#include <stdio.h>\n\nint main() {\n    int x = 5;\n    int *ptr = &x;\n    printf("Value: %d\\n", *ptr);\n    *ptr = 10;\n    printf("New value: %d\\n", x);\n    return 0;\n}`,
  },
  {
    name: 'Arrays',
    code: `#include <stdio.h>\n\nint main() {\n    int arr[5] = {10, 20, 30, 40, 50};\n    int sum = 0;\n    for (int i = 0; i < 5; i++) {\n        sum += arr[i];\n    }\n    printf("Sum = %d\\n", sum);\n    return 0;\n}`,
  },
  {
    name: 'Linked List',
    code: `#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Node {\n    int data;\n    struct Node* next;\n} Node;\n\nNode* createNode(int data) {\n    Node* n = (Node*)malloc(sizeof(Node));\n    n->data = data;\n    n->next = NULL;\n    return n;\n}\n\nint main() {\n    Node* head = createNode(1);\n    head->next = createNode(2);\n    head->next->next = createNode(3);\n    \n    Node* curr = head;\n    while (curr) {\n        printf("%d -> ", curr->data);\n        curr = curr->next;\n    }\n    printf("NULL\\n");\n    return 0;\n}`,
  },
  {
    name: 'Recursion',
    code: `#include <stdio.h>\n\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\nint main() {\n    int result = factorial(5);\n    printf("5! = %d\\n", result);\n    return 0;\n}`,
  },
  {
    name: 'Struct',
    code: `#include <stdio.h>\n\ntypedef struct {\n    char name[20];\n    int age;\n    float gpa;\n} Student;\n\nint main() {\n    Student s1 = {"Alice", 20, 3.8};\n    Student s2 = {"Bob", 21, 3.5};\n    printf("%s: age=%d, gpa=%.1f\\n", s1.name, s1.age, s1.gpa);\n    printf("%s: age=%d, gpa=%.1f\\n", s2.name, s2.age, s2.gpa);\n    return 0;\n}`,
  },
  {
    name: 'Malloc / Free',
    code: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n = 5;\n    int *arr = (int*)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) {\n        arr[i] = (i + 1) * 10;\n    }\n    for (int i = 0; i < n; i++) {\n        printf("%d ", arr[i]);\n    }\n    printf("\\n");\n    free(arr);\n    return 0;\n}`,
  },
]

function buildPythonTutorUrl(code) {
  const encoded = encodeURIComponent(code)
  return `https://pythontutor.com/iframe-embed.html#code=${encoded}&codeDivHeight=400&codeDivWidth=350&cumulative=false&curInstr=0&heapPrimitives=nevernested&origin=opt-frontend.js&py=c_gcc9.3.0&rawInputLstJSON=%5B%5D&textReferences=false`
}

export default function CodeDebugger() {
  const [code, setCode] = useState(defaultCode)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [activeExample, setActiveExample] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef(null)

  const handleVisualize = () => {
    setIsLoading(true)
    setIframeUrl(buildPythonTutorUrl(code))
    setTimeout(() => setIsLoading(false), 2000)
  }

  const handleExampleSelect = (ex, i) => {
    setActiveExample(i)
    setCode(ex.code)
    setIframeUrl(null)
  }

  const handleEdit = () => {
    setIframeUrl(null)
  }

  const codeLines = code.split('\n')

  return (
    <div className="cd-page">
      {/* Header */}
      <div className="cd-header">
        <div className="cd-header-left">
          <span className="cd-badge">🔬</span>
          <h1 className="cd-title">Code Debugger</h1>
          <span className="cd-sub">Step-by-step memory visualization</span>
        </div>
      </div>

      {/* Examples */}
      <div className="cd-examples">
        {examples.map((ex, i) => (
          <button key={i} className={`cd-ex-btn ${activeExample === i ? 'active' : ''}`}
            onClick={() => handleExampleSelect(ex, i)}>
            {ex.name}
          </button>
        ))}
      </div>

      {iframeUrl ? (
        /* ── Visualization Mode ── */
        <div className="cd-viz-container">
          <div className="cd-viz-bar">
            <span className="cd-viz-label">🔬 Live Visualization</span>
            <button className="cd-edit-btn" onClick={handleEdit}>✎ Edit Code</button>
          </div>
          {isLoading && (
            <div className="cd-loading-overlay">
              <div className="cd-spin" />
              <p>Loading visualization engine...</p>
            </div>
          )}
          <iframe
            src={iframeUrl}
            className="cd-iframe"
            title="Code Debugger Visualization"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      ) : (
        /* ── Editor Mode ── */
        <div className="cd-editor-container">
          <div className="cd-editor-panel">
            <div className="cd-panel-bar">
              <div className="cd-dots"><span /><span /><span /></div>
              <span className="cd-file">main.c</span>
              <button className="cd-viz-btn" onClick={handleVisualize}>⚡ Visualize</button>
            </div>
            <div className="cd-code-area">
              <div className="cd-lines">
                {codeLines.map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea
                ref={textareaRef}
                className="cd-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>
          <div className="cd-info-panel">
            <div className="cd-info-content">
              <div className="cd-info-icon">🔬</div>
              <h3>Full Memory Visualization</h3>
              <p>Paste any C code and click <strong>⚡ Visualize</strong> to see:</p>
              <div className="cd-feature-list">
                <div className="cd-feat"><span className="check">✓</span> Stack frames & local variables</div>
                <div className="cd-feat"><span className="check">✓</span> Heap memory (malloc/free)</div>
                <div className="cd-feat"><span className="check">✓</span> Pointer arrows & references</div>
                <div className="cd-feat"><span className="check">✓</span> Struct & array visualization</div>
                <div className="cd-feat"><span className="check">✓</span> Linked list node connections</div>
                <div className="cd-feat"><span className="check">✓</span> Recursive call stacks</div>
                <div className="cd-feat"><span className="check">✓</span> Step forward / backward</div>
              </div>
              <p className="cd-info-note">Powered by GCC 9.3.0</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
