import React from 'react'
import FeedbackWidget from './FeedbackWidget.jsx'

export default function ChatCard({ data, onSuggestion, msgId, user }) {
  return (
    <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'16px 16px 16px 4px', padding:'13px 15px', display:'flex', flexDirection:'column', gap:10, animation:'fadeUp 0.25s ease' }}>
      {data?.trendData && (
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, padding:'4px 9px', background:'var(--rose-bg)', color:'var(--rose-dk)', borderRadius:'var(--r-pill)', border:'0.5px solid var(--rose-lt)', width:'fit-content', letterSpacing:'0.04em' }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--rose)', animation:'pulse 2s infinite' }} />
          Live trend data
        </div>
      )}
      <p style={{ fontSize:13, lineHeight:1.7, color:'var(--text)' }}>{data?.message}</p>
      {data?.trendData && (
        <div style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.6, background:'var(--surface2)', borderRadius:'0 var(--r-sm) var(--r-sm) 0', padding:'9px 12px', borderLeft:'2px solid var(--rose-lt)' }}>{data.trendData}</div>
      )}
      {(data?.suggestions||[]).length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {data.suggestions.map(s => (
            <button key={s} onClick={() => onSuggestion(s)}
              style={{ textAlign:'left', padding:'8px 12px', borderRadius:'var(--r-sm)', fontSize:12, color:'var(--text-2)', border:'0.5px solid var(--border)', background:'var(--bg)', cursor:'pointer', transition:'all .12s', display:'flex', justifyContent:'space-between', alignItems:'center' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--rose-lt)'; e.currentTarget.style.color='var(--rose-dk)'; e.currentTarget.style.background='var(--rose-bg)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-2)'; e.currentTarget.style.background='var(--bg)' }}
            ><span>{s}</span><span style={{ fontSize:10, opacity:0.5 }}>↗</span></button>
          ))}
        </div>
      )}
      <FeedbackWidget msgId={msgId} responseType="chat" messageText={data?.message||''} userId={user?.id} />
    </div>
  )
}
