import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Assessment from './pages/Assessment'
import Settings from './pages/Settings'
import Curriculum from './pages/Curriculum'
import TestResults from './pages/TestResults'
import LearningPath from './pages/LearningPath'
import LessonPlayer from './pages/LessonPlayer'
import Leaderboard from './pages/Leaderboard'
import VoiceLab from './pages/VoiceLab'
import PictureLab from './pages/PictureLab'
import ListeningLab from './pages/ListeningLab'
import Dashboard from './pages/Dashboard'
import Community from './pages/Community'
import Assistant from './pages/Assistant'
import HelpCentre from './pages/HelpCentre'
import Privacy from './pages/Privacy'
import Insights from './pages/Insights'
import MarginGame from './components/MarginGame'

export default function App() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <MarginGame />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/help" element={<HelpCentre />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/curriculum" element={<ProtectedRoute><Curriculum /></ProtectedRoute>} />
        <Route path="/test-results" element={<ProtectedRoute><TestResults /></ProtectedRoute>} />
        <Route path="/learning-path" element={<ProtectedRoute><LearningPath /></ProtectedRoute>} />
        <Route path="/lessons/:lessonId" element={<ProtectedRoute><LessonPlayer /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/voice-lab" element={<ProtectedRoute><VoiceLab /></ProtectedRoute>} />
        <Route path="/picture-lab" element={<ProtectedRoute><PictureLab /></ProtectedRoute>} />
        <Route path="/listening-lab" element={<ProtectedRoute><ListeningLab /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}