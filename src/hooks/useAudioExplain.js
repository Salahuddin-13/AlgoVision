import { useState, useCallback, useRef } from 'react'

/**
 * useAudioExplain – uses the browser's SpeechSynthesis API (offline, free)
 * to narrate algorithm steps as they happen.
 *
 * Usage:
 *   const { speak, stop, toggle, isOn } = useAudioExplain()
 *   // In your animation loop:
 *   speak("Comparing 34 and 12. 34 is greater, swapping.")
 */
export function useAudioExplain() {
  const [isOn, setIsOn] = useState(false)
  const isOnRef = useRef(false)

  const speak = useCallback((text) => {
    if (!isOnRef.current) return
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 1.0
    utter.pitch = 1.0
    utter.lang = 'en-US'
    window.speechSynthesis.speak(utter)
  }, [])

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const toggle = useCallback(() => {
    setIsOn(prev => {
      const next = !prev
      isOnRef.current = next
      if (!next) {
        window.speechSynthesis?.cancel()
      }
      return next
    })
  }, [])

  return { speak, stop, toggle, isOn }
}
