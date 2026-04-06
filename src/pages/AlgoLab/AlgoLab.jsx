import { Link } from 'react-router-dom'
import './AlgoLab.css'

const builtIn = [
  { name: 'Sorting', desc: 'Bubble, Selection, Insertion, Merge, Quick, Heap', path: '/sorting', icon: '📊' },
  { name: 'Linked List', desc: 'Insert, delete, traverse with pointer arrows', path: '/linked-list', icon: '🔗' },
  { name: 'Stack', desc: 'Push, pop, peek with array visualization', path: '/stack', icon: '📚' },
  { name: 'Queue', desc: 'Enqueue, dequeue with circular buffer', path: '/queue', icon: '🚶' },
  { name: 'BST / AVL', desc: 'Insert, delete, search with tree animation', path: '/bst', icon: '🌳' },
  { name: 'Graphs', desc: 'BFS, DFS, Dijkstra, Prim, Kruskal, Floyd', path: '/graph', icon: '🕸️' },
  { name: 'Searching', desc: 'Binary search & linear search step-by-step', path: '/searching', icon: '🔍' },
  { name: 'Recursion', desc: 'Factorial & Fibonacci tree visualization', path: '/recursion', icon: '🔄' },
  { name: 'Greedy', desc: 'Fractional knapsack, job sequencing & more', path: '/greedy', icon: '💰' },
  { name: 'Backtracking', desc: 'N-Queens with board visualization', path: '/backtracking', icon: '♛' },
  { name: 'Dynamic Prog.', desc: 'LCS, 0/1 Knapsack, Fibonacci DP table', path: '/dp', icon: '📋' },
  { name: 'Code Engine', desc: 'Write C code → execute & step-through debug', path: '/code-visualizer', icon: '⚙️' },
  { name: 'Code Debugger', desc: 'Full memory visualization: pointers, heap, structs', path: '/code-debugger', icon: '🔬' },
]

const external = [
  {
    category: 'Data Structures',
    items: [
      { name: 'Stack (Array)', url: 'https://www.cs.usfca.edu/~galles/visualization/StackArray.html' },
      { name: 'Stack (Linked List)', url: 'https://www.cs.usfca.edu/~galles/visualization/StackLL.html' },
      { name: 'Queue (Array)', url: 'https://www.cs.usfca.edu/~galles/visualization/QueueArray.html' },
      { name: 'Queue (Linked List)', url: 'https://www.cs.usfca.edu/~galles/visualization/QueueLL.html' },
    ],
  },
  {
    category: 'Trees',
    items: [
      { name: 'Binary Search Tree', url: 'https://www.cs.usfca.edu/~galles/visualization/BST.html' },
      { name: 'AVL Tree', url: 'https://www.cs.usfca.edu/~galles/visualization/AVLtree.html' },
      { name: 'Red-Black Tree', url: 'https://www.cs.usfca.edu/~galles/visualization/RedBlack.html' },
      { name: 'B-Tree', url: 'https://www.cs.usfca.edu/~galles/visualization/BTree.html' },
      { name: 'B+ Tree', url: 'https://www.cs.usfca.edu/~galles/visualization/BPlusTree.html' },
      { name: 'Heap', url: 'https://www.cs.usfca.edu/~galles/visualization/Heap.html' },
      { name: 'Trie', url: 'https://www.cs.usfca.edu/~galles/visualization/Trie.html' },
      { name: 'Splay Tree', url: 'https://www.cs.usfca.edu/~galles/visualization/SplayTree.html' },
    ],
  },
  {
    category: 'Sorting',
    items: [
      { name: 'Comparison Sort', url: 'https://www.cs.usfca.edu/~galles/visualization/ComparisonSort.html' },
      { name: 'Bucket Sort', url: 'https://www.cs.usfca.edu/~galles/visualization/BucketSort.html' },
      { name: 'Counting Sort', url: 'https://www.cs.usfca.edu/~galles/visualization/CountingSort.html' },
      { name: 'Radix Sort', url: 'https://www.cs.usfca.edu/~galles/visualization/RadixSort.html' },
    ],
  },
  {
    category: 'Graphs',
    items: [
      { name: 'BFS', url: 'https://www.cs.usfca.edu/~galles/visualization/BFS.html' },
      { name: 'DFS', url: 'https://www.cs.usfca.edu/~galles/visualization/DFS.html' },
      { name: 'Dijkstra', url: 'https://www.cs.usfca.edu/~galles/visualization/Dijkstra.html' },
      { name: 'Floyd-Warshall', url: 'https://www.cs.usfca.edu/~galles/visualization/Floyd.html' },
      { name: 'Prim\'s MST', url: 'https://www.cs.usfca.edu/~galles/visualization/Prim.html' },
      { name: 'Kruskal\'s MST', url: 'https://www.cs.usfca.edu/~galles/visualization/Kruskal.html' },
      { name: 'Topological Sort', url: 'https://www.cs.usfca.edu/~galles/visualization/TopoSortDFS.html' },
    ],
  },
  {
    category: 'Hashing',
    items: [
      { name: 'Open Hash (Chaining)', url: 'https://www.cs.usfca.edu/~galles/visualization/OpenHash.html' },
      { name: 'Closed Hash (Probing)', url: 'https://www.cs.usfca.edu/~galles/visualization/ClosedHash.html' },
    ],
  },
  {
    category: 'Recursion & DP',
    items: [
      { name: 'Factorial', url: 'https://www.cs.usfca.edu/~galles/visualization/RecFact.html' },
      { name: 'N-Queens', url: 'https://www.cs.usfca.edu/~galles/visualization/RecQueens.html' },
      { name: 'Fibonacci DP', url: 'https://www.cs.usfca.edu/~galles/visualization/DPFib.html' },
      { name: 'LCS DP', url: 'https://www.cs.usfca.edu/~galles/visualization/DPLCS.html' },
      { name: 'Making Change', url: 'https://www.cs.usfca.edu/~galles/visualization/DPChange.html' },
    ],
  },
  {
    category: 'Others',
    items: [
      { name: 'Disjoint Sets', url: 'https://www.cs.usfca.edu/~galles/visualization/DisjointSets.html' },
      { name: 'Binomial Queue', url: 'https://www.cs.usfca.edu/~galles/visualization/BinomialQueue.html' },
    ],
  },
]

