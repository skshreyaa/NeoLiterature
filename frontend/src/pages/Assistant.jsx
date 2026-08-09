import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import Mascot from '../components/Mascot'

export default function Assistant() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)

  const loadHistory = async () => {
    setLoading(true)
    const { data } = await api.get('/assistant/history/')
    setMessages(data)
    setLoading(false)
  }

  useEffect(() => { loadHistory() }, [])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const userText = input.trim()
    setInput('')
    setSending(true)

    setMessages((prev) => [...prev, { id: `temp-${Date.now()}`, role: 'user', content: userText, created_at: new Date().toISOString() }])

    try {
      const { data } = await api.post('/assistant/chat/', { message: userText })
      setMessages((prev) => [...prev, data])
    } catch {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: 'assistant', content: "Sorry, something went wrong. Try again?", created_at: new Date().toISOString() }])
    } finally {
      setSending(false)
    }
  }

  const clearChat = async () => {
    await api.post('/assistant/clear/')
    setMessages([])
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="notebook-page min-h-[calc(100vh-73px)] flex items-center justify-center">
        <p className="font-display text-2xl text-ink">loading your assistant…</p>
      </div>
    )
  }

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-10 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Mascot mood="encouraging" size={48} />
            <div>
              <p className="font-data text-xs uppercase tracking-[0.2em] text-rule">ai assistant</p>
              <h1 className="font-display text-2xl text-ink">Ask me anything</h1>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="font-body text-xs text-ink/40 hover:text-pencil transition-colors">
              Clear chat
            </button>
          )}
        </div>

        <div className="flex-1 bg-white border-2 border-ink/10 rounded-3xl p-5 mb-4 overflow-y-auto" style={{ minHeight: '400px', maxHeight: '55vh' }}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <p className="font-body text-sm text-ink/50 mb-2">Ask about a lesson, get help with a word, or just say hi!</p>
              <p className="font-body text-xs text-ink/30">"What does 'synonym' mean?" · "What should I practice next?"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 font-body text-sm ${
                      msg.role === 'user' ? 'bg-pencil text-paper' : 'bg-paper text-ink border border-ink/10'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-paper border border-ink/10 rounded-2xl px-4 py-2.5">
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="font-body text-sm text-ink/50"
                    >
                      thinking…
                    </motion.span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your question…"
            className="flex-1 bg-white border-2 border-ink/15 focus:border-rule rounded-2xl px-4 py-3 font-body text-ink outline-none transition-colors"
          />
          <motion.button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            whileTap={{ scale: 0.96 }}
            className="bg-pencil text-paper font-body font-bold px-6 py-3 rounded-2xl hover:bg-ink transition-colors disabled:opacity-40"
          >
            Send
          </motion.button>
        </div>
      </div>
    </div>
  )
}