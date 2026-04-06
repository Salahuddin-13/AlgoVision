import { useState, useRef, useEffect } from 'react'
import './AIAssistant.css'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || ''

const SYSTEM_PROMPT = `You are AlgoVision AI — an expert teaching assistant for data structures and algorithms.

You help students understand:
- Sorting algorithms (bubble, selection, insertion, merge, quick, heap sort)
- Data structures (arrays, linked lists, stacks, queues, trees, graphs, hash tables)
- Graph algorithms (BFS, DFS, Dijkstra, Prim, Kruskal, Floyd-Warshall)
- Dynamic programming (LCS, knapsack, fibonacci, coin change)
- Recursion & backtracking (N-Queens, factorial, fibonacci)
- Greedy algorithms (fractional knapsack, job sequencing)
- Time & space complexity (Big O notation)
- C programming concepts (pointers, structs, malloc/free, arrays)

Rules:
- Be concise but thorough. Use examples and analogies.
- When explaining algorithms, include step-by-step breakdowns.
- Use code snippets in C when helpful.
- If asked about complexity, always explain WHY not just WHAT.
- Be encouraging and supportive — you're teaching students.
- Format responses with markdown for readability.
- Keep responses under 300 words unless the topic requires more depth.`

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey! 👋 I\'m **AlgoVision AI**. Ask me anything about algorithms, data structures, or C programming!\n\nTry: *"Explain BFS vs DFS"* or *"How does quicksort work?"*' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg = { role: 'user', content: text }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch(GROQ_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMsgs.slice(-10), // last 10 messages for context
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t generate a response.'
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: `⚠️ Error: ${e.message}. Please try again.` }])
    }
    setIsTyping(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessage = (text) => {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <>
      {/* Floating Button */}
      <button className={`ai-fab ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant">
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a8 8 0 0 1 8 8c0 3.1-1.8 5.8-4.4 7.1L12 22l-3.6-4.9A8 8 0 0 1 12 2z"/>
            <circle cx="12" cy="10" r="2.5"/>
          </svg>
        )}
        {!isOpen && <span className="ai-fab-pulse"/>}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="ai-panel">
          <div className="ai-header">
            <div className="ai-header-left">
              <div className="ai-avatar">AI</div>
              <div>
                <span className="ai-name">AlgoVision AI</span>
                <span className="ai-status">● Online</span>
              </div>
            </div>
            <button className="ai-clear" onClick={() => setMessages([messages[0]])}>Clear</button>
          </div>

          <div className="ai-messages" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`ai-msg ${msg.role}`}>
                {msg.role === 'assistant' && <div className="ai-msg-avatar">AI</div>}
                <div className="ai-msg-bubble"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
              </div>
            ))}
            {isTyping && (
              <div className="ai-msg assistant">
                <div className="ai-msg-avatar">AI</div>
                <div className="ai-msg-bubble typing">
                  <span/><span/><span/>
                </div>
              </div>
            )}
          </div>

          <div className="ai-input-area">
            <textarea
              ref={inputRef}
              className="ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about algorithms..."
              rows={1}
            />
            <button className="ai-send" onClick={sendMessage} disabled={!input.trim() || isTyping}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