export default function AlgoLab() {
  return (
    <div className="al-page">
      {/* Header */}
      <div className="al-header">
        <span className="al-badge-icon">⚗️</span>
        <div>
          <h1 className="al-title">Algorithm Lab</h1>
          <p className="al-subtitle">All visualizations in one place</p>
        </div>
        <div className="al-stats">
          <div className="al-stat">
            <span className="al-stat-num">{builtIn.length}</span>
            <span className="al-stat-label">Built-in</span>
          </div>
          <div className="al-stat">
            <span className="al-stat-num">{external.reduce((s, c) => s + c.items.length, 0)}</span>
            <span className="al-stat-label">External</span>
          </div>
        </div>
      </div>

      <div className="al-scroll">
        {/* Built-in Section */}
        <div className="al-section">
          <div className="al-section-head">
            <span className="al-section-badge built">BUILT-IN</span>
            <span className="al-section-title">Our Visualizations</span>
            <span className="al-section-desc">Interactive, animated, works everywhere</span>
          </div>
          <div className="al-grid">
            {builtIn.map((item) => (
              <Link key={item.path} to={item.path} className="al-card built">
                <span className="al-card-icon">{item.icon}</span>
                <div className="al-card-info">
                  <span className="al-card-name">{item.name}</span>
                  <span className="al-card-desc">{item.desc}</span>
                </div>
                <span className="al-card-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* External Section */}
        <div className="al-section">
          <div className="al-section-head">
            <span className="al-section-badge ext">EXTERNAL</span>
            <span className="al-section-title">More Visualizations</span>
            <span className="al-section-desc">Opens in a new tab · Powered by USF</span>
          </div>
          {external.map((cat) => (
            <div key={cat.category} className="al-ext-group">
              <h3 className="al-ext-cat">{cat.category}</h3>
              <div className="al-ext-items">
                {cat.items.map((item) => (
                  <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer"
                    className="al-ext-link">
                    {item.name}
                    <span className="al-ext-arrow">↗</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
