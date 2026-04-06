import { useState, useCallback, useRef } from 'react'

/**
 * useAudioExplain – browser SpeechSynthesis narration
 *
 * Enhanced: queues narrations with a small gap, cancels previous before speaking,
 * and speaks full explanatory text (not just labels).
 *
 * Usage:
 *   const { speak, stop, toggle, isOn } = useAudioExplain()
 *   speak("Comparing 34 and 12. Since 34 is greater, we swap them.")
 */
export function useAudioExplain() {
  const [isOn, setIsOn] = useState(false)
  const isOnRef = useRef(false)
  const queueRef = useRef([])
  const speakingRef = useRef(false)

  const processQueue = useCallback(() => {
    if (speakingRef.current || queueRef.current.length === 0) return
    if (!isOnRef.current) { queueRef.current = []; return }
    const text = queueRef.current.shift()
    speakingRef.current = true
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 1.1
    utter.pitch = 1.0
    utter.lang = 'en-US'
    utter.onend = () => {
      speakingRef.current = false
      // Only process next if queue non-empty; skip stale items to stay in sync
      if (queueRef.current.length > 2) queueRef.current = [queueRef.current[queueRef.current.length - 1]]
      setTimeout(processQueue, 80)
    }
    utter.onerror = () => { speakingRef.current = false; setTimeout(processQueue, 80) }
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }, [])

  const speak = useCallback((text) => {
    if (!isOnRef.current) return
    if (!('speechSynthesis' in window) || !text) return
    // Replace terse labels with fuller explanations where needed
    const expanded = expandText(text)
    queueRef.current.push(expanded)
    processQueue()
  }, [processQueue])

  const stop = useCallback(() => {
    queueRef.current = []
    speakingRef.current = false
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
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

  return { speak, stop, toggle, isOn }
}

/**
 * expandText – makes short step labels into spoken explanations
 */
function expandText(text) {
  if (!text) return ''

  // DP steps: "dp[3] = 2" → "dp of 3 equals 2"
  text = text.replace(/dp\[(\d+)\]\[(\d+)\]/g, 'dp of $1 comma $2')
  text = text.replace(/dp\[(\d+)\]/g, 'dp of $1')

  // Remove ✓ and ✗ and replace with spoken words
  text = text.replace(/✓/g, 'Done.')
  text = text.replace(/✗/g, 'Rejected.')

  // Sorting comparisons: "Comparing arr[2]=34 and arr[5]=12" → more natural
  text = text.replace(/arr\[(\d+)\]=(\d+)/g, 'value $2 at index $1')
  text = text.replace(/arr\[(\d+)\]/g, 'index $1')

  // Math symbols
  text = text.replace(/≤/g, 'less than or equal to')
  text = text.replace(/≥/g, 'greater than or equal to')
  text = text.replace(/→/g, 'to')
  text = text.replace(/∞|Infinity/g, 'infinity')
  text = text.replace(/\|/g, ',')

  // Don't speak code symbols
  text = text.replace(/[<>]/g, '')
  text = text.replace(/\[\d+\.\.\.\d+\]/g, match => match.replace('...', ' to '))

  return text.trim()
}
