import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Mascot from '../components/Mascot'
import Confetti from '../components/Confetti'
import XPToast from '../components/XPToast'

export default function ListeningLab() {
  const { refreshProfile } = useAuth()
  const [rounds, setRounds] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [finished, setFinished] = useState(false)
  const [roundResult, setRoundResult] = useState(null)
  const [speechSupported, setSpeechSupported] = useState(true)

  const loadRounds = async () => {
    setLoading(true)
    const [roundsRes, statsRes] = await Promise.all([
      api.get('/curriculum/listening-lab/items/'),
      api.get('/curriculum/listening-lab/stats/'),
    ])
    setRounds(roundsRes.data)
    setStats(statsRes.data)
    setIndex(0)
    setScore(0)
    setCombo(0)
    setBestCombo(0)
    setFinished(false)
    setRoundResult(null)
    setLoading(false)
  }

  useEffect(() => {
    if (!window.speechSynthesis) setSpeechSupported(false)
    loadRounds()
  }, [])

  const current = rounds[index]

  const playSound = (text) => {
    if (!window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (current?.speak_text) playSound(current.speak_text)
  }, [current?.id])

  const handleAnswer = async (option) => {
    if (feedback) return
    setSelected(option)
    const { data } = await api.post('/curriculum/listening-lab/check/', { item_id: current.id, answer: option })
    setFeedback(data.correct ? 'correct' : 'incorrect')

    let newCombo = combo
    if (data.correct) {
      setScore((s) => s + 1)
      newCombo = combo + 1
      setCombo(newCombo)
      setBestCombo((b) => Math.max(b, newCombo))
    } else {
      setCombo(0)
    }

    setTimeout(async () => {
      if (index + 1 < rounds.length) {
        setIndex((i) => i + 1); setSelected(null); setFeedback(null)
      } else {
        const finalScore = score + (data.correct ? 1 : 0)
        const { data: completeData } = await api.post('/curriculum/listening-lab/complete/', {
          score: finalScore, total: rounds.length, best_combo: Math.max(bestCombo, newCombo),
        })
        setRoundResult(completeData)
        await refreshProfile()
        setFinished(true)
      }
    }, 800)
  }

  if (loading) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center">
        <p className="font-display text-2xl text-ink">loading the listening lab…</p>
      </div>
    )
  }

  if (!speechSupported) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center px-6">
        <div className="border-2 border-dashed border-ink/20 rounded-2xl p-8 text-center max-w-md">
          <p className="font-body text-ink/70">Your browser doesn't support text-to-speech — try Chrome or Edge.</p>
        </div>
      </div>
    )
  }

  if (rounds.length === 0) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center px-6">
        <div className="border-2 border-dashed border-ink/20 rounded-2xl p-8 text-center max-w-md">
          <p className="font-body text-ink/70">No listening rounds available at your level yet.</p>
        </div>
      </div>
    )
  }

  if (finished) {
    const percent = Math.round((score / rounds.length) * 100)
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center px-6">
        {percent >= 70 && <Confetti />}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
          <Mascot mood={percent >= 70 ? 'celebrating' : 'encouraging'} size={110} />
          <h1 className="font-display text-3xl text-ink mt-4 mb-2">Round complete!</h1>
          <p className="font-display text-4xl text-pencil mb-1">{score} / {rounds.length}</p>
          {roundResult?.is_new_best && (
            <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-body text-sm font-bold text-marigold mb-2">
              🎉 New personal best!
            </motion.p>
          )}
          <p className="font-body text-ink/60 mb-2">{percent}% correct · best combo {Math.max(bestCombo, combo)}</p>
          {roundResult?.xp_earned != null && (
            <div className="flex justify-center mb-6">
              <XPToast amount={roundResult.xp_earned} />
            </div>
          )}
          <motion.button
            onClick={loadRounds}
            whileTap={{ scale: 0.98 }}
            className="bg-pencil text-paper font-body font-bold px-6 py-3 rounded-2xl hover:bg-ink transition-colors shadow-[0_4px_0_0_#8f342b]"
          >
            Play another round
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Mascot mood="encouraging" size={48} />
            <div>
              <p className="font-data text-xs uppercase tracking-[0.2em] text-rule">listening lab</p>
              <h1 className="font-display text-2xl text-ink">What did you hear?</h1>
            </div>
          </div>
          {stats?.best_score_percent != null && (
            <div className="text-right">
              <p className="font-data text-sm font-bold text-marigold">{stats.best_score_percent}%</p>
              <p className="font-body text-[10px] text-ink/40">personal best</p>
            </div>
          )}
        </div>

        <div className="h-3 w-full bg-ink/10 rounded-full overflow-hidden mb-4 mt-4">
          <motion.div className="h-full bg-marigold rounded-full" animate={{ width: `${(index / rounds.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>

        <AnimatePresence>
          {combo >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center mb-4"
            >
              <span className="inline-flex items-center gap-1 bg-pencil text-paper font-body font-bold text-sm px-4 py-1.5 rounded-full">
                🔥 {combo} in a row!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border-2 border-ink/10 rounded-3xl p-6 sm:p-8 text-center"
          >
            <motion.button
              onClick={() => playSound(current.speak_text)}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 rounded-full bg-ink text-paper flex items-center justify-center text-2xl mx-auto mb-6"
            >
              🔊
            </motion.button>
            <p className="font-body text-sm text-ink/50 mb-6">Tap to hear it again</p>

            <div className="grid gap-3">
              {current.options.map((option) => {
                const isSelected = selected === option
                const showCorrect = feedback === 'correct' && isSelected
                const showWrong = feedback === 'incorrect' && isSelected
                return (
                  <motion.button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    whileHover={!feedback ? { scale: 1.02 } : {}}
                    whileTap={{ scale: 0.98 }}
                    animate={showCorrect ? { backgroundColor: '#4F8566', color: '#FBF8F1', borderColor: '#4F8566' } : showWrong ? { backgroundColor: '#C1483D', color: '#FBF8F1', borderColor: '#C1483D' } : {}}
                    className="w-full border-2 border-ink/15 rounded-2xl px-5 py-3 font-body font-semibold text-ink transition-colors"
                    disabled={!!feedback}
                  >
                    {option}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="font-body text-xs text-ink/40 text-center mt-4">Score so far: {score} / {index + (feedback ? 1 : 0)}</p>
      </div>
    </div>
  )
}