import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import Sorting from './pages/Sorting/Sorting'
import LinkedList from './pages/DataStructures/LinkedList'
import StackVisualizer from './pages/DataStructures/StackVisualizer'
import QueueVisualizer from './pages/DataStructures/QueueVisualizer'
import BSTVisualizer from './pages/DataStructures/BSTVisualizer'
import GraphVisualizer from './pages/Graph/GraphVisualizer'
import Searching from './pages/Searching/Searching'
import RecursionTree from './pages/Recursion/RecursionTree'
import NQueens from './pages/Backtracking/NQueens'
import DPVisualizer from './pages/DP/DPVisualizer'
import CodeVisualizer from './pages/CodeVisualizer/CodeVisualizer'
import GreedyVisualizer from './pages/Greedy/GreedyVisualizer'
import AlgoLab from './pages/AlgoLab/AlgoLab'
import CodeDebugger from './pages/CodeDebugger/CodeDebugger'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sorting" element={<Sorting />} />
        <Route path="/linked-list" element={<LinkedList />} />
        <Route path="/stack" element={<StackVisualizer />} />
        <Route path="/queue" element={<QueueVisualizer />} />
        <Route path="/bst" element={<BSTVisualizer />} />
        <Route path="/graph" element={<GraphVisualizer />} />
        <Route path="/searching" element={<Searching />} />
        <Route path="/recursion" element={<RecursionTree />} />
        <Route path="/backtracking" element={<NQueens />} />
        <Route path="/n-queens" element={<NQueens />} />
        <Route path="/dp" element={<DPVisualizer />} />
        <Route path="/greedy" element={<GreedyVisualizer />} />
        <Route path="/code-visualizer" element={<CodeVisualizer />} />
        <Route path="/algo-lab" element={<AlgoLab />} />
        <Route path="/code-debugger" element={<CodeDebugger />} />
      </Routes>
    </Layout>
  )
}

export default App
