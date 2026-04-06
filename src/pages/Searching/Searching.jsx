import { useState } from 'react'
import FullscreenMode from '../../components/FullscreenMode/FullscreenMode'
import { useAudioExplain } from '../../hooks/useAudioExplain'
import { useFullscreen } from '../../hooks/useFullscreen'
import '../Sorting/Sorting.css'
import '../DataStructures/DS.css'

export default function Searching() {
  const [arraySize, setArraySize] = useState(20)
  const [array, setArray] = useState(() =>
    Array.from({ length: 20 }, (_, i) => i * 3 + Math.floor(Math.random() * 3) + 1).sort((a, b) => a - b)
  )
  const [target, setTarget] = useState('')
  const [highlights, setHighlights] = useState({})
  const [algo, setAlgo] = useState('binary')
  const [message, setMessage] = useState('Enter a target value and search.')
  const [isRunning, setIsRunning] = useState(false)
  const [low, setLow] = useState(-1)
  const [high, setHigh] = useState(-1)
  const { speak, speakIntro, toggle: toggleAudio, isOn: audioOn } = useAudioExplain()
  const { ref: fsRef, isFs, toggle: toggleFs } = useFullscreen()

  const bsCode = ['low = 0, high = n-1','while (low <= high)','  mid = (low+high)/2','  if arr[mid] == target','    return mid','  else if arr[mid] < target','    low = mid + 1','  else','    high = mid - 1','return -1']
  const lsCode = ['for i = 0 to n-1','  if arr[i] == target','    return i','return -1']

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))

  const generateArray = () => {
    const arr = Array.from({ length: arraySize }, (_, i) =>
      i * 3 + Math.floor(Math.random() * 3) + 1
    ).sort((a, b) => a - b)
    setArray(arr)
    setHighlights({})
    setLow(-1)
    setHigh(-1)
    setMessage('New sorted array generated.')
  }

  const binarySearch = async () => {
    const val = parseInt(target)
    if (isNaN(val)) return
    speakIntro('binary')
    setIsRunning(true)
    let lo = 0, hi = array.length - 1
    setMessage(`Searching for ${val}...`)

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      setLow(lo)
      setHigh(hi)
      setHighlights({ [mid]: 'current' })
      speak(`Search range is index ${lo} to ${hi}. Checking midpoint index ${mid}, value is ${array[mid]}.`)
      await sleep(600)

      if (array[mid] === val) {
        setHighlights({ [mid]: 'found' })
        setMessage(`Found ${val} at index ${mid}!`)
        speak(`Found ${val} at index ${mid}. Search complete.`)
        setIsRunning(false)
        return
      } else if (array[mid] < val) {
        speak(`Midpoint value ${array[mid]} is less than ${val}. Search range moves to the right half, from index ${mid + 1}.`)
        lo = mid + 1
      } else {
        speak(`Midpoint value ${array[mid]} is greater than ${val}. Search range moves to the left half, up to index ${mid - 1}.`)
        hi = mid - 1
      }
    }
    setHighlights({})
    setLow(-1)
    setHigh(-1)
    setMessage(`${val} not found in the array.`)
    setIsRunning(false)
  }

  const linearSearch = async () => {
    const val = parseInt(target)
    if (isNaN(val)) return
    setIsRunning(true)
    setLow(-1)
    setHigh(-1)
    setMessage(`Searching for ${val}...`)

    for (let i = 0; i < array.length; i++) {
      setHighlights({ [i]: 'current' })
      speak(`Checking index ${i}. Value is ${array[i]}. ${array[i] === val ? `Match found!` : `Not a match. Moving to next element.`}`)
      await sleep(300)
      if (array[i] === val) {
        setHighlights({ [i]: 'found' })
        setMessage(`Found ${val} at index ${i}!`)
        speak(`Found ${val} at index ${i} after checking ${i + 1} element${i === 0 ? '' : 's'}. Linear search complete.`)
        setIsRunning(false)
        return
      }
    }
    setHighlights({})
    setMessage(`${val} not found.`)
    setIsRunning(false)
  }

  const search = () => {
    if (algo === 'binary') binarySearch()
    else linearSearch()
  }

  const getCellStyle = (i) => {
    if (highlights[i] === 'found') return { background: 'var(--accent-success)', color: '#fff', boxShadow: '0 0 16px rgba(34,197,94,0.4)' }
    if (highlights[i] === 'current') return { background: 'var(--accent-primary)', color: 'var(--bg-deep)', boxShadow: '0 0 12px rgba(0,240,255,0.3)' }
    if (low >= 0 && high >= 0 && i >= low && i <= high) return { background: 'rgba(0,240,255,0.1)', borderColor: 'var(--border-accent)' }
    return {}
  }

  return (
    <div className="ds-page">
      <div className="viz-header">
        <div>
          <span className="section-label">Searching Algorithms</span>
          <h1 className="viz-title">{algo === 'binary' ? 'Binary Search' : 'Linear Search'}</h1>
        </div>
        <div className="viz-stats">
          <div className="stat-item">
            <span className="stat-label">Time</span>
            <span className="stat-value gradient-text">{algo === 'binary' ? 'O(log n)' : 'O(n)'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Array Size</span>
            <span className="stat-value">{array.length}</span>
          </div>
        </div>
      </div>

      <div className="algo-selector">
        <button className={`algo-btn ${algo === 'binary' ? 'active' : ''}`}
          onClick={() => !isRunning && setAlgo('binary')} disabled={isRunning}>
          Binary Search
        </button>
        <button className={`algo-btn ${algo === 'linear' ? 'active' : ''}`}
          onClick={() => !isRunning && setAlgo('linear')} disabled={isRunning}>
          Linear Search
        </button>
      </div>

      <div ref={fsRef} className="ds-canvas glass-card" style={{position:'relative'}}>
        <FullscreenMode isFs={isFs} onToggle={toggleFs} codeLines={algo === 'binary' ? bsCode : lsCode} currentLine={-1} />
        <button className={`audio-fab ${audioOn ? 'on' : ''}`} onClick={toggleAudio} title={audioOn ? 'Mute' : 'Narrate'}>{audioOn ? '🔊' : '🔇'}</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', flexWrap: 'wrap', gap: '6px' }}>
          {array.map((val, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
            }}>
              <div style={{
                minWidth: '42px', padding: '12px 8px', textAlign: 'center',
                fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)', transition: 'all 0.3s ease',
                ...getCellStyle(i)
              }}>
                {val}
              </div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{i}</span>
            </div>
          ))}
        </div>
        {low >= 0 && high >= 0 && (
          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Search range: [{low}...{high}] | Mid: {Math.floor((low + high) / 2)}
          </div>
        )}
        <div className="ds-message">{message}</div>
      </div>

      <div className="ds-controls glass">
        <div className="ds-inputs">
          <div className="control-group">
            <label className="control-label">Target</label>
            <input
              type="number" value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="Search for..."
              className="ds-input"
              disabled={isRunning}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
          </div>
        </div>
        <div className="ds-buttons">
          <button className="btn-primary ds-btn" onClick={search} disabled={isRunning}>Search</button>
          <button className="btn-secondary ds-btn" onClick={generateArray} disabled={isRunning}>New Array</button>
        </div>
      </div>
    </div>
  )
}
