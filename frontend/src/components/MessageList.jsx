import React from 'react'
import MoodboardCard from './MoodboardCard.jsx'
import LooksCard from './LooksCard.jsx'
import ChatCard from './ChatCard.jsx'
import TypingIndicator from './TypingIndicator.jsx'

export default function MessageList({ messages, loading, onSuggestion }) {
  return (
    <>
      {messages.map(msg => (
        <div key={msg.id} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', animation: 'fadeUp 0.22s ease' }}>
          <div style={{ width: 27, height: 27, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, marginTop: 2, background: msg.role === 'user' ? 'var(--lav-lt)' : 'var(--rose-lt)', color: msg.role === 'user' ? 'var(--lav-dk)' : 'var(--rose-dk)' }}>
            {msg.role === 'user' ? 'U' : 'A'}
          </div>
          <div style={{ maxWidth: '78%', minWidth: 0 }}>
            {msg.role === 'user' ? (
              <div style={{ background: 'var(--lav-bg)', border: '0.5px solid var(--lav-lt)', borderRadius: '13px 13px 4px 13px', padding: '10px 14px', fontSize: 13, color: '#26215C', lineHeight: 1.55 }}>{msg.text}</div>
            ) : msg.parsed?.type === 'moodboard' ? (
              <MoodboardCard data={msg.parsed} msgId={msg.id} />
            ) : msg.parsed?.type === 'looks' ? (
              <LooksCard data={msg.parsed} msgId={msg.id} />
            ) : (
              <ChatCard data={msg.parsed} onSuggestion={onSuggestion} msgId={msg.id} />
            )}
          </div>
        </div>
      ))}
      {loading && (
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
          <div style={{ width: 27, height: 27, borderRadius: '50%', flexShrink: 0, background: 'var(--rose-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--rose-dk)' }}>A</div>
          <TypingIndicator />
        </div>
      )}
    </>
  )
}
