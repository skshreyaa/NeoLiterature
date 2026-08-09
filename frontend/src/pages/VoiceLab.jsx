import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Mascot from '../components/Mascot'
import Confetti from '../components/Confetti'
import XPToast from '../components/XPToast'

export default function VoiceLab() {
  const { refreshProfile } = useAuth()
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [result, setResult] = useState(null)
  const recognitionRef = useRef(null)
  const [speechSupported, setSpeechSupported] = useState(true)

  const loadEverything = async () => {
    setLoading(true)
    const [itemsRes, statsRes] = await Promise.all([
      api.get('/curriculum/voice-lab/items/'),
      api.get('/curriculum/voice-lab/stats/'),
    ])
    setItems(itemsRes.data)
    setStats(statsRes.data)
    setLoading(false)
  }

  useEffect(() => { loadEverything() }, [])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { setSpeechSupported(false); return }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      let finalText = ''
      for (let i = 0; i < event.results.length; i++) finalText += event.results[i][0].transcript + ' '
      setTranscript(finalText.trim())
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    return () => recognition.stop()
  }, [])

  const currentItem = items[currentIndex]

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (listening) { recognitionRef.current.stop(); setListening(false) }
    else { setTranscript(''); setResult(null); recognitionRef.current.start(); setListening(true) }
  }

  const playSound = () => {
    if (!window.speechSynthesis || !currentItem) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(currentItem.text)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }

  const submitAttempt = async () => {
    const { data } = await api.post('/curriculum/voice-lab/submit/', {
      item_id: currentItem.id, transcript,
    })
    setResult(data)
    await refreshProfile()
  }

  const nextItem = () => {
    setTranscript(''); setResult(null)
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((i) => i + 1)
    } else {
      loadEverything()
      setCurrentIndex(0)
    }
  }

  if (loading) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center">
        <p className="font-display text-2xl text-ink">loading the voice lab…</p>
      </div>
    )
  }

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-16">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Mascot mood="encouraging" size={56} />
            <div>
              <p className="font-data text-xs uppercase tracking-[0.2em] text-rule">voice lab</p>
              <h1 className="font-display text-3xl text-ink">Practice speaking</h1>
            </div>
          </div>
          {stats?.best_accuracy != null && (
            <div className="text-right">
              <p className="font-data text-lg font-bold text-marigold">{Math.round(stats.best_accuracy)}%</p>
              <p className="font-body text-[10px] text-ink/40">personal best</p>
            </div>
          )}
        </div>
        <p className="font-body text-sm text-ink/60 mb-6">
          Say each phrase out loud as many times as you like — practice makes it stick.
        </p>

        {stats && stats.total_attempts > 0 && (
          <div className="bg-white border-2 border-ink/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-data text-xl font-bold text-ink">{stats.total_attempts}</p>
              <p className="font-body text-xs text-ink/50">attempts so far</p>
            </div>
            <div className="text-right">
              <p className="font-data text-xl font-bold text-sage">{Math.round(stats.average_accuracy)}%</p>
              <p className="font-body text-xs text-ink/50">average accuracy</p>
            </div>
          </div>
        )}

        {!speechSupported ? (
          <div className="border-2 border-dashed border-ink/20 rounded-2xl p-8 text-center">
            <p className="font-body text-ink/70">Voice practice needs Chrome or Edge — your current browser doesn't support speech recognition.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="border-2 border-dashed border-ink/20 rounded-2xl p-8 text-center">
            <p className="font-body text-ink/70">No practice phrases available for your level yet.</p>
          </div>
        ) : (
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border-2 border-ink/10 rounded-3xl p-6 sm:p-8 text-center"
          >
            <p className="font-data text-xs text-ink/40 mb-4">Phrase {currentIndex + 1} of {items.length}</p>
            {currentItem.image_url && (
              <img src={currentItem.image_url} alt="" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4" />
            )}
            <h2 className="font-display text-3xl text-ink mb-4">"{currentItem.text}"</h2>

            <motion.button
              onClick={playSound}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-rule/10 text-rule font-body font-semibold text-sm px-4 py-2 rounded-full mb-8 hover:bg-rule/20 transition-colors"
            >
              🔊 Hear it first
            </motion.button>

            <motion.button
              onClick={toggleListening}
              whileTap={{ scale: 0.95 }}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center font-body font-bold text-paper mx-auto mb-4 transition-colors ${listening ? 'bg-pencil' : 'bg-ink'}`}
            >
              {listening && (
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-pencil"
                  animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              {listening ? 'Stop' : 'Speak'}
            </motion.button>

            <AnimatePresence>
              {transcript && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-sm text-ink/60 italic mb-4">
                  You said: "{transcript}"
                </motion.p>
              )}
            </AnimatePresence>

            {!result ? (
              <motion.button
                onClick={submitAttempt}
                disabled={!transcript}
                whileTap={{ scale: 0.98 }}
                className="bg-sage text-paper font-body font-bold px-8 py-3 rounded-2xl disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Check my pronunciation
              </motion.button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {result.accuracy >= 80 && <Confetti />}
                <p className="font-display text-4xl mb-1" style={{ color: result.accuracy >= 60 ? '#4F8566' : '#C1483D' }}>
                  {Math.round(result.accuracy)}%
                </p>
                <p className="font-body text-sm text-ink/60 mb-3">
                  {result.accuracy >= 80 ? 'Excellent!' : result.accuracy >= 60 ? 'Good job — keep practicing' : 'Try again, you can get closer'}
                </p>
                {result.xp_earned != null && (
                  <div className="flex justify-center mb-6">
                    <XPToast amount={result.xp_earned} />
                  </div>
                )}
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setResult(null); setTranscript('') }} className="font-body text-sm text-rule hover:underline">
                    Try again
                  </button>
                  <motion.button
                    onClick={nextItem}
                    whileTap={{ scale: 0.98 }}
                    className="bg-pencil text-paper font-body font-bold px-6 py-2.5 rounded-2xl hover:bg-ink transition-colors"
                  >
                    Next phrase →
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}