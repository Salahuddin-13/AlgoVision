import { useRef, useState, useEffect } from 'react'

export function useFullscreen() {
  const ref = useRef(null)
  const [isFs, setIsFs] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else if (ref.current) {
      ref.current.requestFullscreen()
    }
  }

  return { ref, isFs, toggle }
}
