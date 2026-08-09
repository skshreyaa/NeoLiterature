import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import api from '../api/axios'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink text-paper rounded-xl px-3 py-2 shadow-lg">
      <p className="font-data text-[10px] text-paper/50 mb-0.5">{label}</p>
      <p className="font-display text-base">{payload[0].value} lesson{payload[0].value === 1 ? '' : 's'}</p>
    </div>
  )
}

export default function StatsPanel() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/lesson-stats/')
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
  }, [])

  if (!stats) return null

  const hasActivity = stats.total_lessons_completed > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-ink/10 rounded-3xl p-5"
    >
      <h3 className="font-display text-xl text-ink mb-4">Your stats</h3>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center">
          <p className="font-data text-2xl font-bold text-pencil">{stats.total_lessons_completed}</p>
          <p className="font-body text-[11px] text-ink/50">lessons done</p>
        </div>
        <div className="text-center">
          <p className="font-data text-2xl font-bold text-rule">{stats.total_minutes_practiced}</p>
          <p className="font-body text-[11px] text-ink/50">minutes practiced</p>
        </div>
        <div className="text-center">
          <p className="font-data text-2xl font-bold text-sage">
            {stats.average_accuracy != null ? `${Math.round(stats.average_accuracy)}%` : '—'}
          </p>
          <p className="font-body text-[11px] text-ink/50">avg accuracy</p>
        </div>
      </div>

      {hasActivity ? (
        <>
          <p className="font-body text-xs text-ink/50 mb-2">Activity, last 14 days</p>
          <div style={{ width: '100%', height: 100 }}>
            <ResponsiveContainer>
              <BarChart data={stats.daily_activity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(35,35,35,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#B8B0A3' }} axisLine={false} tickLine={false} interval={2} />
                <YAxis hide domain={[0, 'dataMax + 1']} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(224,169,76,0.1)' }} />
                <Bar dataKey="lessons" fill="#E0A94C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {stats.best_day && (
            <p className="font-body text-xs text-ink/40 mt-2 text-center">
              Best day: <span className="font-semibold text-ink/60">{stats.best_day.date}</span> with {stats.best_day.lessons} lesson{stats.best_day.lessons === 1 ? '' : 's'}
            </p>
          )}
        </>
      ) : (
        <p className="font-body text-xs text-ink/40 italic text-center py-4">
          Complete a lesson to start building your stats here.
        </p>
      )}
    </motion.div>
  )
}