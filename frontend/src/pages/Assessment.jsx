import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import VoiceReader from '../components/VoiceReader'
import VirtualKeyboard from '../components/VirtualKeyboard'
import ScoreMark from '../components/ScoreMark'
import Mascot from '../components/Mascot'
import Confetti from '../components/Confetti'

const SECTIONS = ['reading', 'writing', 'comprehension']
const SECTION_LABELS = { reading: 'Reading', writing: 'Writing', comprehension: 'Comprehension' }

export default function Assessment() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [sectionIndex, setSectionIndex] = useState(0)
  const [questions, setQuestions] = useState([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState(false)
  const [finalScores, setFinalScores] = useState(null)

  const currentType = SECTIONS[sectionIndex]
  const currentQuestion = questions[questionIndex]
  const mascotMood = feedback === 'correct' ? 'celebrating' : feedback === 'incorrect' ? 'thinking' : 'encouraging'

  const loadSectionQuestions = useCallback(async (type) => {
    setLoading(true)
    const { data } = await api.get(`/assessments/questions/?type=${type}`)
    setQuestions(data); setQuestionIndex(0); setAnswer(''); setSelectedOption(null)
    setLoading(false)
  }, [])

  useEffect(() => { loadSectionQuestions(currentType) }, [currentType, loadSectionQuestions])

  const submitAnswer = async (answerText) => {
    await api.post('/assessments/submit/', { question: currentQuestion.id, answer_text: answerText })
  }

  const goToNextQuestion = async () => {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((i) => i + 1); setAnswer(''); setSelectedOption(null); setFeedback(null)
    } else {
      await api.post('/assessments/finalize/', { assessment_type: currentType })
      if (sectionIndex + 1 < SECTIONS.length) setSectionIndex((i) => i + 1)
      else {
        await refreshProfile()
        const { data: profileData } = await api.get('/users/profile/')
        setFinalScores(profileData.profile); setFinished(true)
      }
    }
  }

  const handleMCQSubmit = async (option) => {
    setSelectedOption(option)
    const isCorrect = option === currentQuestion.correct_answer
    setFeedback(isCorrect ? 'correct' : 'incorrect')
    await submitAnswer(option)
    setTimeout(goToNextQuestion, 700)
  }

  const handleFreeTextSubmit = async () => {
    if (!answer.trim()) return
    await submitAnswer(answer)
    goToNextQuestion()
  }

  const overallProgress = ((sectionIndex + (questions.length ? questionIndex / questions.length : 0)) / SECTIONS.length) * 100

  if (finished) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center px-6">
        <Confetti />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
          <p className="font-data text-xs uppercase tracking-[0.2em] text-rule mb-2">assessment complete</p>
          <h1 className="font-display text-4xl text-ink mb-8">Nice work.</h1>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <ScoreMark label="Reading" score={finalScores?.reading_score} />
            <ScoreMark label="Writing" score={finalScores?.writing_score} />
            <ScoreMark label="Comprehension" score={finalScores?.comprehension_score} />
          </div>
          <p className="font-body text-ink/70 mb-1">Your level:</p>
          <p className="font-display text-3xl text-pencil mb-8 capitalize">{finalScores?.overall_level}</p>
          <button onClick={() => navigate('/profile')} className="bg-pencil text-paper font-body font-semibold px-6 py-3 rounded-sm hover:bg-ink transition-colors focus-ring">Go to my page</button>
        </motion.div>
      </div>
    )
  }

  if (loading || !currentQuestion) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center">
        <p className="font-display text-2xl text-ink">{loading ? 'loading questions…' : 'no questions available for this section yet'}</p>
      </div>
    )
  }

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-4 flex-1 bg-ink/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-sage rounded-full" animate={{ width: `${overallProgress}%` }} transition={{ duration: 0.4 }} />
          </div>
          <Mascot mood={mascotMood} size={56} />
        </div>
        <p className="font-data text-xs text-ink/50 mb-8">
          {SECTION_LABELS[currentType]}
          {currentQuestion.is_tutorial ? ' — practice question' : ` — question ${questionIndex + 1} of ${questions.length}`}
        </p>
        <AnimatePresence mode="wait">
          <motion.div key={`${currentType}-${questionIndex}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-white rounded-3xl border-2 border-ink/10 p-6 sm:p-8">
            {currentQuestion.image_url && <img src={currentQuestion.image_url} alt="" className="w-full max-h-64 object-cover rounded-2xl mb-6" />}
            {currentQuestion.passage && <div className="mb-6 border-l-4 border-rule pl-4"><p className="font-body text-ink/80 italic">{currentQuestion.passage}</p></div>}
            <h2 className="font-display text-2xl text-ink mb-6">{currentQuestion.question_text}</h2>
            {currentType === 'reading' ? (
              <div className="flex flex-col items-center gap-6">
                <VoiceReader onTranscriptChange={setAnswer} />
                <button onClick={handleFreeTextSubmit} disabled={!answer.trim()}
                  className="bg-pencil text-paper font-body font-bold px-8 py-4 rounded-2xl hover:bg-ink transition-colors disabled:opacity-40 shadow-[0_4px_0_0_#8f342b]">Submit reading</button>
              </div>
            ) : currentQuestion.options?.length ? (
              <div className="grid gap-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOption === option
                  const showCorrect = feedback && option === currentQuestion.correct_answer
                  const showWrong = feedback === 'incorrect' && isSelected
                  return (
                    <motion.button key={option} onClick={() => !feedback && handleMCQSubmit(option)} whileHover={!feedback ? { scale: 1.02 } : {}} whileTap={{ scale: 0.98 }}
                      animate={showCorrect ? { backgroundColor: '#4F8566', color: '#FBF8F1', borderColor: '#4F8566' } : showWrong ? { backgroundColor: '#C1483D', color: '#FBF8F1', borderColor: '#C1483D' } : {}}
                      className="w-full text-left border-2 border-ink/15 rounded-2xl px-5 py-4 font-body font-semibold text-ink transition-colors disabled:cursor-default" disabled={!!feedback}>
                      {option}
                    </motion.button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <VirtualKeyboard language={currentQuestion.language} value={answer} onChange={setAnswer} />
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} placeholder="Write your answer here..."
                  className="w-full border-2 border-ink/15 rounded-2xl p-4 font-body text-ink outline-none focus:border-rule" />
                <button onClick={handleFreeTextSubmit} disabled={!answer.trim()}
                  className="self-start bg-pencil text-paper font-body font-bold px-8 py-4 rounded-2xl hover:bg-ink transition-colors disabled:opacity-40 shadow-[0_4px_0_0_#8f342b]">Submit answer</button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}