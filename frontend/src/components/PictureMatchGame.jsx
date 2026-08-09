import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * A real matching mini-game, built from the lesson's own exercise images -
 * no new content needed. Each exercise with an image becomes a pair: one
 * card shows the picture, the other shows the matching word. Tap two cards
 * to try a match.
 */
export default function PictureMatchGame({ exercises, onComplete }) {
  const pairs = exercises.filter((e) => e.image_url && e.correct_answer)

  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState(new Set())
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    const built = []
    pairs.forEach((ex, i) => {
      built.push({ key: `img-${i}`, pairId: i, type: 'image', content: ex.image_url })
      built.push({ key: `word-${i}`, pairId: i, type: 'word', content: ex.correct_answer })
    })
    for (let i = built.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[built[i], built[j]] = [built[j], built[i]]
    }
    setCards(built)
  }, [])

  const allMatched = pairs.length > 0 && matched.size === pairs.length

  useEffect(() => {
    if (allMatched) {
      const t = setTimeout(() => onComplete(moves), 900)
      return () => clearTimeout(t)
    }
  }, [allMatched])

  const handleFlip = (card) => {
    if (flipped.length === 2) return
    if (flipped.some((f) => f.key === card.key)) return
    if (matched.has(card.pairId) && flipped.length === 0) return

    const next = [...flipped, card]
    setFlipped(next)

    if (next.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = next
      if (a.pairId === b.pairId && a.type !== b.type) {
        setTimeout(() => {
          setMatched((prev) => new Set(prev).add(a.pairId))
          setFlipped([])
        }, 500)
      } else {
        setTimeout(() => setFlipped([]), 800)
      }
    }
  }

  if (pairs.length < 2) return null

  return (
    <div className="text-center">
      <p className="font-body text-sm text-ink/60 mb-4">
        Tap a picture, then tap its matching word. {moves > 0 && `${moves} move${moves === 1 ? '' : 's'} so far.`}
      </p>
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {cards.map((card) => {
          const isFlipped = flipped.some((f) => f.key === card.key) || matched.has(card.pairId)
          const isMatchedCard = matched.has(card.pairId)
          return (
            <motion.button
              key={card.key}
              onClick={() => !isMatchedCard && handleFlip(card)}
              whileTap={!isMatchedCard ? { scale: 0.95 } : {}}
              className="relative aspect-square"
              style={{ perspective: 600 }}
              disabled={isMatchedCard}
            >
              <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className="absolute inset-0 rounded-xl bg-rule flex items-center justify-center text-paper text-xl"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  ?
                </div>
                <div
                  className="absolute inset-0 rounded-xl bg-white border-2 flex items-center justify-center overflow-hidden p-1"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderColor: isMatchedCard ? '#4F8566' : 'rgba(35,35,35,0.15)',
                  }}
                >
                  {card.type === 'image' ? (
                    <img src={card.content} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="font-body text-xs font-bold text-ink px-1 text-center">{card.content}</span>
                  )}
                </div>
              </motion.div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {allMatched && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-2xl text-sage mt-6"
          >
            All matched! 🎉
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}