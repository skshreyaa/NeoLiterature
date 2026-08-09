import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'

const SKILL_LABELS = { reading: 'Reading', writing: 'Writing', comprehension: 'Comprehension' }
const SKILL_ICONS = { reading: '📖', writing: '✍️', comprehension: '🧩' }
const SKILL_COLORS = { reading: '#6E85B7', writing: '#C1483D', comprehension: '#4F8566' }

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink text-paper rounded-xl px-3 py-2.5 shadow-lg space-y-1">
      <p className="font-data text-[10px] text-paper/50 mb-1">{label}</p>
      {payload.map((p) => (
        p.value != null && (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="font-body">{SKILL_LABELS[p.dataKey]}</span>
            <span className="font-data font-bold ml-auto">{Math.round(p.value)}</span>
          </div>
        )
      ))}
    </div>
  )
}

function makeDot(color, lastIndex) {
  return (props) => {
    const { cx, cy, index } = props
    if (cx == null || cy == null) return null
    if (index === lastIndex) {
      return <circle cx={cx} cy={cy} r={6} fill="#FFFFFF" stroke={color} strokeWidth={2.5} />
    }
    return <circle cx={cx} cy={cy} r={4} fill={color} />
  }
}

export default function PredictionsChart({ scorePredictions, historicalTrend }) {
  if (!scorePredictions?.length) return null

  const skills = scorePredictions.map((p) => p.skill)
  const maxAttempts = Math.max(0, ...skills.map((s) => (historicalTrend?.[s] || []).length))
  const hasRealHistory = maxAttempts > 0

  const chartData = []
  for (let i = 0; i < maxAttempts; i++) {
    const row = { label: `Attempt ${i + 1}` }
    skills.forEach((skill) => {
      const attempts = historicalTrend?.[skill] || []
      if (attempts[i]) row[skill] = attempts[i].score
    })
    chartData.push(row)
  }
  const projectedRow = { label: 'Projected' }
  scorePredictions.forEach((p) => { projectedRow[p.skill] = p.predicted_score })
  chartData.push(projectedRow)
  const lastIndex = chartData.length - 1

  const legendPayload = scorePredictions.map((p) => ({
    value: p.skill,
    type: 'circle',
    color: SKILL_COLORS[p.skill],
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-ink/10 rounded-3xl p-5"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-xl text-ink">Your progress forecast</h3>
        <span className="font-body text-[10px] text-ink/40">ring = projected</span>
      </div>
      <p className="font-body text-xs text-ink/50 mb-4">
        Predicted using your lesson pace, practice time, and quiz accuracy
      </p>

      <div style={{ width: '100%', height: 220 }} className="-mx-2">
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(35,35,35,0.06)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#B8B0A3' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#B8B0A3' }} axisLine={false} tickLine={false} width={28} />

            <ReferenceLine y={40} stroke="#D8D2C4" strokeDasharray="4 4" label={{ value: 'Intermediate', fontSize: 9, fill: '#B8B0A3', position: 'insideTopLeft' }} />
            <ReferenceLine y={70} stroke="#D8D2C4" strokeDasharray="4 4" label={{ value: 'Advanced', fontSize: 9, fill: '#B8B0A3', position: 'insideTopLeft' }} />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              payload={legendPayload}
              formatter={(value) => <span className="font-body text-xs">{SKILL_LABELS[value]}</span>}
              iconSize={8}
            />

            {skills.map((skill) => (
              <Line
                key={skill}
                type="monotone"
                dataKey={skill}
                stroke={SKILL_COLORS[skill]}
                strokeWidth={2.5}
                dot={makeDot(SKILL_COLORS[skill], lastIndex)}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {!hasRealHistory && (
        <p className="font-body text-xs text-ink/40 italic text-center mt-2">
          Retake the assessment after some practice to build up real history points on this chart.
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-ink/10">
        {scorePredictions.map((pred) => {
          const color = SKILL_COLORS[pred.skill]
          const change = pred.predicted_score - pred.current_score
          return (
            <div key={pred.skill} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-sm">{SKILL_ICONS[pred.skill]}</span>
                <span className="font-body text-[11px] text-ink/50">{SKILL_LABELS[pred.skill]}</span>
              </div>
              <p className="font-data text-xl font-bold" style={{ color }}>{Math.round(pred.predicted_score)}</p>
              <span
                className="font-body text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-1"
                style={{
                  color: change >= 0 ? '#4F8566' : '#C1483D',
                  backgroundColor: change >= 0 ? '#EEF5F0' : '#FBEDEA',
                }}
              >
                {change >= 0 ? '+' : ''}{Math.round(change)} in {pred.predicted_for_days_ahead}d
              </span>
            </div>
          )
        })}
      </div>

      {scorePredictions.some((p) => p.milestone) && (
        <div className="mt-4 pt-4 border-t border-ink/10 space-y-2">
          {scorePredictions.filter((p) => p.milestone).map((p) => (
            <div key={p.skill} className="flex items-center gap-2">
              <span className="text-sm">🎯</span>
              <p className="font-body text-xs font-semibold" style={{ color: SKILL_COLORS[p.skill] }}>
                {p.milestone}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}