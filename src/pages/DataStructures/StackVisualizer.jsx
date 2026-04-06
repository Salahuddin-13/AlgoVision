import { useState } from 'react'
import CodePanel from '../../components/CodePanel/CodePanel'
import '../Sorting/Sorting.css'
import './DS.css'

const MAX_SIZE = 10

/* ── Code definitions ── */
const arrayPushCode = [
  'void push(int stack[], int *top, int val) {',
  '    if (*top >= MAX_SIZE - 1) {',
  '        printf("Stack Overflow\\n");',
  '        return;',
  '    }',
  '    (*top)++;',
  '    stack[*top] = val;',
  '    printf("Pushed %d\\n", val);',
  '}',
]
const arrayPopCode = [
  'int pop(int stack[], int *top) {',
  '    if (*top < 0) {',
  '        printf("Stack Underflow\\n");',
  '        return -1;',
  '    }',
  '    int val = stack[*top];',
  '    (*top)--;',
  '    printf("Popped %d\\n", val);',
  '    return val;',
  '}',
]
const arrayPeekCode = [
  'int peek(int stack[], int top) {',
  '    if (top < 0) {',
  '        printf("Stack is empty\\n");',
  '        return -1;',
  '    }',
  '    return stack[top];',
  '}',
]
const llPushCode = [
  'void push(Node **top, int val) {',
  '    Node *newNode = malloc(sizeof(Node));',
  '    newNode->data = val;',
  '    newNode->next = *top;',
  '    *top = newNode;',
  '    printf("Pushed %d\\n", val);',
  '}',
]
const llPopCode = [
  'int pop(Node **top) {',
  '    if (*top == NULL) {',
  '        printf("Stack Underflow\\n");',
  '        return -1;',
  '    }',
  '    Node *temp = *top;',
  '    int val = temp->data;',
  '    *top = (*top)->next;',
  '    free(temp);',
  '    return val;',
  '}',
]

/* ── Simulated pointer addresses ── */
let addrCounter = 0x1A00
function nextAddr() { addrCounter += 0x10; return '0x' + addrCounter.toString(16).toUpperCase() }

