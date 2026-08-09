import { motion } from 'framer-motion'

export default function StreakCard({ current, longest, isActiveToday, last7Days = [] }) {
  const isLit = current > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border-2 border-ink/10 p-6 overflow-hidden relative"
    >
      {isLit && isActiveToday && (
        <motion.div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(224,169,76,0.35) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative flex items-center gap-5">
        <motion.svg
          viewBox="0 0 24 24" width={64} height={64}
          animate={isLit && isActiveToday ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="shrink-0"
        >
          <path
            d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.3-2-1-3 1.5 1 2.5 3 2.5 5a6.5 6.5 0 0 1-13 0c0-4 2-6 3-7 .5-1 1.5-2 2.5-2z"
            fill={isLit ? '#E0A94C' : '#D8D2C4'}
          />
        </motion.svg>

        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl text-ink">{current}</span>
            <span className="font-body text-sm text-ink/60">day{current === 1 ? '' : 's'}</span>
          </div>
          <p className="font-body text-sm text-ink/60">
            {!isLit
              ? 'Complete a lesson today to start a streak'
              : isActiveToday
              ? "You're on a roll — keep it going!"
              : 'Do something today to keep your streak alive'}
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-6 relative">
        {last7Days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="font-data text-[10px] text-ink/40">{day.label}</span>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: day.active ? '#E0A94C' : '#F0ECE3' }}
            >
              {day.active && (
                <svg viewBox="0 0 24 24" width={14} height={14}>
                  <path d="M5 13l4 4L19 7" stroke="#FBF8F1" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {longest > current && (
        <p className="font-body text-xs text-ink/40 mt-5 pt-4 border-t border-ink/10">
          Longest streak: <span className="font-semibold text-ink/60">{longest} days</span>
        </p>
      )}
    </motion.div>
  )
}