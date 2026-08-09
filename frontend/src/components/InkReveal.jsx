import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function InkReveal({ name, onComplete }) {
  const [stage, setStage] = useState('writing')
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      const t = setTimeout(onComplete, 250)
      return () => clearTimeout(t)
    }
    const letterCount = name?.length || 6
    const writingDuration = 250 + letterCount * 90
    const t1 = setTimeout(() => setStage('blot'), writingDuration)
    const t2 = setTimeout(() => setStage('turning'), writingDuration + 350)
    const t3 = setTimeout(() => onComplete(), writingDuration + 350 + 650)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [name, onComplete, prefersReducedMotion])

  if (prefersReducedMotion) return <div className="fixed inset-0 bg-paper z-50" />

  const letters = (name || 'welcome').split('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center notebook-page" style={{ perspective: '1400px' }}>
      <motion.div className="w-full h-full flex items-center justify-center"
        style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
        animate={stage === 'turning' ? { rotateY: -108 } : { rotateY: 0 }}
        transition={{ duration: 0.65, ease: [0.65, 0, 0.35, 1] }}>
        <div className="relative flex flex-col items-center" style={{ backfaceVisibility: 'hidden' }}>
          <p className="font-data text-xs uppercase tracking-[0.2em] text-rule mb-4">welcome to your page</p>
          <div className="relative flex">
            {letters.map((char, i) => (
              <motion.span key={i} className="font-display text-6xl text-ink inline-block"
                initial={{ opacity: 0, y: 6, filter: 'blur(2px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.35, delay: 0.25 + i * 0.09, ease: 'easeOut' }}>
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
            {stage !== 'writing' && (
              <motion.span className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full bg-pencil"
                style={{ width: 10, height: 10, filter: 'blur(1px)' }}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: [0, 1.8, 1.1], opacity: [0.8, 0.5, 0] }}
                transition={{ duration: 0.5, ease: 'easeOut' }} />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}