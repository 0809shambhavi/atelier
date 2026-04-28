import React, { useRef, useEffect, useState } from 'react'
import { useChat } from '../hooks/useChat.js'
import { useStyleContext } from '../hooks/useStyleContext.js'
import MessageList from './MessageList.jsx'
import InputBar from './InputBar.jsx'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'

const CHIPS = [
  'Build me a summer moodboard',
  'Rooftop dinner outfit',
  '3 minimal chic looks',
  'Top trends this season',
  'Travel capsule wardrobe',
  'Cozy autumn evening look',
]

export default function ChatLayout({ onViewSaves }) {
  const { ctx, update } = useStyleContext()
  const sessionId = useState(() => {
    const stored = localStorage.getItem('atelier_session_id')
    if (stored) return stored
    const id = crypto.randomUUID()
    localStorage.setItem('atelier_session_id', id)
    return id
  })[0]

  const { messages, loading, send } = useChat(ctx, sessionId)
  const [input, setInput] = useState('')
  const [styleProfile, setStyleProfile] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Close sidebar when screen grows past mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e) => { if (e.matches) setSidebarOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function handleSend(text) {
    send(text)
    setInput('')
    setSidebarOpen(false) // close sidebar on mobile after sending
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* Overlay — only visible on mobile when sidebar open */}
      <div
        className="sidebar-overlay"
        style={{ display: sidebarOpen ? 'block' : 'none' }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        className={`sidebar${sidebarOpen ? ' open' : ''}`}
        ctx={ctx}
        update={update}
        chips={CHIPS}
        onChip={handleSend}
        onViewSaves={onViewSaves}
        sessionId={sessionId}
        onProfileChange={setStyleProfile}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Header
          styleProfile={styleProfile}
          onMenuClick={() => setSidebarOpen(o => !o)}
        />
        <div
          className="chat-area"
          style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}
        >
          <MessageList messages={messages} loading={loading} onSuggestion={handleSend} />
          <div ref={bottomRef} />
        </div>
        <InputBar value={input} onChange={setInput} onSend={handleSend} loading={loading} />
      </div>
    </div>
  )
}
