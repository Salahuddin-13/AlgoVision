/**
 * C Code Execution Engine — Pure JS Interpreter
 *
 * A custom C code interpreter/simulator that handles common C patterns:
 *   - Variable declarations (int, float, double, char, long)
 *   - Arrays (1D & 2D)
 *   - For, while, do-while loops
 *   - If/else/else-if
 *   - Functions with parameters (pass by value)
 *   - Pointers (&, *)
 *   - printf/scanf
 *   - Basic expressions & operators
 *   - Struct definitions
 *   - Recursion (with real call stack tracking)
 *
 * Produces step-by-step execution traces with:
 *   - Accurate line highlighting
 *   - Variable state per stack frame
 *   - Call stack tracking
 *   - Console output accumulation
 *   - Heap object visualization (arrays, structs)
 */

/* ──────── TOKENIZER ──────── */

function tokenize(code) {
  const tokens = []
  let i = 0
  while (i < code.length) {
    // Skip whitespace
    if (/\s/.test(code[i])) { i++; continue }
    // Skip single-line comments
    if (code[i] === '/' && code[i+1] === '/') {
      while (i < code.length && code[i] !== '\n') i++
      continue
    }
    // Skip multi-line comments
    if (code[i] === '/' && code[i+1] === '*') {
      i += 2
      while (i < code.length - 1 && !(code[i] === '*' && code[i+1] === '/')) i++
      i += 2
      continue
    }
    // Skip preprocessor directives
    if (code[i] === '#') {
      while (i < code.length && code[i] !== '\n') i++
      continue
    }
    // String literals
    if (code[i] === '"') {
      let s = ''
      i++
      while (i < code.length && code[i] !== '"') {
        if (code[i] === '\\') {
          i++
          if (code[i] === 'n') s += '\n'
          else if (code[i] === 't') s += '\t'
          else if (code[i] === '\\') s += '\\'
          else if (code[i] === '"') s += '"'
          else s += code[i]
        } else {
          s += code[i]
        }
        i++
      }
      tokens.push({ type: 'STRING', value: s })
      i++
      continue
    }
    // Char literals
    if (code[i] === "'") {
      i++
      let c = code[i]
      if (c === '\\') { i++; c = code[i] === 'n' ? '\n' : code[i] === 't' ? '\t' : code[i] }
      tokens.push({ type: 'CHAR', value: c })
      i++
      if (code[i] === "'") i++
      continue
    }
    // Numbers
    if (/[0-9]/.test(code[i]) || (code[i] === '-' && /[0-9]/.test(code[i+1]) && (tokens.length === 0 || ['(', ',', '=', '<', '>', '+', '-', '*', '/', '%', '!', '&', '|', ';', '{', '[', '?', ':'].includes(tokens[tokens.length-1]?.value)))) {
      let num = ''
      if (code[i] === '-') { num += '-'; i++ }
      while (i < code.length && /[0-9.]/.test(code[i])) { num += code[i]; i++ }
      tokens.push({ type: 'NUMBER', value: num.includes('.') ? parseFloat(num) : parseInt(num) })
      continue
    }
    // Identifiers & keywords
    if (/[a-zA-Z_]/.test(code[i])) {
      let id = ''
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) { id += code[i]; i++ }
      const keywords = ['int','float','double','char','long','short','unsigned','void','if','else','for','while','do','return','break','continue','struct','const','sizeof','switch','case','default','typedef','using','namespace','std']
      tokens.push({ type: keywords.includes(id) ? 'KEYWORD' : 'IDENT', value: id })
      continue
    }
    // Multi-char operators
    const op2 = code.substring(i, i+2)
    if (['==','!=','<=','>=','++','--','+=','-=','*=','/=','%=','&&','||','<<','>>','->'].includes(op2)) {
      tokens.push({ type: 'OP', value: op2 })
      i += 2
      continue
    }
    // Single-char operators & punctuation
    tokens.push({ type: 'OP', value: code[i] })
    i++
  }
  return tokens
}

/* ──────── LINE MAPPING ──────── */

function buildLineMap(code) {
  // Map character offset → line number
  const lines = code.split('\n')
  const map = []
  let offset = 0
  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j <= lines[i].length; j++) {
      map[offset + j] = i
    }
    offset += lines[i].length + 1
  }
  return map
}

/* ──────── INTERPRETER ──────── */

