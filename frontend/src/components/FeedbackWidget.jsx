import React, { useState } from 'react'
import { submitFeedback } from '../services/api'

export default function FeedbackWidget({ msgId, responseType, messageText }) {
  const [rating, setRating] = useState(null)
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleRate(r) {
    setRating(r)
    if (r === 1) {
      await submitFeedback({ rating: r, response_type: responseType, message_text: messageText, comment: '', session_id: msgId })
      setSubmitted(true)
    } else {
      setShowComment(true)
    }
  }

  async function handleSubmit() {
    await submitFeedback({ rating, response_type: responseType, message_text: messageText, comment, session_id: msgId })
    setSubmitted(true)
    setShowComment(false)
  }

  if (submitted) return <div style={{ fontSize:11, color:'var(--text-3)' }}>Thanks ✓</div>

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ fontSize:11, color:'var(--text-3)' }}>Helpful?</span>
        {[['👍',1],['👎',0]].map(([emoji, val]) => (
          <button key={val} onClick={() => handleRate(val)}
            style={{ fontSize:13, background:'none', border:'none', cursor:'pointer', opacity: rating===val?1:0.35, transition:'opacity .12s' }}
          >{emoji}</button>
        ))}
      </div>
      {showComment && (
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          <input placeholder="What could be better? (optional)" value={comment} onChange={e => setComment(e.target.value)}
            onKeyDown={e => e.key==='Enter' && handleSubmit()}
            style={{ height:30, border:'0.5px solid var(--border-md)', borderRadius:'var(--r-sm)', padding:'0 9px', fontSize:12, background:'var(--surface)', color:'var(--text)', outline:'none' }}
          />
          <button onClick={handleSubmit} style={{ alignSelf:'flex-start', fontSize:11, padding:'4px 12px', borderRadius:'var(--r-pill)', background:'var(--rose-bg)', color:'var(--rose-dk)', border:'0.5px solid var(--rose-lt)', cursor:'pointer' }}>Submit</button>
        </div>
      )}
    </div>
  )
}
