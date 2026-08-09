import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import api from '../api/axios'

const TYPE_LABELS = { reading: 'Reading', writing: 'Writing', comprehension: 'Comprehension' }
const TYPE_COLORS = { reading: '#6E85B7', writing: '#C1483D', comprehension: '#4F8566' }

export default function TestResults() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
   api.get('/assessments/history/')
    .then(({ data }) => setHistory(data))
    .catch(() => setHistory([]))
    .finally(() => setLoading(false))
  }, [])

  const bestByType = useMemo(() => {
    const result = {}
    for (const attempt of history) {
      if (!result[attempt.assessment_type] || attempt.score > result[attempt.assessment_type]) result[attempt.assessment_type] = attempt.score
    }
    return result
  }, [history])

  if (loading) return <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center"><p className="font-display text-2xl text-ink">loading results…</p></div>

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-16">
      <div className="max-w-2xl mx-auto">
        <p className="font-data text-xs uppercase tracking-[0.2em] text-rule mb-2">test results</p>
        <h1 className="font-display text-4xl text-ink mb-10">Your history</h1>
        {history.length === 0 ? (
          <div className="border-2 border-dashed border-ink/20 rounded-2xl p-8 text-center">
            <p className="font-body text-ink/70">No test attempts yet — finish an assessment to see results here.</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {['reading', 'writing', 'comprehension'].map((type) => {
                const best = bestByType[type]
                if (best == null) return null
                return (
                  <motion.div key={type} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-2 border-ink/10 rounded-2xl p-4">
                    <p className="font-body text-xs text-ink/50 mb-1">{TYPE_LABELS[type]}</p>
                    <p className="font-data text-2xl text-ink mb-2">{Math.round(best)}%</p>
                    <div className="h-2 w-full bg-ink/10 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: TYPE_COLORS[type] }} initial={{ width: 0 }} animate={{ width: `${best}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
                    </div>
                    <p className="font-body text-xs text-ink/40 mt-1">best score</p>
                  </motion.div>
                )
              })}
            </div>
            <h2 className="font-display text-xl text-ink mb-4 border-b-2 border-ink/10 pb-2">All attempts</h2>
            <div className="space-y-3">
              {history.map((attempt, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-white border-2 border-ink/10 rounded-2xl px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[attempt.assessment_type] }} />
                    <div>
                      <p className="font-body font-semibold text-ink">{TYPE_LABELS[attempt.assessment_type]}</p>
                      <p className="font-body text-xs text-ink/50">{new Date(attempt.attempted_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className="font-data text-xl text-ink">{Math.round(attempt.score)}%</span>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}