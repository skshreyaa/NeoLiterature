import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Mascot from '../components/Mascot'
import Confetti from '../components/Confetti'
import XPToast from '../components/XPToast'
import PictureMatchGame from '../components/PictureMatchGame'

export default function LessonPlayer() {
  const { lessonId } = useParams()
  const [searchParams] = useSearchParams()
  const pathEntryId = searchParams.get('path_entry')
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()

  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState('intro')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [xpEarned, setXpEarned] = useState(null)
  const [answerKey, setAnswerKey] = useState({})
  const [gameExercises, setGameExercises] = useState([])

  useEffect(() => {
    api.get(`/curriculum/lessons/${lessonId}/`).then(({ data }) => { setLesson(data); setLoading(false) })
  }, [lessonId])

  const exercises = lesson?.exercises || []
  const currentExercise = exercises[exerciseIndex]
  const mascotMood = feedback === 'correct' ? 'celebrating' : feedback === 'incorrect' ? 'thinking' : 'encouraging'

  const handleAnswer = async (option) => {
    if (feedback) return
    setSelectedOption(option)
    const { data } = await api.post('/curriculum/exercises/check/', { exercise_id: currentExercise.id, answer: option })
    setFeedback(data.correct ? 'correct' : 'incorrect')
    if (data.correct) setCorrectCount((c) => c + 1)
    // The backend only reveals correct_answer AFTER you answer - capture it here
    // so the picture-match game (which needs the answer word) can use it safely.
    setAnswerKey((prev) => ({ ...prev, [currentExercise.id]: data.correct_answer }))
    setTimeout(() => {
      if (exerciseIndex + 1 < exercises.length) {
        setExerciseIndex((i) => i + 1); setSelectedOption(null); setFeedback(null)
      } else {
        const exercisesWithAnswers = exercises.map((e) => ({
          ...e,
          correct_answer: answerKey[e.id] || (e.id === currentExercise.id ? data.correct_answer : undefined),
        }))
        const imageExerciseCount = exercisesWithAnswers.filter((e) => e.image_url && e.correct_answer).length
        if (imageExerciseCount >= 2) {
          setGameExercises(exercisesWithAnswers)
          setStage('game')
        } else {
          finishLesson()
        }
      }
    }, 900)
  }

  const finishLesson = async () => {
    const quizScore = exercises.length ? (correctCount / exercises.length) * 100 : null
    let response
    if (pathEntryId) {
      response = await api.put('/learning-path/complete/', {
        entry_id: Number(pathEntryId), time_spent_minutes: 5, quiz_score: quizScore,
      })
    } else {
      response = await api.post('/learning-path/log-activity/', {
        lesson_id: Number(lessonId), time_spent_minutes: 5, quiz_score: quizScore,
      })
    }
    setXpEarned(response.data.xp_earned ?? null)
    await refreshProfile()
    setStage('done')
  }

  if (loading) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center">
        <p className="font-display text-2xl text-ink">loading lesson…</p>
      </div>
    )
  }

  if (stage === 'intro') {
    const content = lesson.contents?.[0]
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl bg-white rounded-3xl border-2 border-ink/10 p-8">
          <div className="flex items-center gap-4 mb-6">
            <Mascot mood="encouraging" size={56} />
            <div>
              <p className="font-data text-xs uppercase tracking-[0.2em] text-rule">lesson</p>
              <h1 className="font-display text-2xl text-ink">{lesson.title}</h1>
            </div>
          </div>
          <p className="font-body text-ink/80 mb-8">{content?.body}</p>
          <motion.button
            onClick={() => setStage('exercises')}
            whileTap={{ scale: 0.98 }}
            className="bg-pencil text-paper font-body font-bold px-6 py-3 rounded-2xl hover:bg-ink transition-colors shadow-[0_4px_0_0_#8f342b]"
          >
            {exercises.length ? 'Start practice' : 'Done'}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (stage === 'game') {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full">
          <div className="flex items-center gap-4 mb-6 justify-center">
            <Mascot mood="celebrating" size={56} />
            <div>
              <p className="font-data text-xs uppercase tracking-[0.2em] text-rule text-center">bonus round</p>
              <h1 className="font-display text-2xl text-ink text-center">Match the pictures!</h1>
            </div>
          </div>
          <PictureMatchGame exercises={gameExercises} onComplete={() => finishLesson()} />
        </div>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center px-6">
        <Confetti />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
          <Mascot mood="celebrating" size={130} />
          <h1 className="font-display text-3xl text-ink mt-4 mb-2">Lesson complete!</h1>
          {exercises.length > 0 && <p className="font-body text-ink/70 mb-4">You got {correctCount} out of {exercises.length} correct.</p>}
          {xpEarned != null && (
            <div className="flex justify-center mb-8">
              <XPToast amount={xpEarned} />
            </div>
          )}
          <motion.button
            onClick={() => navigate(pathEntryId ? '/learning-path' : '/curriculum')}
            whileTap={{ scale: 0.98 }}
            className="bg-pencil text-paper font-body font-bold px-6 py-3 rounded-2xl hover:bg-ink transition-colors shadow-[0_4px_0_0_#8f342b]"
          >
            {pathEntryId ? 'Back to my path' : 'Back to lessons'}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const progress = (exerciseIndex / exercises.length) * 100
  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-4 flex-1 bg-ink/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-sage rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
          <Mascot mood={mascotMood} size={48} />
        </div>
        <p className="font-data text-xs text-ink/50 mb-8">Question {exerciseIndex + 1} of {exercises.length}</p>
        <AnimatePresence mode="wait">
          <motion.div key={exerciseIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="bg-white rounded-3xl border-2 border-ink/10 p-6 sm:p-8">
            {currentExercise.image_url && (
              <div className="flex justify-center mb-6">
                <img src={currentExercise.image_url} alt="" className="w-32 h-32 rounded-2xl object-cover" />
              </div>
            )}
            <h2 className="font-display text-xl text-ink mb-6 text-center">{currentExercise.question_text}</h2>
            <div className="grid gap-3">
              {currentExercise.options.map((option) => {
                const isSelected = selectedOption === option
                const showCorrect = feedback && isSelected && feedback === 'correct'
                const showWrong = feedback === 'incorrect' && isSelected
                return (
                  <motion.button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    whileHover={!feedback ? { scale: 1.02 } : {}}
                    whileTap={{ scale: 0.98 }}
                    animate={showCorrect ? { backgroundColor: '#4F8566', color: '#FBF8F1', borderColor: '#4F8566' } : showWrong ? { backgroundColor: '#C1483D', color: '#FBF8F1', borderColor: '#C1483D' } : {}}
                    className="w-full border-2 border-ink/15 rounded-2xl px-5 py-4 font-body font-semibold text-ink transition-colors disabled:cursor-default"
                    disabled={!!feedback}
                  >
                    {option}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}