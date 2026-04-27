import React from 'react'

export default function TypingIndicator() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5, padding:'12px 16px', background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'16px 16px 16px 4px', width:'fit-content' }}>
      <span style={{ fontSize:11, color:'var(--text-3)', fontFamily:'var(--serif)', fontStyle:'italic', marginRight:4 }}>thinking</span>
      {[0,160,320].map(delay => (
        <span key={delay} style={{ width:5, height:5, borderRadius:'50%', background:'var(--rose-mid)', display:'inline-block', animation:`bounce 1s ${delay}ms infinite ease-in-out` }} />
      ))}
    </div>
  )
}
