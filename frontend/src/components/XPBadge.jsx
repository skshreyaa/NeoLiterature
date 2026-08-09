import { motion } from 'framer-motion'

// Mirrors backend/users/xp.py RANK_TIERS exactly - keep these in sync.
const RANK_TIERS = [
  { threshold: 0, name: 'Seedling', icon: '🌱' },
  { threshold: 100, name: 'Sprout', icon: '🌿' },
  { threshold: 300, name: 'Sapling', icon: '🌳' },
  { threshold: 600, name: 'Grove Keeper', icon: '🌲' },
  { threshold: 1000, name: 'Forest Guardian', icon: '🏞️' },
  { threshold: 2000, name: 'Grove Master', icon: '🏆' },
]

function getRank(xp) {
  let current = RANK_TIERS[0]
  let next = null
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (xp >= RANK_TIERS[i].threshold) {
      current = RANK_TIERS[i]
      next = RANK_TIERS[i + 1] || null
    } else {
      break
    }
  }
  return { current, next }
}

export default function XPBadge({ xp }) {
  const { current, next } = getRank(xp)
  const progressToNext = next
    ? ((xp - current.threshold) / (next.threshold - current.threshold)) * 100
    : 100

  return (
    <div className="bg-white border-2 border-ink/10 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{current.icon}</span>
        <div>
          <p className="font-display text-lg text-ink leading-tight">{current.name}</p>
          <p className="font-data text-xs text-ink/50">{xp} XP</p>
        </div>
      </div>
      {next && (
        <>
          <div className="h-2 w-full bg-ink/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-marigold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressToNext}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <p className="font-body text-xs text-ink/40 mt-1.5">
            {next.threshold - xp} XP to {next.name}
          </p>
        </>
      )}
      {!next && (
        <p className="font-body text-xs text-sage font-semibold">Highest rank reached 🎉</p>
      )}
    </div>
  )
}