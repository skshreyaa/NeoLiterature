import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced']
const LEVEL_STYLES = {
  beginner: { color: '#4F8566', bg: '#EEF5F0', icon: '🌱' },
  intermediate: { color: '#E0A94C', bg: '#FBF3E4', icon: '🌿' },
  advanced: { color: '#C1483D', bg: '#FBEDEA', icon: '🌳' },
}
// zig-zag horizontal offsets for the winding path feel, repeating every 4 nodes
const X_OFFSETS = [0, 60, 0, -60]

export default function Curriculum() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [levels, setLevels] = useState([])
  const [completedIds, setCompletedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  const userLevelIndex = LEVEL_ORDER.indexOf(user?.profile?.overall_level || 'beginner')

  useEffect(() => {
    Promise.all([
      api.get('/curriculum/levels/'),
      api.get('/completed-lessons/'),
    ]).then(([levelsRes, completedRes]) => {
      setLevels(levelsRes.data)
      setCompletedIds(new Set(completedRes.data.completed_lesson_ids))
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center">
        <p className="font-display text-2xl text-ink">loading your map…</p>
      </div>
    )
  }

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-16">
      <div className="max-w-md mx-auto">
        <p className="font-data text-xs uppercase tracking-[0.2em] text-rule mb-2 text-center">curriculum</p>
        <h1 className="font-display text-4xl text-ink mb-12 text-center">Your learning map</h1>

        {levels.map((level, levelIdx) => {
          const style = LEVEL_STYLES[level.name] || LEVEL_STYLES.beginner
          const isLocked = levelIdx > userLevelIndex
          const allLessons = level.categories.flatMap((c) => c.lessons)

          // Sequential unlocking: a lesson is playable if it's already completed,
          // OR it's the first not-yet-completed lesson in this level.
          let firstIncompleteFound = false
          const lessonStates = allLessons.map((lesson) => {
            const isCompleted = completedIds.has(lesson.id)
            let state = 'locked'
            if (isCompleted) state = 'completed'
            else if (!firstIncompleteFound && !isLocked) {
              state = 'current'
              firstIncompleteFound = true
            }
            return { lesson, state }
          })

          return (
            <div key={level.id} className="mb-16">
              {/* Level banner */}
              <div className="flex items-center gap-3 mb-8 justify-center">
                <span
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-2"
                  style={{ backgroundColor: isLocked ? '#EDE9DE' : style.bg, borderColor: isLocked ? '#D8D2C4' : style.color }}
                >
                  {isLocked ? '🔒' : style.icon}
                </span>
                <div>
                  <h2 className="font-display text-2xl capitalize" style={{ color: isLocked ? '#B8B0A3' : style.color }}>
                    {level.name}
                  </h2>
                  {isLocked && (
                    <p className="font-body text-xs text-ink/40">
                      Finish {LEVEL_ORDER[levelIdx - 1]} to unlock
                    </p>
                  )}
                </div>
              </div>

              {/* Winding path of lesson nodes */}
              <div className="relative flex flex-col items-center gap-8">
                {lessonStates.map(({ lesson, state }, i) => {
                  const offset = X_OFFSETS[i % X_OFFSETS.length]
                  const clickable = state === 'completed' || state === 'current'
                  return (
                    <div key={lesson.id} className="relative w-full flex flex-col items-center">
                      {/* connecting line to next node */}
                      {i < lessonStates.length - 1 && (
                        <div
                          className="absolute top-16 w-1 h-8 -z-10"
                          style={{
                            backgroundColor: state === 'completed' ? style.color : '#E5E0D3',
                            left: '50%',
                            transform: `translateX(calc(-50% + ${offset}px))`,
                          }}
                        />
                      )}
                      <motion.button
                        onClick={() => clickable && navigate(`/lessons/${lesson.id}`)}
                        disabled={!clickable}
                        whileHover={clickable ? { scale: 1.08 } : {}}
                        whileTap={clickable ? { scale: 0.95 } : {}}
                        animate={state === 'current' ? { scale: [1, 1.06, 1] } : {}}
                        transition={state === 'current' ? { duration: 1.6, repeat: Infinity } : {}}
                        style={{ transform: `translateX(${offset}px)` }}
                        className="relative flex flex-col items-center gap-1"
                      >
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4 shadow-md"
                          style={{
                            backgroundColor: state === 'completed' ? style.color : state === 'current' ? '#FFFFFF' : '#EDE9DE',
                            borderColor: state === 'current' ? style.color : state === 'completed' ? style.color : '#D8D2C4',
                          }}
                        >
                          {state === 'completed' ? '✓' : state === 'locked' ? '🔒' : '★'}
                        </div>
                        <span
                          className="font-body text-xs font-semibold text-center max-w-[110px] leading-tight"
                          style={{ color: state === 'locked' ? '#B8B0A3' : '#232323' }}
                        >
                          {lesson.title}
                        </span>
                      </motion.button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}