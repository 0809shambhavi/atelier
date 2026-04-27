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
  const sessionId = useState(() => crypto.randomUUID())[0]
  const { messages, loading, send } = useChat(ctx, sessionId)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleSend(text) {
    send(text)
    setInput('')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar ctx={ctx} update={update} chips={CHIPS} onChip={handleSend} onViewSaves={onViewSaves} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Header />
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <MessageList messages={messages} loading={loading} onSuggestion={handleSend} />
          <div ref={bottomRef} />
        </div>
        <InputBar value={input} onChange={setInput} onSend={handleSend} loading={loading} />
      </div>
    </div>
  )
}
