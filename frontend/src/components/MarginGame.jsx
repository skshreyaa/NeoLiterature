import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WORDS = [
  'apple', 'house', 'water', 'happy', 'friend', 'school', 'reading',
  'writing', 'garden', 'sunset', 'bicycle', 'flower', 'window', 'kitchen',
  'library', 'weather', 'journey', 'morning', 'evening', 'picture',
]

const COLORS = {
  paper: '#FBF8F1',
  ink: '#232323',
  rule: '#6E85B7',
  pencil: '#C1483D',
  marigold: '#E0A94C',
  sage: '#4F8566',
}

function scramble(word) {
  const letters = word.split('')
  let scrambled = word
  while (scrambled === word) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[letters[i], letters[j]] = [letters[j], letters[i]]
    }
    scrambled = letters.join('')
  }
  return scrambled
}

export default function MarginGame() {
  const [wordIndex, setWordIndex] = useState(() => Math.floor(Math.random() * WORDS.length))
  const [scrambled, setScrambled] = useState('')
  const [guess, setGuess] = useState('')
  const [solved, setSolved] = useState(false)
  const [streak, setStreak] = useState(0)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setScrambled(scramble(WORDS[wordIndex]))
  }, [wordIndex])

  const checkGuess = (e) => {
    e.preventDefault()
    if (guess.trim().toLowerCase() === WORDS[wordIndex].toLowerCase()) {
      setSolved(true)
      setStreak((s) => s + 1)
    }
  }

  const nextWord = () => {
    setWordIndex(Math.floor(Math.random() * WORDS.length))
    setGuess('')
    setSolved(false)
  }

  return (
    <div style={{ position: 'fixed', top: '100px', right: '20px', zIndex: 9999, width: '220px', pointerEvents: 'none' }}>
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.05}
        dragConstraints={{ left: -2000, right: 40, top: -100, bottom: 2000 }}
        animate={{ x: dragOffset.x, y: dragOffset.y }}
        onDragEnd={(e, info) => {
          setDragOffset((prev) => ({ x: prev.x + info.offset.x, y: prev.y + info.offset.y }))
        }}
        whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
        style={{
          background: COLORS.paper,
          border: `2px solid ${COLORS.ink}22`,
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          pointerEvents: 'auto',
          cursor: 'grab',
          userSelect: 'none',
          fontFamily: '"Nunito Sans", sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: `${COLORS.ink}66`, fontWeight: 700 }}>
            ✏️ quick word game
          </span>
          <span style={{ fontSize: '10px', color: `${COLORS.ink}44` }} title="Drag me anywhere">⠿</span>
        </div>

        <p style={{ fontFamily: '"Kalam", cursive', fontSize: '26px', color: COLORS.pencil, letterSpacing: '0.1em', margin: '0 0 12px 0' }}>
          {scrambled}
        </p>

        <AnimatePresence mode="wait">
          {!solved ? (
            <motion.form key="form" onSubmit={checkGuess} exit={{ opacity: 0 }} onPointerDown={(e) => e.stopPropagation()}>
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="unscramble it…"
                style={{
                  width: '100%', padding: '8px 12px', border: `2px solid ${COLORS.ink}22`, borderRadius: '10px',
                  marginBottom: '8px', fontFamily: '"Nunito Sans", sans-serif', fontSize: '14px',
                  color: COLORS.ink, background: '#fff', outline: 'none', boxSizing: 'border-box', cursor: 'text',
                }}
              />
              <button
                type="submit"
                style={{
                  width: '100%', padding: '8px', background: COLORS.ink, color: COLORS.paper, border: 'none',
                  borderRadius: '10px', fontFamily: '"Nunito Sans", sans-serif', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Check
              </button>
            </motion.form>
          ) : (
            <motion.div key="solved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onPointerDown={(e) => e.stopPropagation()}>
              <p style={{ color: COLORS.sage, fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                ✓ Nice! It was "{WORDS[wordIndex]}"
              </p>
              <button
                onClick={nextWord}
                style={{
                  width: '100%', padding: '8px', background: COLORS.marigold, color: COLORS.ink, border: 'none',
                  borderRadius: '10px', fontFamily: '"Nunito Sans", sans-serif', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Next word →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {streak > 0 && (
          <p style={{ fontSize: '10px', color: `${COLORS.ink}66`, marginTop: '8px', textAlign: 'center' }}>
            🔥 {streak} solved this visit
          </p>
        )}
      </motion.div>
    </div>
  )
}