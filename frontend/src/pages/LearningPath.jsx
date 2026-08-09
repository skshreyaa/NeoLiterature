import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import Mascot from '../components/Mascot'
import PredictionsChart from '../components/PredictionsChart'

const STATUS_STYLES = { pending: 'border-ink/10 bg-white', completed: 'border-sage bg-sage/5', skipped: 'border-ink/10 bg-paper opacity-50' }
const SKILL_LABELS = { reading: 'Reading', writing: 'Writing', comprehension: 'Comprehension' }
const LEVEL_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

export default function LearningPath() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [scorePredictions, setScorePredictions] = useState([])
  const [historicalTrend, setHistoricalTrend] = useState({})
  const [completionForecast, setCompletionForecast] = useState(null)
  const [levelProgress, setLevelProgress] = useState(null)
  const [levelingUp, setLevelingUp] = useState(false)

  const loadPath = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/learning-path/')
      setEntries(data)
    } catch {
      setError('Could not load your learning path.')
    } finally {
      setLoading(false)
    }
  }

  const loadPredictions = async () => {
    try {
      const { data } = await api.get('/predictions/')
      setScorePredictions(data.score_predictions || [])
      setHistoricalTrend(data.historical_trend || {})
      setCompletionForecast(data.completion_forecast || null)
    } catch {
      setScorePredictions([])
      setHistoricalTrend({})
      setCompletionForecast(null)
    }
  }

  const loadLevelProgress = async () => {
    try {
      const { data } = await api.get('/level-progress/')
      setLevelProgress(data)
    } catch {
      setLevelProgress(null)
    }
  }

  const loadEverything = async () => {
    await Promise.all([loadPath(), loadPredictions(), loadLevelProgress()])
  }

  useEffect(() => { loadEverything() }, [])

  const generatePath = async () => {
    setError(null)
    setGenerating(true)
    try {
      await api.post('/learning-path/')
      await loadEverything()
    } catch (err) {
      setError(err.response?.data?.error || 'Could not generate a learning path yet.')
    } finally {
      setGenerating(false)
    }
  }

  const handleLevelUp = async () => {
    setLevelingUp(true)
    try {
      await api.post('/level-up/')
      await loadEverything()
    } catch (err) {
      setError(err.response?.data?.error || 'Could not move up a level yet.')
    } finally {
      setLevelingUp(false)
    }
  }

  const completedCount = entries.filter((e) => e.status === 'completed').length
  const progressPercent = entries.length ? (completedCount / entries.length) * 100 : 0

  if (loading) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center">
        <p className="font-display text-2xl text-ink">loading your path…</p>
      </div>
    )
  }

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Mascot mood="encouraging" size={56} />
          <div>
            <p className="font-data text-xs uppercase tracking-[0.2em] text-rule">learning path</p>
            <h1 className="font-display text-3xl text-ink">Your next lessons</h1>
          </div>
        </div>

        {completionForecast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-ink text-paper rounded-2xl p-6"
          >
            {completionForecast.remaining_lessons === 0 ? (
              <p className="font-display text-xl">You've finished every lesson in {LEVEL_LABELS[completionForecast.level]}! 🎉</p>
            ) : (
              <>
                <p className="font-body text-xs uppercase tracking-wider text-paper/60 mb-1">at your current pace</p>
                <p className="font-display text-3xl mb-1">
                  ~{completionForecast.estimated_days} day{completionForecast.estimated_days === 1 ? '' : 's'} to finish {LEVEL_LABELS[completionForecast.level]}
                </p>
                <p className="font-body text-sm text-paper/70">
                  {completionForecast.remaining_lessons} lesson{completionForecast.remaining_lessons === 1 ? '' : 's'} left
                  {completionForecast.pace_per_day ? ` · you're completing about ${completionForecast.pace_per_day} lessons/day` : ''}
                </p>
              </>
            )}
          </motion.div>
        )}

        {levelProgress && (
          <div className="mt-4 bg-white border-2 border-ink/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-sm font-semibold text-ink">{LEVEL_LABELS[levelProgress.level]} progress</span>
              <span className="font-data text-xs text-ink/50">{levelProgress.completed_lessons} / {levelProgress.total_lessons} lessons</span>
            </div>
            <div className="h-2.5 w-full bg-ink/10 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-marigold rounded-full"
                animate={{ width: `${levelProgress.total_lessons ? (levelProgress.completed_lessons / levelProgress.total_lessons) * 100 : 0}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {levelProgress.all_complete && levelProgress.next_level && (
              <motion.button
                onClick={handleLevelUp}
                disabled={levelingUp}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-sage text-paper font-body font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {levelingUp ? 'Moving up…' : `🎉 Move up to ${LEVEL_LABELS[levelProgress.next_level]}`}
              </motion.button>
            )}
            {levelProgress.all_complete && !levelProgress.next_level && (
              <p className="font-body text-sm text-sage font-semibold text-center">You've completed the highest level available. 🎉</p>
            )}
          </div>
        )}

        {scorePredictions.length > 0 && (
          <div className="mt-4">
            <PredictionsChart scorePredictions={scorePredictions} historicalTrend={historicalTrend} />
          </div>
        )}

        {entries.length > 0 && (
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-body text-xs text-ink/50">{completedCount} of {entries.length} done</span>
              <span className="font-data text-xs text-sage font-bold">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-3 w-full bg-ink/10 rounded-full overflow-hidden">
              <motion.div className="h-full bg-sage rounded-full" animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
            </div>
          </div>
        )}

        {error && <p className="font-body text-sm text-pencil mt-4">{error}</p>}

        {entries.length === 0 ? (
          <div className="mt-8 border-2 border-dashed border-ink/20 rounded-2xl p-8 text-center">
            <p className="font-body text-ink/70 mb-4">You don't have a learning path yet. Generate one based on your assessment results.</p>
            <motion.button
              onClick={generatePath}
              disabled={generating}
              whileTap={{ scale: 0.98 }}
              className="bg-pencil text-paper font-body font-bold px-6 py-3 rounded-2xl hover:bg-ink transition-colors disabled:opacity-50 shadow-[0_4px_0_0_#8f342b]"
            >
              {generating ? 'Building your path…' : 'Generate my learning path'}
            </motion.button>
          </div>
        ) : (
          <>
            <button onClick={generatePath} disabled={generating} className="mt-4 mb-6 font-body text-sm text-rule hover:underline">
              {generating ? 'Regenerating…' : 'Regenerate path'}
            </button>

            <div className="space-y-3">
              <AnimatePresence>
                {entries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`border-2 rounded-2xl ${STATUS_STYLES[entry.status]}`}
                  >
                    <Link
                      to={entry.status === 'pending' ? `/lessons/${entry.lesson.id}?path_entry=${entry.id}` : '#'}
                      className={`block px-5 py-4 ${entry.status !== 'pending' ? 'pointer-events-none' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-data text-xs text-ink/50">Day {entry.day_number}</span>
                        {entry.status === 'completed' ? (
                          <span className="font-body text-xs font-bold text-sage">✓ Completed</span>
                        ) : (
                          <span className="font-body text-xs font-bold text-pencil">Start →</span>
                        )}
                      </div>
                      <p className="font-display text-lg text-ink mb-1">{entry.lesson.title}</p>
                      {entry.reason && <p className="font-body text-sm text-ink/60">{entry.reason}</p>}
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  )
}