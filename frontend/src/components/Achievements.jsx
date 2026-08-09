import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../api/axios'

export default function Achievements() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/achievements/').then(({ data }) => setData(data)).catch(() => setData(null))
  }, [])

  if (!data) return null

  return (
    <div className="bg-white border-2 border-ink/10 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl text-ink">Achievements</h3>
        <span className="font-data text-xs text-ink/50">{data.earned_count} / {data.total_count}</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {data.badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center text-center gap-1"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 ${
                badge.earned ? 'border-marigold bg-marigold/10' : 'border-ink/10 bg-paper grayscale opacity-40'
              }`}
            >
              {badge.icon}
            </div>
            <p className={`font-body text-[10px] leading-tight ${badge.earned ? 'text-ink font-semibold' : 'text-ink/40'}`}>
              {badge.name}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}