import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, ReferenceLine, RadialBarChart, RadialBar,
} from 'recharts'
import { motion } from 'framer-motion'
import api from '../api/axios'
import Mascot from '../components/Mascot'

const LEVEL_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }
const SKILL_LABELS = { reading: 'Reading', writing: 'Writing', comprehension: 'Comprehension' }
const SKILL_COLORS = { reading: '#6E85B7', writing: '#C1483D', comprehension: '#4F8566' }
const LAB_LABELS = { voice: 'Voice Lab', picture: 'Picture Lab', listening: 'Listening Lab' }
const LAB_COLORS = { voice: '#C1483D', picture: '#E0A94C', listening: '#4F8566' }

function DarkTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink text-paper rounded-xl px-3 py-2.5 shadow-lg space-y-1">
      <p className="font-data text-[10px] text-paper/50 mb-1">{label}</p>
      {payload.map((p) => p.value != null && (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span className="font-body">{SKILL_LABELS[p.dataKey] || p.name || p.dataKey}</span>
          <span className="font-data font-bold ml-auto">{Math.round(p.value)}{suffix}</span>
        </div>
      ))}
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white border-2 border-ink/10 rounded-3xl p-5">
      <h2 className="font-display text-xl text-ink mb-1">{title}</h2>
      {subtitle && <p className="font-body text-xs text-ink/50 mb-4">{subtitle}</p>}
      {children}
    </div>
  )
}

