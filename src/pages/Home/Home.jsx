import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import './Home.css'

const categories = [
  {
    title: 'Linked Lists',
    desc: 'Trace memory pointers and node allocations in real-time. Visualize single, double, and circular flows with interactive head/tail tracking.',
    icon: '⛓',
    path: '/linked-list',
    cta: 'Explore Linear Flows',
    span: 'wide',
    color: 'cyan',
  },
  {
    title: 'Stacks & Queues',
    desc: 'LIFO and FIFO visualizers with depth indicators and overflow alerts.',
    icon: '◇',
    path: '/stack',
    cta: 'View Stack Ops',
    span: 'normal',
    color: 'green',
  },
  {
    title: 'Trees',
    desc: 'Binary, AVL, and BST trees with balancing animations and traversal visualization.',
    icon: '🌲',
    path: '/bst',
    cta: 'Explore Trees',
    span: 'normal',
    color: 'violet',
  },
  {
    title: 'Sorting',
    desc: 'Compare QuickSort, MergeSort, BubbleSort and HeapSort side-by-side. Analyze swap counts and time complexity visually.',
    icon: '📊',
    path: '/sorting',
    cta: 'Compare Algorithms',
    span: 'normal',
    color: 'blue',
  },
  {
    title: 'Dynamic Programming',
    desc: 'Unpack memoization tables and recursive sub-problems. Turn complex logic into a navigable grid.',
    icon: '🧮',
    path: '/dp',
    cta: 'Solve DP Problems',
    span: 'normal',
    color: 'teal',
  },
  {
    title: 'Graph Algorithms',
    desc: 'Visualize BFS, DFS, Dijkstra\'s shortest path, and MST algorithms on interactive graphs.',
    icon: '🌐',
    path: '/graph',
    cta: 'Explore Graphs',
    span: 'wide',
    color: 'purple',
  },
  {
    title: 'Backtracking',
    desc: 'N-Queens, Sudoku Solver — watch the algorithm explore and prune the decision tree in real time.',
    icon: '♛',
    path: '/n-queens',
    cta: 'Solve N-Queens',
    span: 'normal',
    color: 'orange',
  },
  {
    title: 'Searching',
    desc: 'Binary Search and Linear Search — see how search space narrows with each step.',
    icon: '🔍',
    path: '/searching',
    cta: 'Try Searching',
    span: 'normal',
    color: 'pink',
  },
  {
    title: 'Recursion Tree',
    desc: 'Visualize recursive calls as a tree. See stack frames grow and shrink. Understand memoization overhead.',
    icon: '🔄',
    path: '/recursion',
    cta: 'View Recursion',
    span: 'normal',
    color: 'emerald',
  },
]

export default function Home() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    // Create floating particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`
        ctx.fill()

        // Draw connections 
        particles.forEach((p2, j) => {
          if (j <= i) return
          const dx = p2.x - p.x
          const dy = p2.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.06 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <canvas ref={canvasRef} className="hero-canvas" />
        <div className="hero-content animate-fade-in-up">
          <span className="section-label">Virtual Logic Architecture</span>
          <h1 className="hero-title">
            See the <span className="gradient-text">Invisible</span><br />Logic.
          </h1>
          <p className="hero-desc">
            AlgoVision transforms abstract data structures into interactive blueprints.
            Debug visually, learn architecturally.
          </p>
          <div className="hero-actions">
            <Link to="/sorting" className="btn-primary">
              Initialize Visualizer
            </Link>
            <Link to="/code-visualizer" className="btn-secondary">
              Browse Modules →
            </Link>
          </div>
        </div>
        {/* Floating code snippet preview */}
        <div className="hero-code-preview animate-fade-in" style={{animationDelay: '0.3s'}}>
          <div className="code-window">
            <div className="code-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <pre className="code-content">
              <code>
{`void insert(Node* root, int val) {
  if (val < root->data) {
    if (!root->left)
      root->left = new Node(val);
    else insert(root->left, val);
  }
}`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="feature-section">
        <div className="feature-split">
          <div className="feature-visual">
            <div className="node-preview glass-card">
              <div className="code-dots" style={{marginBottom: '12px'}}>
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="node-info">
                <span className="node-label">Current Node</span>
                <span className="node-addr">0x7ff7b2a4</span>
              </div>
              <h3 className="node-data">Data: "BinarySearch"</h3>
              <div className="node-underline"></div>
              <p className="node-next">Next: 0x7ff7b9c4</p>
            </div>
          </div>
          <div className="feature-text">
            <h2>Every byte tells a story.</h2>
            <p className="section-desc">
              Don't just run code—watch it live. Our visualizer hooks into your execution stack,
              mapping variables to physical shapes. When a pointer shifts, the UI pulses.
              When memory is freed, the schematic fades. It's the ultimate tool for mastering CS concepts.
            </p>
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <div>
                  <strong>Step-by-Step Traversal:</strong>
                  <p>Rewind and fast-forward through your logic flow with granular control.</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <div>
                  <strong>Space-Time Analysis:</strong>
                  <p>Live metrics showing auxiliary space and operation complexity.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="categories-section">
        <span className="section-label">Modules</span>
        <h2 className="section-title">Explore the Architecture</h2>
        <div className="categories-grid">
          {categories.map((cat, i) => (
            <Link
              to={cat.path}
              key={i}
              className={`category-card glass-card ${cat.span === 'wide' ? 'card-wide' : ''} card-${cat.color}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="card-icon">{cat.icon}</div>
              <h3 className="card-title">{cat.title}</h3>
              <p className="card-desc">{cat.desc}</p>
              <span className="card-cta">
                {cat.cta} <span className="arrow">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Build Your Schematic Section */}
      <section className="build-section">
        <div className="build-content">
          <h2 className="section-title">Build Your Schematic</h2>
          <p className="section-desc">
            Write your algorithm in C and see the diagram update instantly.
            Our engine parses your abstract syntax tree to generate a physical model.
          </p>
          <div className="build-options">
            <Link to="/code-visualizer" className="build-option glass-card">
              <div className="build-option-icon" style={{background: 'rgba(0,240,255,0.1)'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <span>Algorithm Parser</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: 'auto'}}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
            <Link to="/code-visualizer" className="build-option glass-card">
              <div className="build-option-icon" style={{background: 'rgba(0,212,170,0.1)'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/>
                </svg>
              </div>
              <span>Memory Profiler</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: 'auto'}}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
