import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function VoiceReader({ onTranscriptChange }) {
  const [supported, setSupported] = useState(true)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { setSupported(false); return }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      let finalText = ''
      for (let i = 0; i < event.results.length; i++) finalText += event.results[i][0].transcript + ' '
      setTranscript(finalText.trim())
      onTranscriptChange(finalText.trim())
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    return () => recognition.stop()
  }, [onTranscriptChange])

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (listening) { recognitionRef.current.stop(); setListening(false) }
    else { setTranscript(''); recognitionRef.current.start(); setListening(true) }
  }

  if (!supported) {
    return (
      <div>
        <p className="font-body text-sm text-pencil mb-2">Your browser doesn't support voice input — type instead.</p>
        <textarea className="w-full border-2 border-ink/20 rounded-sm p-3 font-body focus-ring outline-none" rows={4}
          placeholder="Type here..." onChange={(e) => onTranscriptChange(e.target.value)} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button onClick={toggleListening} whileTap={{ scale: 0.95 }}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center font-body font-bold text-paper transition-colors focus-ring ${listening ? 'bg-pencil' : 'bg-ink'}`}>
        {listening && (
          <motion.span className="absolute inset-0 rounded-full border-2 border-pencil"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }} />
        )}
        {listening ? 'Stop' : 'Read'}
      </motion.button>
      <p className="font-body text-xs text-ink/50">{listening ? 'Listening — read the passage aloud' : 'Tap to start reading aloud'}</p>
      <AnimatePresence>
        {transcript && (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="font-body text-sm text-ink/70 italic max-w-md text-center">"{transcript}"</motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}