export default function Insights() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/predictions/insights/')
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.error || 'Could not load predictions.'))
  }, [])

  if (error) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center px-6">
        <p className="font-body text-ink/60">{error}</p>
      </div>
    )
  }
  if (!data) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center">
        <p className="font-display text-2xl text-ink">forecasting your progress…</p>
      </div>
    )
  }

  const {
    score_predictions, historical_trend, pronunciation_trend, lab_comparison,
    weekly_lessons, xp_trajectory, completion_forecast, level_progress,
    engagement_forecast, next_achievement, methodology_note,
  } = data

  const forecastChartData = [
    { label: 'Now', ...Object.fromEntries(score_predictions.map((p) => [p.skill, p.current_score])) },
    { label: '+14 days', ...Object.fromEntries(score_predictions.map((p) => [p.skill, p.predicted_14d])) },
    { label: '+30 days', ...Object.fromEntries(score_predictions.map((p) => [p.skill, p.predicted_30d])) },
    { label: '+60 days', ...Object.fromEntries(score_predictions.map((p) => [p.skill, p.predicted_60d])) },
  ]

  const labComparisonData = Object.entries(lab_comparison || {}).map(([lab, info]) => ({
    lab: LAB_LABELS[lab], avg_percent: info.avg_percent ?? 0, fill: LAB_COLORS[lab],
  }))

  const levelPercent = level_progress.total > 0 ? Math.round((level_progress.completed / level_progress.total) * 100) : 0
  const levelRadialData = [{ name: 'progress', value: levelPercent, fill: '#E0A94C' }]

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-4 sm:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Mascot mood="encouraging" size={56} />
          <div>
            <p className="font-data text-xs uppercase tracking-[0.2em] text-rule">predictions</p>
            <h1 className="font-display text-3xl text-ink">Where you're headed</h1>
          </div>
        </div>
        <p className="font-body text-sm text-ink/50 mb-8">Seven views into your real pace and progress — not just where you are, but where you're going.</p>

        <div className="space-y-6">

          <ChartCard title="1. Score forecast" subtitle="14, 30, and 60 days from today, per skill">
            <div style={{ width: '100%', height: 220 }} className="-mx-2">
              <ResponsiveContainer>
                <LineChart data={forecastChartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(35,35,35,0.06)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#B8B0A3' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#B8B0A3' }} axisLine={false} tickLine={false} width={28} />
                  <ReferenceLine y={40} stroke="#D8D2C4" strokeDasharray="4 4" label={{ value: 'Intermediate', fontSize: 9, fill: '#B8B0A3', position: 'insideTopLeft' }} />
                  <ReferenceLine y={70} stroke="#D8D2C4" strokeDasharray="4 4" label={{ value: 'Advanced', fontSize: 9, fill: '#B8B0A3', position: 'insideTopLeft' }} />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend formatter={(v) => <span className="font-body text-xs">{SKILL_LABELS[v]}</span>} iconSize={8} iconType="circle" />
                  {score_predictions.map((p) => (
                    <Line key={p.skill} type="monotone" dataKey={p.skill} stroke={SKILL_COLORS[p.skill]} strokeWidth={2.5}
                          dot={{ r: 4, fill: SKILL_COLORS[p.skill], strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {score_predictions.some((p) => p.milestone) && (
              <div className="mt-3 pt-3 border-t border-ink/10 space-y-1.5">
                {score_predictions.filter((p) => p.milestone).map((p) => (
                  <p key={p.skill} className="font-body text-xs font-semibold flex items-center gap-2" style={{ color: SKILL_COLORS[p.skill] }}>
                    🎯 {p.milestone}
                  </p>
                ))}
              </div>
            )}
            <p className="font-body text-[10px] text-ink/30 italic mt-2">{methodology_note}</p>
          </ChartCard>

          <ChartCard title="2. Reading trend" subtitle="Your reading score across every assessment attempt">
            {historical_trend.reading?.length > 0 ? (
              <div style={{ width: '100%', height: 160 }} className="-mx-2">
                <ResponsiveContainer>
                  <LineChart data={historical_trend.reading} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(35,35,35,0.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#B8B0A3' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#B8B0A3' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip content={<DarkTooltip />} />
                    <Line type="monotone" dataKey="score" stroke={SKILL_COLORS.reading} strokeWidth={2.5} dot={{ r: 4, fill: SKILL_COLORS.reading }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="font-body text-xs text-ink/40 italic py-8 text-center">Retake the assessment to build a real reading trend here.</p>
            )}
          </ChartCard>

          <ChartCard title="3. Pronunciation trend" subtitle="Voice Lab accuracy across your last attempts">
            {pronunciation_trend?.length > 0 ? (
              <div style={{ width: '100%', height: 160 }} className="-mx-2">
                <ResponsiveContainer>
                  <LineChart data={pronunciation_trend} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(35,35,35,0.06)" />
                    <XAxis dataKey="attempt" tick={{ fontSize: 10, fill: '#B8B0A3' }} axisLine={false} tickLine={false} label={{ value: 'attempt #', fontSize: 9, fill: '#B8B0A3', position: 'insideBottom', offset: -2 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#B8B0A3' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip content={<DarkTooltip suffix="%" />} />
                    <Line type="monotone" dataKey="accuracy" stroke="#C1483D" strokeWidth={2.5} dot={{ r: 3, fill: '#C1483D' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="font-body text-xs text-ink/40 italic py-8 text-center">Practice in the Voice Lab to build your pronunciation trend here.</p>
            )}
          </ChartCard>

          <ChartCard title="4. Lab performance comparison" subtitle="Average score across all three labs">
            {labComparisonData.length > 0 ? (
              <div style={{ width: '100%', height: 160 }} className="-mx-2">
                <ResponsiveContainer>
                  <BarChart data={labComparisonData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(35,35,35,0.06)" />
                    <XAxis dataKey="lab" tick={{ fontSize: 11, fill: '#B8B0A3' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#B8B0A3' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip content={<DarkTooltip suffix="%" />} cursor={{ fill: 'rgba(35,35,35,0.04)' }} />
                    <Bar dataKey="avg_percent" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="font-body text-xs text-ink/40 italic py-8 text-center">Try each lab to see how they compare.</p>
            )}
          </ChartCard>

          <ChartCard title="5. Weekly activity trend" subtitle="Lessons completed per week, last 6 weeks">
            <div style={{ width: '100%', height: 160 }} className="-mx-2">
              <ResponsiveContainer>
                <BarChart data={weekly_lessons} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(35,35,35,0.06)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#B8B0A3' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#B8B0A3' }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(35,35,35,0.04)' }} />
                  <Bar dataKey="lessons" fill="#6E85B7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="6. XP growth" subtitle="Cumulative XP earned over your active days">
            {xp_trajectory?.length > 0 ? (
              <div style={{ width: '100%', height: 160 }} className="-mx-2">
                <ResponsiveContainer>
                  <LineChart data={xp_trajectory} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(35,35,35,0.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#B8B0A3' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#B8B0A3' }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip content={<DarkTooltip />} />
                    <Line type="monotone" dataKey="cumulative_xp" stroke="#E0A94C" strokeWidth={2.5} dot={{ r: 3, fill: '#E0A94C' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="font-body text-xs text-ink/40 italic py-8 text-center">Complete a lesson or lab round to start your XP graph.</p>
            )}
          </ChartCard>

          <ChartCard title="7. Level progress" subtitle={`${LEVEL_LABELS[level_progress.level]} · ${level_progress.completed} of ${level_progress.total} lessons`}>
            <div className="relative flex items-center justify-center" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%" outerRadius="100%" barSize={16}
                  data={levelRadialData} startAngle={90} endAngle={90 - 360 * (levelPercent / 100)}
                >
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'rgba(160,150,135,0.18)' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="font-display text-4xl text-marigold leading-none">{levelPercent}%</p>
                <p className="font-body text-[10px] text-ink/40 mt-1">complete</p>
              </div>
            </div>
          </ChartCard>

        </div>

        <div className="bg-ink rounded-3xl p-6 my-6">
          <p className="font-body text-xs uppercase tracking-wider text-paper/60 mb-1">Level-up forecast</p>
          {completion_forecast.remaining_lessons === 0 ? (
            <p className="font-display text-2xl text-paper">All lessons in {LEVEL_LABELS[completion_forecast.level]} complete! 🎉</p>
          ) : (
            <>
              <p className="font-display text-2xl text-paper mb-1">
                Predicted in ~{completion_forecast.estimated_days} day{completion_forecast.estimated_days === 1 ? '' : 's'}
              </p>
              <p className="font-body text-sm text-paper/60">
                {completion_forecast.projected_date && `Around ${completion_forecast.projected_date} · `}
                {completion_forecast.remaining_lessons} lessons remaining at your current pace
              </p>
            </>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border-2 border-ink/10 rounded-2xl p-5">
            <p className="font-body text-xs text-ink/50 mb-1">Predicted lessons completed</p>
            <div className="flex items-baseline gap-2">
              <span className="font-data text-2xl font-bold text-ink/40">{engagement_forecast.current_lessons}</span>
              <span className="text-ink/30">→</span>
              <span className="font-data text-3xl font-bold text-pencil">{engagement_forecast.predicted_lessons_30d ?? '—'}</span>
            </div>
            <p className="font-body text-[10px] text-ink/40 mt-1">in 30 days, at your current pace</p>
          </div>
          <div className="bg-white border-2 border-ink/10 rounded-2xl p-5">
            <p className="font-body text-xs text-ink/50 mb-1">Predicted total XP</p>
            <div className="flex items-baseline gap-2">
              <span className="font-data text-2xl font-bold text-ink/40">{engagement_forecast.current_xp}</span>
              <span className="text-ink/30">→</span>
              <span className="font-data text-3xl font-bold text-marigold">{engagement_forecast.predicted_xp_30d ?? '—'}</span>
            </div>
            <p className="font-body text-[10px] text-ink/40 mt-1">in 30 days, at your current pace</p>
          </div>
        </div>

        {next_achievement && (
          <div className="bg-white border-2 border-ink/10 rounded-2xl p-5">
            <p className="font-body text-xs text-ink/50 mb-2">Next achievement, predicted</p>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{next_achievement.icon}</span>
              <div>
                <p className="font-display text-lg text-ink">{next_achievement.name}</p>
                <p className="font-body text-sm text-ink/60">
                  {next_achievement.remaining} more {next_achievement.unit} to go
                  {next_achievement.eta_days && ` · about ${next_achievement.eta_days} day${next_achievement.eta_days === 1 ? '' : 's'} away`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}