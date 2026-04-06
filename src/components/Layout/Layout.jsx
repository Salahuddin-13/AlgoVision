import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import AIAssistant from '../AIAssistant/AIAssistant'
import './Layout.css'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="app-layout">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="app-body">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`app-main ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
          {children}
        </main>
      </div>
      <AIAssistant />
    </div>
  )
}