export default function StackVisualizer() {
  const [tab, setTab] = useState('array')
  // Array stack state
  const [arrStack, setArrStack] = useState([])
  const [arrInput, setArrInput] = useState('')
  const [arrHighlight, setArrHighlight] = useState(-1)
  const [arrMsg, setArrMsg] = useState('Push elements onto the stack.')
  const [arrCodeLines, setArrCodeLines] = useState(arrayPushCode)
  const [arrCurrentLine, setArrCurrentLine] = useState(-1)
  const [arrVars, setArrVars] = useState({})

  // Linked list stack state
  const [llStack, setLlStack] = useState([]) // [{val, addr}]
  const [llInput, setLlInput] = useState('')
  const [llHighlight, setLlHighlight] = useState(-1)
  const [llMsg, setLlMsg] = useState('Push elements onto the linked list stack.')
  const [llCodeLines, setLlCodeLines] = useState(llPushCode)
  const [llCurrentLine, setLlCurrentLine] = useState(-1)
  const [llVars, setLlVars] = useState({})

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))

  /* ═══ ARRAY STACK OPERATIONS ═══ */
  const arrPush = async () => {
    const val = parseInt(arrInput)
    if (isNaN(val)) return
    if (arrStack.length >= MAX_SIZE) {
      setArrMsg('⚠ Stack Overflow! Max capacity reached.')
      setArrCodeLines(arrayPushCode); setArrCurrentLine(1); setArrVars({ top: arrStack.length - 1, MAX_SIZE })
      await sleep(600); setArrCurrentLine(2); await sleep(600); setArrCurrentLine(-1)
      return
    }
    setArrCodeLines(arrayPushCode)
    setArrVars({ top: arrStack.length - 1, val })
    setArrCurrentLine(5); await sleep(400)
    const newStack = [...arrStack, val]
    setArrVars({ top: newStack.length - 1, val })
    setArrCurrentLine(6); await sleep(400)
    setArrStack(newStack)
    setArrHighlight(newStack.length - 1)
    setArrCurrentLine(7)
    setArrMsg(`Pushed ${val} — top = ${newStack.length - 1}`)
    setArrInput('')
    await sleep(600)
    setArrHighlight(-1); setArrCurrentLine(-1)
  }

  const arrPop = async () => {
    if (arrStack.length === 0) {
      setArrMsg('⚠ Stack Underflow! Stack is empty.')
      setArrCodeLines(arrayPopCode); setArrCurrentLine(1); setArrVars({ top: -1 })
      await sleep(600); setArrCurrentLine(2); await sleep(600); setArrCurrentLine(-1)
      return
    }
    setArrCodeLines(arrayPopCode)
    const val = arrStack[arrStack.length - 1]
    setArrCurrentLine(5); setArrVars({ top: arrStack.length - 1, val }); await sleep(400)
    setArrHighlight(arrStack.length - 1); await sleep(400)
    setArrCurrentLine(6); setArrVars({ top: arrStack.length - 2, val }); await sleep(400)
    setArrStack(arrStack.slice(0, -1))
    setArrCurrentLine(7)
    setArrMsg(`Popped ${val} — top = ${arrStack.length - 2}`)
    await sleep(600)
    setArrHighlight(-1); setArrCurrentLine(-1)
  }

  const arrPeek = async () => {
    if (arrStack.length === 0) {
      setArrMsg('Stack is empty — nothing to peek.'); return
    }
    setArrCodeLines(arrayPeekCode)
    setArrCurrentLine(4); setArrVars({ top: arrStack.length - 1 }); await sleep(400)
    setArrHighlight(arrStack.length - 1)
    setArrVars({ top: arrStack.length - 1, 'stack[top]': arrStack[arrStack.length - 1] })
    setArrMsg(`Top element: ${arrStack[arrStack.length - 1]}`)
    await sleep(1000)
    setArrHighlight(-1); setArrCurrentLine(-1)
  }

  /* ═══ LINKED LIST STACK OPERATIONS ═══ */
  const llPush = async () => {
    const val = parseInt(llInput)
    if (isNaN(val)) return
    setLlCodeLines(llPushCode)
    const addr = nextAddr()
    setLlCurrentLine(1); setLlVars({ val }); await sleep(400)
    setLlCurrentLine(2); setLlVars({ val, 'newNode->data': val }); await sleep(400)
    setLlCurrentLine(3)
    const topAddr = llStack.length > 0 ? llStack[0].addr : 'NULL'
    setLlVars({ val, 'newNode->next': topAddr }); await sleep(400)
    const newStack = [{ val, addr }, ...llStack]
    setLlStack(newStack)
    setLlCurrentLine(4); setLlVars({ val, '*top': addr }); await sleep(400)
    setLlHighlight(0)
    setLlCurrentLine(5)
    setLlMsg(`Pushed ${val} at ${addr}`)
    setLlInput('')
    await sleep(600)
    setLlHighlight(-1); setLlCurrentLine(-1)
  }

  const llPop = async () => {
    if (llStack.length === 0) {
      setLlMsg('⚠ Stack Underflow!'); setLlCodeLines(llPopCode)
      setLlCurrentLine(1); await sleep(600); setLlCurrentLine(2); await sleep(600); setLlCurrentLine(-1)
      return
    }
    setLlCodeLines(llPopCode)
    const top = llStack[0]
    setLlCurrentLine(5); setLlVars({ 'temp': top.addr }); await sleep(400)
    setLlCurrentLine(6); setLlVars({ 'temp': top.addr, val: top.val }); await sleep(400)
    setLlHighlight(0); await sleep(400)
    setLlCurrentLine(7)
    const nextTop = llStack.length > 1 ? llStack[1].addr : 'NULL'
    setLlVars({ val: top.val, '*top': nextTop }); await sleep(400)
    setLlStack(llStack.slice(1))
    setLlCurrentLine(8); setLlMsg(`Popped ${top.val} from ${top.addr}`)
    await sleep(600)
    setLlHighlight(-1); setLlCurrentLine(-1)
  }

  return (
    <div className="ds-page">
      <div className="viz-header">
        <div>
          <span className="section-label">Data Structures</span>
          <h1 className="viz-title">Stack (LIFO)</h1>
        </div>
        <div className="gt-tabs">
          <button className={`gt-tab ${tab === 'array' ? 'active' : ''}`} onClick={() => setTab('array')}>
            📦 Array Stack
          </button>
          <button className={`gt-tab ${tab === 'linked' ? 'active' : ''}`} onClick={() => setTab('linked')}>
            🔗 Linked List Stack
          </button>
        </div>
      </div>

      {tab === 'array' ? (
        /* ═══════ ARRAY STACK ═══════ */
        <div className="stack-layout">
          <div className="ds-canvas glass-card">
            <div className="arr-stack-container">
              {/* Container walls */}
              <div className="arr-stack-wrapper">
                <div className="arr-stack-maxline">
                  <span>MAX ({MAX_SIZE})</span>
                </div>
                <div className="arr-stack-body">
                  {/* Empty slots */}
                  {Array.from({ length: MAX_SIZE }).map((_, i) => {
                    const slotIdx = MAX_SIZE - 1 - i
                    const hasVal = slotIdx < arrStack.length
                    return (
                      <div key={i} className={`arr-slot ${hasVal ? 'filled' : ''} ${arrHighlight === slotIdx ? 'highlight' : ''} ${slotIdx === arrStack.length - 1 && hasVal ? 'is-top' : ''}`}>
                        <span className="arr-slot-idx">{slotIdx}</span>
                        <div className="arr-slot-val">
                          {hasVal ? arrStack[slotIdx] : ''}
                        </div>
                        {slotIdx === arrStack.length - 1 && hasVal && (
                          <span className="arr-top-ptr">← TOP</span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="arr-stack-bottom">BOTTOM</div>
              </div>

              <div className="stack-info">
                <div className="stack-info-item">
                  <span className="stack-info-label">Top Index</span>
                  <span className="stack-info-value">{arrStack.length > 0 ? arrStack.length - 1 : '-1'}</span>
                </div>
                <div className="stack-info-item">
                  <span className="stack-info-label">Size</span>
                  <span className="stack-info-value">{arrStack.length}</span>
                </div>
                <div className="stack-info-item">
                  <span className="stack-info-label">Empty?</span>
                  <span className="stack-info-value">{arrStack.length === 0 ? 'Yes' : 'No'}</span>
                </div>
                <div className="stack-info-item">
                  <span className="stack-info-label">Full?</span>
                  <span className="stack-info-value">{arrStack.length >= MAX_SIZE ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
            <div className="ds-message">{arrMsg}</div>
          </div>
          <CodePanel code={arrCodeLines} currentLine={arrCurrentLine} variables={arrVars} title="Array Stack — C Code" />
        </div>
      ) : (
        /* ═══════ LINKED LIST STACK ═══════ */
        <div className="stack-layout">
          <div className="ds-canvas glass-card">
            <div className="ll-stack-container">
              {llStack.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">◇</span>
                  <p>Empty stack — TOP → NULL</p>
                </div>
              ) : (
                <div className="ll-stack-chain">
                  <div className="ll-top-label">TOP</div>
                  <svg className="ll-top-arrow" width="30" height="20" viewBox="0 0 30 20">
                    <line x1="0" y1="10" x2="25" y2="10" stroke="var(--accent-primary)" strokeWidth="2" />
                    <polygon points="25,5 30,10 25,15" fill="var(--accent-primary)" />
                  </svg>
                  {llStack.map((node, i) => (
                    <div key={node.addr} className="ll-node-group">
                      <div className={`ll-node ${llHighlight === i ? 'highlight' : ''}`}>
                        <div className="ll-node-data">{node.val}</div>
                        <div className="ll-node-next">
                          {i < llStack.length - 1 ? '→' : '⊘'}
                        </div>
                      </div>
                      <span className="ll-node-addr">{node.addr}</span>
                      {i < llStack.length - 1 && (
                        <svg className="ll-arrow" width="40" height="20" viewBox="0 0 40 20">
                          <line x1="0" y1="10" x2="35" y2="10" stroke="var(--text-tertiary)" strokeWidth="1.5" />
                          <polygon points="35,6 40,10 35,14" fill="var(--text-tertiary)" />
                        </svg>
                      )}
                    </div>
                  ))}
                  <div className="ll-null">NULL</div>
                </div>
              )}

              <div className="stack-info" style={{ marginTop: 'auto' }}>
                <div className="stack-info-item">
                  <span className="stack-info-label">Top</span>
                  <span className="stack-info-value">{llStack.length > 0 ? llStack[0].val : '—'}</span>
                </div>
                <div className="stack-info-item">
                  <span className="stack-info-label">Size</span>
                  <span className="stack-info-value">{llStack.length}</span>
                </div>
                <div className="stack-info-item">
                  <span className="stack-info-label">Top Addr</span>
                  <span className="stack-info-value" style={{fontSize:'0.55rem'}}>{llStack.length > 0 ? llStack[0].addr : 'NULL'}</span>
                </div>
              </div>
            </div>
            <div className="ds-message">{llMsg}</div>
          </div>
          <CodePanel code={llCodeLines} currentLine={llCurrentLine} variables={llVars} title="Linked List Stack — C Code" />
        </div>
      )}

      <div className="ds-controls glass">
        <div className="ds-inputs">
          <div className="control-group">
            <label className="control-label">Value</label>
            <input
              type="number"
              value={tab === 'array' ? arrInput : llInput}
              onChange={e => tab === 'array' ? setArrInput(e.target.value) : setLlInput(e.target.value)}
              placeholder="Enter value"
              className="ds-input"
              onKeyDown={e => e.key === 'Enter' && (tab === 'array' ? arrPush() : llPush())}
            />
          </div>
        </div>
        <div className="ds-buttons">
          <button className="btn-primary ds-btn" onClick={tab === 'array' ? arrPush : llPush}>Push</button>
          <button className="btn-secondary ds-btn" onClick={tab === 'array' ? arrPop : llPop}>Pop</button>
          <button className="btn-secondary ds-btn" onClick={tab === 'array' ? arrPeek : () => {
            if (llStack.length > 0) setLlMsg(`Top: ${llStack[0].val} at ${llStack[0].addr}`)
            else setLlMsg('Stack is empty.')
          }}>Peek</button>
          <button className="btn-secondary ds-btn" onClick={() => {
            if (tab === 'array') { setArrStack([]); setArrMsg('Stack cleared.'); setArrHighlight(-1); setArrCurrentLine(-1) }
            else { setLlStack([]); setLlMsg('Stack cleared.'); setLlHighlight(-1); setLlCurrentLine(-1) }
          }}>Clear</button>
        </div>
      </div>
    </div>
  )
}