export function runCCode(code, stdin = '') {
  const steps = []
  const output = []
  const lines = code.split('\n')
  let error = null

  // The interpreter state
  const globalVars = {}
  const functions = {}
  const callStack = []  // [{ name, locals, params }]
  const heapObjects = [] // arrays, structs on heap
  let stepCount = 0
  const MAX_STEPS = 5000
  let stdinBuf = stdin

  // ── Parse functions first ──
  parseFunctions(code, functions)

  // ── Record a step ──
  function recordStep(lineNum, desc) {
    stepCount++
    if (stepCount > MAX_STEPS) throw new Error('Step limit exceeded (possible infinite loop)')

    const frames = []
    // Build frames from call stack (top = most recent)
    for (let i = callStack.length - 1; i >= 0; i--) {
      const f = callStack[i]
      const locals = {}
      for (const [k, v] of Object.entries(f.locals)) {
        locals[k] = cloneVar(v)
      }
      frames.push({ name: f.name, locals, isCurrent: i === callStack.length - 1 })
    }

    // Also include global vars if no call stack
    if (frames.length === 0) {
      frames.push({ name: 'global', locals: { ...globalVars }, isCurrent: true })
    }

    // Build heap visualization
    const heap = []
    for (const frame of [callStack[callStack.length - 1] || { locals: globalVars }]) {
      for (const [name, v] of Object.entries(frame.locals || {})) {
        if (v && v.isArray) {
          heap.push({ id: `arr_${name}`, name, type: `${v.type}[${v.val.length}]`, value: [...v.val], isArray: true })
        }
      }
    }

    steps.push({
      line: lineNum,
      frames,
      stdout: output.join(''),
      heap,
      description: desc,
    })
  }

  function cloneVar(v) {
    if (v === null || v === undefined) return v
    if (typeof v === 'object') {
      if (v.isArray) return { ...v, val: [...v.val] }
      return { ...v }
    }
    return v
  }

  // ── Get/Set variable (searches up the call stack) ──
  function getVar(name) {
    // Search from top of call stack down
    for (let i = callStack.length - 1; i >= 0; i--) {
      if (name in callStack[i].locals) return callStack[i].locals[name]
    }
    if (name in globalVars) return globalVars[name]
    return undefined
  }

  function setVar(name, value) {
    for (let i = callStack.length - 1; i >= 0; i--) {
      if (name in callStack[i].locals) {
        callStack[i].locals[name] = value
        return
      }
    }
    if (name in globalVars) {
      globalVars[name] = value
      return
    }
    // New variable in current frame
    if (callStack.length > 0) {
      callStack[callStack.length - 1].locals[name] = value
    } else {
      globalVars[name] = value
    }
  }

  function declareVar(name, value) {
    if (callStack.length > 0) {
      callStack[callStack.length - 1].locals[name] = value
    } else {
      globalVars[name] = value
    }
  }

  // ── Evaluate an expression string ──
  function evalExpr(expr) {
    expr = expr.trim()
    if (expr === '') return 0

    // Handle ternary operator
    const ternaryIdx = findTernary(expr)
    if (ternaryIdx !== -1) {
      const cond = expr.substring(0, ternaryIdx).trim()
      const rest = expr.substring(ternaryIdx + 1)
      const colonIdx = rest.indexOf(':')
      const trueVal = rest.substring(0, colonIdx).trim()
      const falseVal = rest.substring(colonIdx + 1).trim()
      return evalExpr(cond) ? evalExpr(trueVal) : evalExpr(falseVal)
    }

    // Logical OR
    const orIdx = findOp(expr, '||')
    if (orIdx !== -1) {
      return (evalExpr(expr.substring(0, orIdx)) || evalExpr(expr.substring(orIdx + 2))) ? 1 : 0
    }

    // Logical AND
    const andIdx = findOp(expr, '&&')
    if (andIdx !== -1) {
      return (evalExpr(expr.substring(0, andIdx)) && evalExpr(expr.substring(andIdx + 2))) ? 1 : 0
    }

    // Equality
    const eqIdx = findOp(expr, '==')
    if (eqIdx !== -1) return evalExpr(expr.substring(0, eqIdx)) === evalExpr(expr.substring(eqIdx + 2)) ? 1 : 0
    const neqIdx = findOp(expr, '!=')
    if (neqIdx !== -1) return evalExpr(expr.substring(0, neqIdx)) !== evalExpr(expr.substring(neqIdx + 2)) ? 1 : 0

    // Comparison
    const leIdx = findOp(expr, '<=')
    if (leIdx !== -1) return evalExpr(expr.substring(0, leIdx)) <= evalExpr(expr.substring(leIdx + 2)) ? 1 : 0
    const geIdx = findOp(expr, '>=')
    if (geIdx !== -1) return evalExpr(expr.substring(0, geIdx)) >= evalExpr(expr.substring(geIdx + 2)) ? 1 : 0
    const ltIdx = findOp(expr, '<')
    if (ltIdx !== -1) return evalExpr(expr.substring(0, ltIdx)) < evalExpr(expr.substring(ltIdx + 1)) ? 1 : 0
    const gtIdx = findOp(expr, '>')
    if (gtIdx !== -1) return evalExpr(expr.substring(0, gtIdx)) > evalExpr(expr.substring(gtIdx + 1)) ? 1 : 0

    // Addition, Subtraction (right-to-left for left associativity, find last)
    const addIdx = findLastOp(expr, '+')
    if (addIdx > 0 && expr[addIdx-1] !== '+') return evalExpr(expr.substring(0, addIdx)) + evalExpr(expr.substring(addIdx + 1))
    const subIdx = findLastOp(expr, '-')
    if (subIdx > 0 && expr[subIdx-1] !== '-') return evalExpr(expr.substring(0, subIdx)) - evalExpr(expr.substring(subIdx + 1))

    // Multiplication, Division, Modulo
    const mulIdx = findLastOp(expr, '*')
    if (mulIdx !== -1 && expr[mulIdx-1] !== '*') return evalExpr(expr.substring(0, mulIdx)) * evalExpr(expr.substring(mulIdx + 1))
    const divIdx = findLastOp(expr, '/')
    if (divIdx !== -1) {
      const right = evalExpr(expr.substring(divIdx + 1))
      const left = evalExpr(expr.substring(0, divIdx))
      if (right === 0) return 0
      return Math.trunc(left / right)  // Integer division for C
    }
    const modIdx = findLastOp(expr, '%')
    if (modIdx !== -1) return evalExpr(expr.substring(0, modIdx)) % evalExpr(expr.substring(modIdx + 1))

    // Unary NOT
    if (expr.startsWith('!')) return evalExpr(expr.substring(1)) ? 0 : 1

    // Unary minus (only if not a number)
    if (expr.startsWith('-') && expr.length > 1 && /[a-zA-Z(]/.test(expr[1])) {
      return -evalExpr(expr.substring(1))
    }

    // Parentheses
    if (expr.startsWith('(') && findMatchingParen(expr, 0) === expr.length - 1) {
      return evalExpr(expr.substring(1, expr.length - 1))
    }

    // Number literal
    if (/^-?\d+(\.\d+)?$/.test(expr)) return expr.includes('.') ? parseFloat(expr) : parseInt(expr)

    // Char literal
    if (expr.startsWith("'") && expr.endsWith("'")) return expr.charCodeAt(1)

    // sizeof
    if (expr.startsWith('sizeof(')) {
      const inner = expr.substring(7, expr.length - 1)
      if (inner === 'int') return 4
      if (inner === 'float' || inner === 'long') return 4
      if (inner === 'double') return 8
      if (inner === 'char') return 1
      return 4
    }

    // Array access: var[index]
    const arrMatch = expr.match(/^(\w+)\[(.+)\]$/)
    if (arrMatch) {
      const v = getVar(arrMatch[1])
      const idx = evalExpr(arrMatch[2])
      if (v && v.isArray && v.val) return v.val[idx] !== undefined ? v.val[idx] : 0
      return 0
    }

    // Struct member access: var.member
    const memberMatch = expr.match(/^(\w+)\.(\w+)$/)
    if (memberMatch) {
      const v = getVar(memberMatch[1])
      if (v && v.members) return v.members[memberMatch[2]] || 0
      return 0
    }

    // Function call: func(args)
    const funcCallMatch = expr.match(/^(\w+)\((.*)?\)$/)
    if (funcCallMatch) {
      const fname = funcCallMatch[1]
      const argsStr = funcCallMatch[2] || ''

      // Built-in functions
      if (fname === 'abs' || fname === 'fabs') return Math.abs(evalExpr(argsStr))
      if (fname === 'sqrt') return Math.sqrt(evalExpr(argsStr))
      if (fname === 'pow') {
        const args = splitArgs(argsStr)
        return Math.pow(evalExpr(args[0]), evalExpr(args[1]))
      }
      if (fname === 'floor') return Math.floor(evalExpr(argsStr))
      if (fname === 'ceil') return Math.ceil(evalExpr(argsStr))
      if (fname === 'strlen') {
        const v = getVar(argsStr.trim())
        if (v && typeof v.val === 'string') return v.val.length
        return 0
      }

      // User-defined function
      if (functions[fname]) {
        return callFunction(fname, argsStr)
      }
      return 0
    }

    // Variable
    const v = getVar(expr)
    if (v !== undefined) {
      if (typeof v === 'object' && 'val' in v) return v.val
      return v
    }

    // Address-of operator &var
    if (expr.startsWith('&')) {
      return `&${expr.substring(1)}`
    }

    // Dereference *var
    if (expr.startsWith('*')) {
      const ptrName = expr.substring(1)
      const ptr = getVar(ptrName)
      if (ptr && typeof ptr.val === 'string' && ptr.val.startsWith('&')) {
        const targetName = ptr.val.substring(1)
        const target = getVar(targetName)
        if (target && 'val' in target) return target.val
      }
      return 0
    }

    return 0
  }

  // ── Helper: find operator at top-level (not inside parens/brackets) ──
  function findOp(expr, op) {
    let depth = 0
    for (let i = 0; i <= expr.length - op.length; i++) {
      if (expr[i] === '(' || expr[i] === '[') depth++
      else if (expr[i] === ')' || expr[i] === ']') depth--
      else if (depth === 0 && expr.substring(i, i + op.length) === op) {
        // Make sure we're not inside a string
        return i
      }
    }
    return -1
  }

  function findLastOp(expr, op) {
    let depth = 0
    let lastIdx = -1
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(' || expr[i] === '[') depth++
      else if (expr[i] === ')' || expr[i] === ']') depth--
      else if (depth === 0 && expr[i] === op) lastIdx = i
    }
    return lastIdx
  }

  function findTernary(expr) {
    let depth = 0
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(' || expr[i] === '[') depth++
      else if (expr[i] === ')' || expr[i] === ']') depth--
      else if (depth === 0 && expr[i] === '?') return i
    }
    return -1
  }

  function findMatchingParen(s, start) {
    let depth = 0
    for (let i = start; i < s.length; i++) {
      if (s[i] === '(') depth++
      else if (s[i] === ')') { depth--; if (depth === 0) return i }
    }
    return -1
  }

  function splitArgs(argsStr) {
    const args = []
    let depth = 0
    let current = ''
    for (let i = 0; i < argsStr.length; i++) {
      if (argsStr[i] === '(' || argsStr[i] === '[') depth++
      else if (argsStr[i] === ')' || argsStr[i] === ']') depth--
      else if (argsStr[i] === ',' && depth === 0) {
        args.push(current.trim())
        current = ''
        continue
      }
      current += argsStr[i]
    }
    if (current.trim()) args.push(current.trim())
    return args
  }

  // ── Call a user-defined function ──
  function callFunction(fname, argsStr) {
    const func = functions[fname]
    const argValues = argsStr ? splitArgs(argsStr).map(a => evalExpr(a)) : []

    // Push new frame
    const locals = {}
    for (let i = 0; i < func.params.length && i < argValues.length; i++) {
      locals[func.params[i].name] = { val: argValues[i], type: func.params[i].type }
    }

    callStack.push({ name: fname, locals })

    // Find the function line in source and record calling step
    const funcLine = func.bodyStartLine
    recordStep(funcLine, `Call ${fname}(${argValues.join(', ')})`)

    // Execute function body
    const result = executeBlock(func.bodyLines, func.bodyStartLine)

    // Pop frame
    callStack.pop()
    recordStep(funcLine, `Return from ${fname}() → ${result.returnVal !== undefined ? result.returnVal : 'void'}`)

    return result.returnVal !== undefined ? result.returnVal : 0
  }

  // ── Execute a block of source lines ──
  function executeBlock(blockLines, startLine) {
    let i = 0
    while (i < blockLines.length) {
      if (stepCount > MAX_STEPS) throw new Error('Step limit exceeded')
      const lineIdx = startLine + i
      const raw = blockLines[i]
      const line = raw.trim()
      i++

      if (!line || line === '{' || line === '}' || line.startsWith('//') || line.startsWith('#') || line.startsWith('using ')) continue

      // ── Variable declaration ──
      const declMatch = line.match(/^(int|float|double|char|long|short|unsigned\s+int|unsigned)\s+(.+);$/)
      if (declMatch) {
        const type = declMatch[1]
        const rest = declMatch[2]

        // Array declaration
        const arrDeclMatch = rest.match(/^(\w+)\[(\d*)\]\s*(?:=\s*\{(.+)\})?$/)
        if (arrDeclMatch) {
          const name = arrDeclMatch[1]
          const size = arrDeclMatch[2] ? parseInt(arrDeclMatch[2]) : 0
          const initVals = arrDeclMatch[3]
            ? arrDeclMatch[3].split(',').map(v => parseInt(v.trim()))
            : Array(size).fill(0)
          declareVar(name, { val: initVals, type, isArray: true })
          recordStep(lineIdx, `Declare ${type} ${name}[${initVals.length}] = [${initVals.join(', ')}]`)
          continue
        }

        // Multiple declarations: int a = 1, b = 2;
        const parts = splitArgs(rest)
        for (const part of parts) {
          const m = part.trim().match(/^(\w+)\s*(?:=\s*(.+))?$/)
          if (m) {
            const name = m[1]
            const val = m[2] ? evalExpr(m[2]) : (type === 'float' || type === 'double' ? 0.0 : 0)
            if (type === 'char' && m[2] && m[2].includes("'")) {
              declareVar(name, { val: m[2].replace(/'/g, ''), type })
            } else {
              declareVar(name, { val, type })
            }
            recordStep(lineIdx, `Declare ${type} ${name} = ${type === 'char' ? `'${val}'` : val}`)
          }
        }
        continue
      }

      // ── Struct declaration with init ──
      const structDeclMatch = line.match(/^struct\s+(\w+)\s+(\w+);$/)
      if (structDeclMatch) {
        declareVar(structDeclMatch[2], { val: {}, type: `struct ${structDeclMatch[1]}`, members: {} })
        recordStep(lineIdx, `Declare struct ${structDeclMatch[1]} ${structDeclMatch[2]}`)
        continue
      }

      // ── Struct member assignment ──
      const memberAssignMatch = line.match(/^(\w+)\.(\w+)\s*=\s*(.+);$/)
      if (memberAssignMatch) {
        const [, objName, member, valExpr] = memberAssignMatch
        const obj = getVar(objName)
        if (obj && obj.members !== undefined) {
          let val = valExpr.trim()
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
          else val = evalExpr(valExpr)
          obj.members[member] = val
          setVar(objName, obj)
          recordStep(lineIdx, `Set ${objName}.${member} = ${val}`)
        }
        continue
      }

      // ── Array element assignment: arr[i] = expr ──
      const arrAssignMatch = line.match(/^(\w+)\[(.+?)\]\s*=\s*(.+);$/)
      if (arrAssignMatch) {
        const [, name, idxExpr, valExpr] = arrAssignMatch
        const v = getVar(name)
        const idx = evalExpr(idxExpr)
        const val = evalExpr(valExpr)
        if (v && v.isArray) {
          v.val[idx] = val
          setVar(name, v)
        }
        recordStep(lineIdx, `Set ${name}[${idx}] = ${val}`)
        continue
      }

      // ── Printf ──
      if (line.startsWith('printf(') || line.startsWith('printf (')) {
        const inner = line.substring(line.indexOf('(') + 1, line.lastIndexOf(')'))
        // Find format string
        const fmtEnd = inner.indexOf('"', 1)
        const fmt = inner.substring(1, fmtEnd)
        const argsStr = inner.substring(fmtEnd + 1).replace(/^\s*,/, '')
        const args = argsStr ? splitArgs(argsStr) : []

        let argIdx = 0
        let result = ''
        let fi = 0
        while (fi < fmt.length) {
          if (fmt[fi] === '%' && fi + 1 < fmt.length) {
            fi++
            // Skip flags/width
            while (fi < fmt.length && /[0-9.\-+]/.test(fmt[fi])) fi++
            const spec = fmt[fi]
            if (argIdx < args.length) {
              const argVal = evalExpr(args[argIdx])
              if (spec === 'd' || spec === 'i') result += Math.trunc(argVal)
              else if (spec === 'f') result += (typeof argVal === 'number' ? argVal.toFixed(6) : argVal)
              else if (spec === 'c') result += String.fromCharCode(typeof argVal === 'string' ? argVal.charCodeAt(0) : argVal)
              else if (spec === 's') result += String(argVal)
              else if (spec === 'l') { fi++; result += Math.trunc(argVal) } // %ld
              else result += argVal
              argIdx++
            }
            fi++
          } else if (fmt[fi] === '\\' && fi + 1 < fmt.length) {
            fi++
            if (fmt[fi] === 'n') result += '\n'
            else if (fmt[fi] === 't') result += '\t'
            else result += fmt[fi]
            fi++
          } else {
            result += fmt[fi]
            fi++
          }
        }
        output.push(result)
        recordStep(lineIdx, `printf → "${result.replace(/\n/g, '\\n')}"`)
        continue
      }

      // ── cout ──
      if (line.startsWith('cout')) {
        const parts = line.replace(/;$/, '').split('<<').map(p => p.trim()).filter(p => p !== 'cout')
        let result = ''
        for (const part of parts) {
          if (part === 'endl') result += '\n'
          else if (part.startsWith('"') && part.endsWith('"')) result += part.slice(1, -1)
          else result += String(evalExpr(part))
        }
        output.push(result)
        recordStep(lineIdx, `cout → "${result.replace(/\n/g, '\\n')}"`)
        continue
      }

      // ── Scanf ──
      if (line.startsWith('scanf(') || line.startsWith('scanf (')) {
        const inner = line.substring(line.indexOf('(') + 1, line.lastIndexOf(')'))
        const argsStr = inner.substring(inner.indexOf('"', 1) + 1).replace(/^\s*,/, '')
        const args = argsStr ? splitArgs(argsStr) : []
        for (const arg of args) {
          const varName = arg.trim().replace(/^&/, '')
          const val = stdinBuf.trim() ? parseInt(stdinBuf.split(/\s+/)[0]) || 0 : 0
          stdinBuf = stdinBuf.replace(/^\s*\S+/, '')
          const v = getVar(varName)
          if (v) { v.val = val; setVar(varName, v) }
          else declareVar(varName, { val, type: 'int' })
        }
        recordStep(lineIdx, `scanf → read input`)
        continue
      }

      // ── For loop ──
      const forMatch = line.match(/^for\s*\((.+?);(.+?);(.+?)\)\s*\{?$/)
      if (forMatch) {
        const [, initExpr, condExpr, updateExpr] = forMatch

        // Execute init
        executeStatement(initExpr.trim(), lineIdx)
        recordStep(lineIdx, `for init: ${initExpr.trim()}`)

        // Find matching closing brace
        const bodyLines = []
        let braceDepth = line.includes('{') ? 1 : 0
        if (!line.includes('{')) {
          // next line should be opening brace or single statement
          if (i < blockLines.length && blockLines[i].trim() === '{') { braceDepth = 1; i++ }
        }
        while (i < blockLines.length && braceDepth > 0) {
          const bl = blockLines[i].trim()
          if (bl.includes('{')) braceDepth += (bl.match(/\{/g) || []).length
          if (bl.includes('}')) braceDepth -= (bl.match(/\}/g) || []).length
          if (braceDepth > 0) bodyLines.push(blockLines[i])
          i++
        }

        // Execute loop
        let loopCount = 0
        while (evalExpr(condExpr.trim()) && loopCount < 200) {
          const result = executeBlock(bodyLines, startLine + i - bodyLines.length)
          if (result.breakHit) break
          if (result.returnVal !== undefined) return result

          // Execute update
          executeStatement(updateExpr.trim(), lineIdx)
          recordStep(lineIdx, `for update: ${updateExpr.trim()}`)
          loopCount++
        }
        continue
      }

      // ── While loop ──
      const whileMatch = line.match(/^while\s*\((.+?)\)\s*\{?$/)
      if (whileMatch) {
        const condExpr = whileMatch[1]

        const bodyLines = []
        let braceDepth = line.includes('{') ? 1 : 0
        if (!line.includes('{')) {
          if (i < blockLines.length && blockLines[i].trim() === '{') { braceDepth = 1; i++ }
        }
        while (i < blockLines.length && braceDepth > 0) {
          const bl = blockLines[i].trim()
          if (bl.includes('{')) braceDepth += (bl.match(/\{/g) || []).length
          if (bl.includes('}')) braceDepth -= (bl.match(/\}/g) || []).length
          if (braceDepth > 0) bodyLines.push(blockLines[i])
          i++
        }

        let loopCount = 0
        while (evalExpr(condExpr) && loopCount < 200) {
          recordStep(lineIdx, `while condition: ${condExpr} → true`)
          const result = executeBlock(bodyLines, startLine + i - bodyLines.length)
          if (result.breakHit) break
          if (result.returnVal !== undefined) return result
          loopCount++
        }
        if (loopCount < 200) {
          recordStep(lineIdx, `while condition: ${condExpr} → false (exit loop)`)
        }
        continue
      }

      // ── Do-while loop ──
      if (line === 'do' || line === 'do {') {
        const bodyLines = []
        let braceDepth = line.includes('{') ? 1 : 0
        if (!line.includes('{')) {
          if (i < blockLines.length && blockLines[i].trim() === '{') { braceDepth = 1; i++ }
        }
        while (i < blockLines.length && braceDepth > 0) {
          const bl = blockLines[i].trim()
          if (bl.includes('{')) braceDepth += (bl.match(/\{/g) || []).length
          if (bl.includes('}')) braceDepth -= (bl.match(/\}/g) || []).length
          if (braceDepth > 0) bodyLines.push(blockLines[i])
          i++
        }

        // Find while condition
        const whileLine = blockLines[i]?.trim() || ''
        const condMatch = whileLine.match(/while\s*\((.+?)\)\s*;/)
        const condExpr = condMatch ? condMatch[1] : '0'
        i++

        let loopCount = 0
        do {
          const result = executeBlock(bodyLines, startLine + i - bodyLines.length - 1)
          if (result.breakHit) break
          if (result.returnVal !== undefined) return result
          loopCount++
          recordStep(lineIdx, `do-while check: ${condExpr}`)
        } while (evalExpr(condExpr) && loopCount < 200)
        continue
      }

      // ── If/else ──
      const ifMatch = line.match(/^if\s*\((.+?)\)\s*\{?$/)
      if (ifMatch) {
        const condExpr = ifMatch[1]
        const condVal = evalExpr(condExpr)
        recordStep(lineIdx, `if (${condExpr}) → ${condVal ? 'true' : 'false'}`)

        // Collect if-body
        const ifBody = []
        let braceDepth = line.includes('{') ? 1 : 0
        if (!line.includes('{')) {
          if (i < blockLines.length && blockLines[i].trim() === '{') { braceDepth = 1; i++ }
          else { ifBody.push(blockLines[i]); i++; braceDepth = 0 }
        }
        if (braceDepth > 0) {
          while (i < blockLines.length && braceDepth > 0) {
            const bl = blockLines[i].trim()
            if (bl.includes('{')) braceDepth += (bl.match(/\{/g) || []).length
            if (bl.includes('}')) braceDepth -= (bl.match(/\}/g) || []).length
            if (braceDepth > 0) ifBody.push(blockLines[i])
            i++
          }
        }

        // Check for else/else-if
        let elseBody = []
        const elseLine = blockLines[i]?.trim() || ''
        if (elseLine.startsWith('else if') || elseLine === 'else' || elseLine === 'else {' || elseLine.startsWith('} else')) {
          let nextLine = elseLine.replace(/^\}\s*/, '')
          if (nextLine.startsWith('else if')) {
            // Re-parse as if statement
            if (condVal) {
              const result = executeBlock(ifBody, startLine + i - ifBody.length)
              if (result.returnVal !== undefined) return result
            }
            // Skip the else-if block
            braceDepth = nextLine.includes('{') ? 1 : 0
            i++
            if (!nextLine.includes('{')) {
              if (i < blockLines.length && blockLines[i].trim() === '{') { braceDepth = 1; i++ }
            }
            if (braceDepth > 0) {
              while (i < blockLines.length && braceDepth > 0) {
                const bl = blockLines[i].trim()
                if (bl.includes('{')) braceDepth += (bl.match(/\{/g) || []).length
                if (bl.includes('}')) braceDepth -= (bl.match(/\}/g) || []).length
                if (!condVal && braceDepth > 0) elseBody.push(blockLines[i])
                i++
              }
            }
            if (!condVal) {
              // Execute the else-if as a new block
              const combinedLine = nextLine
              const result = executeBlock([combinedLine, ...elseBody], startLine + i - elseBody.length - 1)
              if (result.returnVal !== undefined) return result
            }
            continue
          } else {
            // Plain else
            i++
            braceDepth = nextLine.includes('{') || (blockLines[i-1]?.trim().includes('{')) ? 1 : 0
            if (braceDepth === 0 && i < blockLines.length && blockLines[i].trim() === '{') { braceDepth = 1; i++ }
            if (braceDepth > 0) {
              while (i < blockLines.length && braceDepth > 0) {
                const bl = blockLines[i].trim()
                if (bl.includes('{')) braceDepth += (bl.match(/\{/g) || []).length
                if (bl.includes('}')) braceDepth -= (bl.match(/\}/g) || []).length
                if (braceDepth > 0) elseBody.push(blockLines[i])
                i++
              }
            }
          }
        }

        if (condVal) {
          const result = executeBlock(ifBody, startLine + lineIdx - startLine - ifBody.length + 1)
          if (result.returnVal !== undefined) return result
        } else if (elseBody.length > 0) {
          const result = executeBlock(elseBody, startLine + i - elseBody.length)
          if (result.returnVal !== undefined) return result
        }
        continue
      }

      // ── Return ──
      const returnMatch = line.match(/^return\s*(.*?);$/)
      if (returnMatch) {
        const retVal = returnMatch[1] ? evalExpr(returnMatch[1]) : undefined
        recordStep(lineIdx, `return ${retVal !== undefined ? retVal : ''}`)
        return { returnVal: retVal }
      }

      // ── Break ──
      if (line === 'break;') {
        recordStep(lineIdx, 'break')
        return { breakHit: true }
      }

      // ── Continue ──
      if (line === 'continue;') {
        return { continueHit: true }
      }

      // ── Assignment ──
      const assignMatch = line.match(/^(\w+)\s*(=|\+=|-=|\*=|\/=|%=)\s*(.+);$/)
      if (assignMatch) {
        const [, name, op, exprStr] = assignMatch
        const v = getVar(name)
        let newVal
        const exprVal = evalExpr(exprStr)

        if (op === '=') newVal = exprVal
        else if (op === '+=') newVal = (v ? (typeof v === 'object' ? v.val : v) : 0) + exprVal
        else if (op === '-=') newVal = (v ? (typeof v === 'object' ? v.val : v) : 0) - exprVal
        else if (op === '*=') newVal = (v ? (typeof v === 'object' ? v.val : v) : 0) * exprVal
        else if (op === '/=') newVal = Math.trunc((v ? (typeof v === 'object' ? v.val : v) : 0) / exprVal)
        else if (op === '%=') newVal = (v ? (typeof v === 'object' ? v.val : v) : 0) % exprVal

        if (v && typeof v === 'object') {
          v.val = newVal
          setVar(name, v)
        } else {
          setVar(name, { val: newVal, type: v?.type || 'int' })
        }
        recordStep(lineIdx, `${name} ${op} ${exprStr} → ${newVal}`)
        continue
      }

      // ── Increment/Decrement ──
      const incMatch = line.match(/^(\w+)(\+\+|--);$/)
      if (incMatch) {
        const [, name, op] = incMatch
        const v = getVar(name)
        if (v && typeof v === 'object') {
          v.val = op === '++' ? v.val + 1 : v.val - 1
          setVar(name, v)
          recordStep(lineIdx, `${name}${op} → ${v.val}`)
        }
        continue
      }

      // ── Function call as statement ──
      const funcStmtMatch = line.match(/^(\w+)\((.*)?\);$/)
      if (funcStmtMatch && funcStmtMatch[1] !== 'printf' && funcStmtMatch[1] !== 'scanf') {
        const fname = funcStmtMatch[1]
        const argsStr = funcStmtMatch[2] || ''
        if (functions[fname]) {
          callFunction(fname, argsStr)
        }
        continue
      }

      // ── Variable declaration with function call: int x = func(); ──
      const declFuncMatch = line.match(/^(int|float|double|char|long)\s+(\w+)\s*=\s*(\w+)\((.*)?\);$/)
      if (declFuncMatch) {
        const [, type, name, fname, argsStr] = declFuncMatch
        let val
        if (functions[fname]) {
          val = callFunction(fname, argsStr || '')
        } else {
          val = evalExpr(`${fname}(${argsStr || ''})`)
        }
        declareVar(name, { val, type })
        recordStep(lineIdx, `Declare ${type} ${name} = ${fname}(${argsStr || ''}) → ${val}`)
        continue
      }

      // ── Struct definitions (skip) ──
      if (line.startsWith('struct ') && line.includes('{')) {
        let braceDepth = 1
        while (i < blockLines.length && braceDepth > 0) {
          const bl = blockLines[i].trim()
          if (bl.includes('{')) braceDepth++
          if (bl.includes('}')) braceDepth--
          i++
        }
        continue
      }

      // ── Function definitions (skip, already parsed) ──
      if (line.match(/^(int|float|double|char|void|long)\s+\w+\s*\(/) && !line.includes('=') && line !== 'int main() {') {
        let braceDepth = line.includes('{') ? 1 : 0
        while (i < blockLines.length) {
          const bl = blockLines[i].trim()
          if (bl.includes('{')) braceDepth++
          if (bl.includes('}')) braceDepth--
          i++
          if (braceDepth <= 0) break
        }
        continue
      }
    }

    return {}
  }

  // Helper to execute a single statement string
  function executeStatement(stmt, lineIdx) {
    stmt = stmt.trim()
    // Declaration
    const declMatch = stmt.match(/^(int|float|double|char|long)\s+(\w+)\s*=\s*(.+)$/)
    if (declMatch) {
      const [, type, name, expr] = declMatch
      const val = evalExpr(expr)
      declareVar(name, { val, type })
      return
    }
    // Assignment
    const assignMatch = stmt.match(/^(\w+)\s*(=|\+=|-=|\*=|\/=|%=)\s*(.+)$/)
    if (assignMatch) {
      const [, name, op, expr] = assignMatch
      const v = getVar(name)
      const exprVal = evalExpr(expr)
      let newVal
      if (op === '=') newVal = exprVal
      else if (op === '+=') newVal = (v ? (typeof v === 'object' ? v.val : v) : 0) + exprVal
      else if (op === '-=') newVal = (v ? (typeof v === 'object' ? v.val : v) : 0) - exprVal
      else if (op === '*=') newVal = (v ? (typeof v === 'object' ? v.val : v) : 0) * exprVal
      else if (op === '/=') newVal = Math.trunc((v ? (typeof v === 'object' ? v.val : v) : 0) / exprVal)
      else if (op === '%=') newVal = (v ? (typeof v === 'object' ? v.val : v) : 0) % exprVal
      if (v && typeof v === 'object') { v.val = newVal; setVar(name, v) }
      else setVar(name, { val: newVal, type: 'int' })
      return
    }
    // Increment/Decrement
    const incMatch = stmt.match(/^(\w+)(\+\+|--)$/)
    if (incMatch) {
      const [, name, op] = incMatch
      const v = getVar(name)
      if (v && typeof v === 'object') {
        v.val = op === '++' ? v.val + 1 : v.val - 1
        setVar(name, v)
      }
      return
    }
    // Array assignment
    const arrMatch = stmt.match(/^(\w+)\[(.+?)\]\s*=\s*(.+)$/)
    if (arrMatch) {
      const [, name, idxExpr, valExpr] = arrMatch
      const v = getVar(name)
      const idx = evalExpr(idxExpr)
      const val = evalExpr(valExpr)
      if (v && v.isArray) { v.val[idx] = val; setVar(name, v) }
    }
  }

  // ── Parse function definitions ──
  function parseFunctions(code, funcs) {
    const lines = code.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const funcMatch = line.match(/^(int|float|double|char|void|long)\s+(\w+)\s*\(([^)]*)\)\s*\{?$/)
      if (funcMatch && funcMatch[2] !== 'main') {
        const retType = funcMatch[1]
        const name = funcMatch[2]
        const paramStr = funcMatch[3]
        const params = paramStr ? paramStr.split(',').map(p => {
          const parts = p.trim().split(/\s+/)
          const pName = parts[parts.length - 1].replace(/^\*/, '')
          const pType = parts.slice(0, -1).join(' ')
          return { name: pName, type: pType || 'int' }
        }) : []

        // Find body
        let braceDepth = line.includes('{') ? 1 : 0
        const bodyStartIdx = i + (line.includes('{') ? 1 : 2)
        let j = i + 1
        if (!line.includes('{')) {
          while (j < lines.length && !lines[j].trim().includes('{')) j++
          braceDepth = 1
          j++
        }

        const bodyLines = []
        while (j < lines.length && braceDepth > 0) {
          const bl = lines[j].trim()
          if (bl.includes('{')) braceDepth += (bl.match(/\{/g) || []).length
          if (bl.includes('}')) braceDepth -= (bl.match(/\}/g) || []).length
          if (braceDepth > 0) bodyLines.push(lines[j])
          j++
        }

        funcs[name] = { retType, params, bodyLines, bodyStartLine: bodyStartIdx }
      }
    }
  }

  // ── Main execution ──
  try {
    // Find main() and execute
    const mainIdx = lines.findIndex(l => l.trim().match(/^(int|void)\s+main\s*\(/))
    if (mainIdx === -1) {
      // No main function, try executing everything
      callStack.push({ name: 'global', locals: {} })
      recordStep(0, 'Program start')
      executeBlock(lines, 0)
    } else {
      callStack.push({ name: 'main', locals: {} })
      recordStep(mainIdx, 'Enter main()')

      // Find main body
      let braceStart = mainIdx
      while (braceStart < lines.length && !lines[braceStart].includes('{')) braceStart++
      braceStart++

      let braceDepth = 1
      const mainBody = []
      let j = braceStart
      while (j < lines.length && braceDepth > 0) {
        const bl = lines[j].trim()
        if (bl.includes('{')) braceDepth += (bl.match(/\{/g) || []).length
        if (bl.includes('}')) braceDepth -= (bl.match(/\}/g) || []).length
        if (braceDepth > 0) mainBody.push(lines[j])
        j++
      }

      executeBlock(mainBody, braceStart)
      recordStep(j - 1, 'Program ended')
    }
  } catch (e) {
    error = e.message
  }

  return {
    steps,
    error,
    finalOutput: output.join(''),
  }
}
