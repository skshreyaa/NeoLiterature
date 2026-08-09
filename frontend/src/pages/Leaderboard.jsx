import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../api/axios'

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function Leaderboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leaderboard/')
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center">
        <p className="font-display text-2xl text-ink">loading the leaderboard…</p>
      </div>
    )
  }

  const top10 = data?.top_10 || []
  const yourEntry = data?.your_entry
  const yourEntryInTop10 = top10.some((e) => e.is_you)

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-16">
      <div className="max-w-xl mx-auto">
        <p className="font-data text-xs uppercase tracking-[0.2em] text-rule mb-2 text-center">leaderboard</p>
        <h1 className="font-display text-4xl text-ink mb-2 text-center">Top learners</h1>
        {data?.total_ranked_learners > 0 && (
          <p className="font-body text-sm text-ink/50 text-center mb-10">
            {data.total_ranked_learners} learner{data.total_ranked_learners === 1 ? '' : 's'} earning XP
          </p>
        )}

        {top10.length === 0 ? (
          <div className="border-2 border-dashed border-ink/20 rounded-2xl p-8 text-center mt-6">
            <p className="font-body text-ink/70">No one has earned XP yet — complete a lesson to be the first on the board!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {top10.map((entry, i) => (
              <motion.div
                key={entry.username}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 rounded-2xl px-5 py-4 border-2 ${
                  entry.is_you ? 'bg-marigold/15 border-marigold' : 'bg-white border-ink/10'
                }`}
              >
                <span className="font-data text-lg w-8 text-center shrink-0">
                  {MEDALS[entry.rank] || entry.rank}
                </span>
                <span className="font-body font-semibold text-ink flex-1">
                  {entry.username}
                  {entry.is_you && <span className="font-body text-xs text-pencil ml-2">(you)</span>}
                </span>
                <span className="font-data font-bold text-ink">{entry.xp} XP</span>
              </motion.div>
            ))}

            {yourEntry && !yourEntryInTop10 && (
              <>
                <div className="text-center py-2">
                  <span className="font-body text-xs text-ink/30">···</span>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 rounded-2xl px-5 py-4 border-2 bg-marigold/15 border-marigold"
                >
                  <span className="font-data text-lg w-8 text-center shrink-0">{yourEntry.rank}</span>
                  <span className="font-body font-semibold text-ink flex-1">
                    {yourEntry.username}
                    <span className="font-body text-xs text-pencil ml-2">(you)</span>
                  </span>
                  <span className="font-data font-bold text-ink">{yourEntry.xp} XP</span>
                </motion.div>
              </>
            )}
          </div>
        )}

        {!yourEntry && top10.length > 0 && (
          <p className="font-body text-sm text-ink/50 text-center mt-8">
            Complete a lesson to earn XP and join the board!
          </p>
        )}
      </div>
    </div>
  )
}