import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import Mascot from '../components/Mascot'

const EVENT_ICONS = {
  perfect_lesson: '💯',
  lab_best: '🏆',
  level_up: '🎉',
  streak_milestone: '🔥',
}

const CATEGORY_ICONS = {
  website: '🌐',
  video: '🎬',
  book: '📖',
  community: '👥',
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function CommentThread({ postId, isOpen }) {
  const [comments, setComments] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const loadComments = () => {
    api.get(`/community/posts/${postId}/comments/`).then(({ data }) => setComments(data)).catch(() => setComments([]))
  }

  useEffect(() => {
    if (isOpen && comments === null) loadComments()
  }, [isOpen])

  const submitComment = async (e) => {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await api.post(`/community/posts/${postId}/comments/`, { content: text.trim() })
      setText('')
      loadComments()
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mt-3 pt-3 border-t border-ink/10"
    >
      {comments === null ? (
        <p className="font-body text-xs text-ink/40">loading comments…</p>
      ) : (
        <div className="space-y-2 mb-3">
          {comments.length === 0 ? (
            <p className="font-body text-xs text-ink/40 italic">No comments yet — be the first to reply.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="bg-paper rounded-xl px-3 py-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-body text-xs font-bold text-ink">{c.username}</span>
                  <span className="font-data text-[10px] text-ink/30">{timeAgo(c.created_at)}</span>
                </div>
                <p className="font-body text-xs text-ink/70">{c.content}</p>
              </div>
            ))
          )}
        </div>
      )}
      <form onSubmit={submitComment} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Reply…"
          maxLength={280}
          className="flex-1 bg-paper border-2 border-ink/15 focus:border-rule rounded-xl px-3 py-2 font-body text-xs text-ink outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="bg-ink text-paper font-body text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-40"
        >
          Reply
        </button>
      </form>
    </motion.div>
  )
}

export default function Community() {
  const [items, setItems] = useState(null)
  const [postText, setPostText] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState(null)
  const [openCommentsId, setOpenCommentsId] = useState(null)
  const [resources, setResources] = useState(null)

  const loadFeed = () => {
    api.get('/community/feed/').then(({ data }) => setItems(data)).catch(() => setItems([]))
  }

  useEffect(() => {
    loadFeed()
    api.get('/community/resources/').then(({ data }) => setResources(data)).catch(() => setResources([]))
  }, [])

  const submitPost = async (e) => {
    e.preventDefault()
    if (!postText.trim() || posting) return
    setPosting(true)
    setPostError(null)
    try {
      await api.post('/community/posts/', { content: postText.trim() })
      setPostText('')
      loadFeed()
    } catch (err) {
      setPostError(err.response?.data?.error || 'Could not post right now.')
    } finally {
      setPosting(false)
    }
  }

  const toggleReaction = async (item) => {
    if (item.kind !== 'post') return
    const postId = item._raw_id
    setItems((prev) => prev.map((it) =>
      it.id === item.id
        ? { ...it, user_has_reacted: !it.user_has_reacted, reaction_count: it.reaction_count + (it.user_has_reacted ? -1 : 1) }
        : it
    ))
    try {
      await api.post(`/community/posts/${postId}/react/`)
    } catch {
      loadFeed()
    }
  }

  const toggleComments = (item) => {
    if (item.kind !== 'post') return
    setOpenCommentsId((current) => (current === item.id ? null : item.id))
  }

  return (
    <div className="notebook-page min-h-[calc(100vh-73px)] px-6 sm:px-10 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Mascot mood="encouraging" size={56} />
          <div>
            <p className="font-data text-xs uppercase tracking-[0.2em] text-rule">community</p>
            <h1 className="font-display text-3xl text-ink">What's happening</h1>
          </div>
        </div>
        <p className="font-body text-sm text-ink/60 mb-6">
          Real milestones and posts from learners across the community — as they happen.
        </p>

        {resources && resources.length > 0 && (
          <div className="bg-white border-2 border-ink/10 rounded-2xl p-4 mb-6">
            <h2 className="font-display text-lg text-ink mb-1">Recommended for your level</h2>
            <p className="font-body text-xs text-ink/50 mb-3">Real, free resources to keep practicing outside the app.</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {resources.map((r) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-paper border-2 border-ink/10 rounded-xl p-3 hover:border-rule transition-colors"
                >
                  <span className="text-lg">{CATEGORY_ICONS[r.category] || '🔗'}</span>
                  <p className="font-body text-xs font-bold text-ink mt-1">{r.title}</p>
                  <p className="font-body text-[10px] text-ink/50 mt-0.5">{r.description}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={submitPost} className="bg-white border-2 border-ink/10 rounded-2xl p-4 mb-6">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="Share something with other learners…"
            maxLength={280}
            rows={2}
            className="w-full bg-paper border-2 border-ink/15 focus:border-rule rounded-xl px-4 py-3 font-body text-sm text-ink outline-none resize-none mb-2"
          />
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-ink/30">{postText.length}/280</span>
            <motion.button
              type="submit"
              disabled={!postText.trim() || posting}
              whileTap={{ scale: 0.97 }}
              className="bg-pencil text-paper font-body font-bold text-sm px-5 py-2 rounded-xl hover:bg-ink transition-colors disabled:opacity-40"
            >
              {posting ? 'Posting…' : 'Post'}
            </motion.button>
          </div>
          {postError && <p className="font-body text-xs text-pencil mt-2">{postError}</p>}
        </form>

        {items === null ? (
          <p className="font-display text-xl text-ink text-center py-12">loading…</p>
        ) : items.length === 0 ? (
          <div className="border-2 border-dashed border-ink/20 rounded-2xl p-8 text-center">
            <p className="font-body text-ink/70">No activity yet — be the first to post, finish a lesson, or level up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white border-2 border-ink/10 rounded-2xl px-5 py-4"
                >
                  {item.kind === 'event' ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0">{EVENT_ICONS[item.event_type] || '✨'}</span>
                      <div className="flex-1">
                        <p className="font-body text-sm text-ink">
                          <span className="font-bold">{item.username}</span> {item.description}
                        </p>
                      </div>
                      <span className="font-data text-xs text-ink/40 shrink-0">{timeAgo(item.created_at)}</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-body text-sm font-bold text-ink">{item.username}</span>
                        <span className="font-data text-xs text-ink/40">{timeAgo(item.created_at)}</span>
                      </div>
                      <p className="font-body text-sm text-ink/80 mb-3">{item.content}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleReaction(item)}
                          className="inline-flex items-center gap-1.5 font-body text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                          style={{
                            color: item.user_has_reacted ? '#C1483D' : '#23232399',
                            backgroundColor: item.user_has_reacted ? '#C1483D15' : '#23232308',
                          }}
                        >
                          {item.user_has_reacted ? '🔥' : '🤍'} {item.reaction_count > 0 ? item.reaction_count : ''} Cheer
                        </button>
                        <button
                          onClick={() => toggleComments(item)}
                          className="inline-flex items-center gap-1.5 font-body text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                          style={{
                            color: openCommentsId === item.id ? '#6E85B7' : '#23232399',
                            backgroundColor: openCommentsId === item.id ? '#6E85B715' : '#23232308',
                          }}
                        >
                          💬 {item.comment_count > 0 ? item.comment_count : ''} Comment{item.comment_count === 1 ? '' : 's'}
                        </button>
                      </div>
                      <AnimatePresence>
                        <CommentThread postId={item._raw_id} isOpen={openCommentsId === item.id} />
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}