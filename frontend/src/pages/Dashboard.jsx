import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import StreakCard from '../components/StreakCard'
import XPBadge from '../components/XPBadge'
import StatsPanel from '../components/StatsPanel'
import Achievements from '../components/Achievements'
import Mascot from '../components/Mascot'

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const SKILL_LABELS = { reading_score: 'Reading', writing_score: 'Writing', comprehension_score: 'Comprehension' }
const SKILL_COLORS = { reading_score: '#6E85B7', writing_score: '#C1483D', comprehension_score: '#4F8566' }
const LEVEL_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

function parseDateOnly(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function formatDateOnly(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
function computeLast7Days(currentStreak, lastActivityDate) {
  const activeDates = new Set()
  if (lastActivityDate && currentStreak > 0) {
    let cursor = parseDateOnly(lastActivityDate)
    for (let i = 0; i < currentStreak; i++) {
      activeDates.add(formatDateOnly(cursor))
      cursor.setDate(cursor.getDate() - 1)
    }
  }
  const days = []
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayMidnight)
    d.setDate(todayMidnight.getDate() - i)
    days.push({ active: activeDates.has(formatDateOnly(d)), label: DAY_LETTERS[d.getDay()] })
  }
  return days
}

export default function Dashboard() {
  const { user } = useAuth()
  const profile = user?.profile
  const [leaderboard, setLeaderboard] = useState(null)
  const [levelProgress, setLevelProgress] = useState(null)
  const [voiceStats, setVoiceStats] = useState(null)

  useEffect(() => {
    api.get('/leaderboard/').then(({ data }) => setLeaderboard(data)).catch(() => setLeaderboard(null))
    api.get('/level-progress/').then(({ data }) => setLevelProgress(data)).catch(() => setLevelProgress(null))
    api.get('/curriculum/voice-lab/stats/').then(({ data }) => setVoiceStats(data)).catch(() => setVoiceStats(null))
  }, [])

  if (!profile) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center">
        <p className="font-display text-2xl text-ink">loading your dashboard…</p>
      </div>
    )
  }

  const last7Days = computeLast7Days(profile.current_streak ?? 0, profile.last_activity_date)
  const isActiveToday = profile.last_activity_date === formatDateOnly(new Date())
  const memberSinceDays = profile.created_at
    ? Math.max(1, Math.floor((new Date() - new Date(profile.created_at)) / 86400000))
    : null

  const skillScores = [
    { key: 'reading_score', value: profile.reading_score },
    { key: 'writing_score', value: profile.writing_score },
    { key: 'comprehension_score', value: profile.comprehension_score },
  ].filter((s) => s.value != null)

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-4 sm:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Mascot mood="encouraging" size={56} />
          <div>
            <p className="font-data text-xs uppercase tracking-[0.2em] text-rule">dashboard</p>
            <h1 className="font-display text-3xl text-ink">Everything at a glance</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <MetricChip icon="🔥" value={profile.current_streak ?? 0} label="day streak" color="#E0A94C" />
          <MetricChip icon="⚡" value={profile.xp ?? 0} label="total XP" color="#C1483D" />
          <MetricChip icon="🏆" value={leaderboard?.your_entry ? `#${leaderboard.your_entry.rank}` : '—'} label="leaderboard rank" color="#4F8566" />
          <MetricChip icon="🎯" value={LEVEL_LABELS[profile.overall_level] ?? '—'} label="current level" color="#6E85B7" small />
          <MetricChip icon="📅" value={memberSinceDays ?? '—'} label="days learning" color="#8A8375" />
          <MetricChip icon="🌟" value={profile.longest_streak ?? 0} label="best streak" color="#E0A94C" />
        </div>

        <div className="grid lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-1 space-y-5">
            <StreakCard current={profile.current_streak ?? 0} longest={profile.longest_streak ?? 0} isActiveToday={isActiveToday} last7Days={last7Days} />
            <XPBadge xp={profile.xp ?? 0} />

            {skillScores.length > 0 && (
              <div className="bg-white border-2 border-ink/10 rounded-3xl p-5">
                <h3 className="font-display text-lg text-ink mb-3">Skill breakdown</h3>
                <div className="space-y-2">
                  {skillScores.map((s) => (
                    <div key={s.key} className="flex items-center gap-2">
                      <span className="font-body text-xs text-ink/60 w-24 shrink-0">{SKILL_LABELS[s.key]}</span>
                      <div className="flex-1 h-2 bg-ink/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: SKILL_COLORS[s.key] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.value}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                      <span className="font-data text-xs font-bold w-7 text-right">{Math.round(s.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {levelProgress && (
              <div className="bg-white border-2 border-ink/10 rounded-3xl p-5">
                <h3 className="font-display text-lg text-ink mb-3">{LEVEL_LABELS[levelProgress.level]} progress</h3>
                <div className="h-2.5 w-full bg-ink/10 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="h-full bg-marigold rounded-full"
                    animate={{ width: `${levelProgress.total_lessons ? (levelProgress.completed_lessons / levelProgress.total_lessons) * 100 : 0}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <p className="font-body text-xs text-ink/50">{levelProgress.completed_lessons} of {levelProgress.total_lessons} lessons complete</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-5">
            <StatsPanel />

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white border-2 border-ink/10 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">🎙️</p>
                <p className="font-data text-lg font-bold text-ink">{voiceStats?.total_attempts ?? 0}</p>
                <p className="font-body text-[11px] text-ink/50 mb-2">voice attempts</p>
                <Link to="/voice-lab" className="font-body text-xs font-semibold text-pencil hover:underline">Practice →</Link>
              </div>
              <div className="bg-white border-2 border-ink/10 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">🖼️</p>
                <p className="font-data text-lg font-bold text-ink">—</p>
                <p className="font-body text-[11px] text-ink/50 mb-2">picture rounds</p>
                <Link to="/picture-lab" className="font-body text-xs font-semibold text-pencil hover:underline">Practice →</Link>
              </div>
              <div className="bg-white border-2 border-ink/10 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">🔊</p>
                <p className="font-data text-lg font-bold text-ink">—</p>
                <p className="font-body text-[11px] text-ink/50 mb-2">listening rounds</p>
                <Link to="/listening-lab" className="font-body text-xs font-semibold text-pencil hover:underline">Practice →</Link>
              </div>
            </div>

            <Achievements />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricChip({ icon, value, label, color, small }) {
  return (
    <div className="bg-white border-2 border-ink/10 rounded-2xl px-3 py-4 text-center">
      <p className="text-xl mb-1">{icon}</p>
      <p className={`font-data font-bold ${small ? 'text-sm' : 'text-xl'}`} style={{ color }}>{value}</p>
      <p className="font-body text-[10px] text-ink/50 mt-0.5">{label}</p>
    </div>
  )
}