'use client'
import { useState, useCallback, useEffect, useRef } from 'react'

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingText, setSpeakingText] = useState<string | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const voicesLoaded = useRef(false)

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      const enUsVoices = v.filter(
        (voice) => voice.lang.startsWith('en') && voice.name.includes('US')
      )
      const enVoices = v.filter((voice) => voice.lang.startsWith('en'))
      setVoices(enUsVoices.length > 0 ? enUsVoices : enVoices.length > 0 ? enVoices : v)
      voicesLoaded.current = true
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
      window.speechSynthesis.cancel()
    }
  }, [])

  const speak = useCallback(
    (text: string, rate: number = 0.9) => {
      if (!text.trim()) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      if (voices.length > 0) utterance.voice = voices[0]
      utterance.rate = rate
      utterance.pitch = 1
      utterance.onstart = () => {
        setIsSpeaking(true)
        setSpeakingText(text)
      }
      utterance.onend = () => {
        setIsSpeaking(false)
        setSpeakingText(null)
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        setSpeakingText(null)
      }
      window.speechSynthesis.speak(utterance)
    },
    [voices]
  )

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setSpeakingText(null)
  }, [])

  return { speak, stop, isSpeaking, speakingText, voices }
}
