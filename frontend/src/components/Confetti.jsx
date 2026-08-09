import { motion } from 'framer-motion'

const COLORS = ['#C1483D', '#E0A94C', '#4F8566', '#6E85B7']

export default function Confetti() {
  const pieces = Array.from({ length: 24 })
  return (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-40">
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * Math.PI * 2
        const distance = 140 + Math.random() * 100
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        return (
          <motion.span key={i} className="absolute rounded-sm"
            style={{ width: 8, height: 8, backgroundColor: COLORS[i % COLORS.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x, y, opacity: 0, rotate: 360 }}
            transition={{ duration: 1.1, ease: 'easeOut' }} />
        )
      })}
    </div>
  )
}