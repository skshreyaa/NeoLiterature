import { motion } from 'framer-motion'

export default function StreakBadge({ current, isActiveToday = true, size = 28 }) {
  const flameColor = current > 0 && isActiveToday ? '#E0A94C' : '#B8B0A3'
  return (
    <div className="flex items-center gap-1.5">
      <motion.svg viewBox="0 0 24 24" width={size} height={size}
        animate={current > 0 && isActiveToday ? { scale: [1, 1.12, 1] } : {}}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
        <path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.3-2-1-3 1.5 1 2.5 3 2.5 5a6.5 6.5 0 0 1-13 0c0-4 2-6 3-7 .5-1 1.5-2 2.5-2z" fill={flameColor} />
      </motion.svg>
      <span className="font-data font-bold text-ink">{current}</span>
    </div>
  )
}