import { useState, useCallback, useRef } from 'react'
import { ALGO_INTROS } from './algoNarrations'

export function useAudioExplain() {
  const [isOn, setIsOn] = useState(false)
  const isOnRef = useRef(false)
  const speakingRef = useRef(false)
  const queueRef = useRef([])

  const flush = useCallback(() => {
    if (!isOnRef.current || speakingRef.current || queueRef.current.length === 0) return
    const text = queueRef.current.shift()
    speakingRef.current = true
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 1.05
    utt.pitch = 1.0
    utt.lang = 'en-US'
    utt.onend = () => { speakingRef.current = false; setTimeout(flush, 100) }
    utt.onerror = () => { speakingRef.current = false }
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utt)
  }, [])

  // Speak any arbitrary text (used for step narrations)
  const speak = useCallback((text) => {
    if (!isOnRef.current || !text) return
    // Keep queue small — drop stale items
    if (queueRef.current.length > 1) queueRef.current = [queueRef.current[queueRef.current.length - 1]]
    queueRef.current.push(text)
    flush()
  }, [flush])

  // Speak algorithm intro explanation (interrupts anything playing)
  const speakIntro = useCallback((algoKey) => {
    if (!isOnRef.current) return
    const intro = ALGO_INTROS[algoKey]
    if (!intro) return
    queueRef.current = [intro]
    speakingRef.current = false
    window.speechSynthesis.cancel()
    flush()
  }, [flush])

  const stop = useCallback(() => {
    queueRef.current = []
    speakingRef.current = false
    window.speechSynthesis?.cancel()
  }, [])

  const toggle = useCallback(() => {
    setIsOn(prev => {
      const next = !prev
      isOnRef.current = next
      if (!next) {
        queueRef.current = []
        speakingRef.current = false
        window.speechSynthesis?.cancel()
      }
      return next
    })
  }, [])

  return { speak, speakIntro, stop, toggle, isOn }
}
