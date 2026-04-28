import React from 'react'

export default function InputBar({ value, onChange, onSend, loading }) {
  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (value.trim() && !loading) onSend(value) }
  }
  const canSend = value.trim() && !loading
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px 16px', borderTop:'0.5px solid var(--border)', background:'var(--bg)', flexShrink:0 }}>
      <input
        type="text"
        className="input-bar-input"
        placeholder="Describe your vibe, occasion, or ask anything fashion…"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        disabled={loading}
        style={{ flex:1, height:44, border:'0.5px solid var(--border-md)', borderRadius:'var(--r-pill)', padding:'0 18px', fontSize:13, background:'var(--surface)', color:'var(--text)', outline:'none', transition:'border-color .15s, box-shadow .15s', minWidth:0 }}
        onFocus={e => { e.target.style.borderColor='var(--rose)'; e.target.style.boxShadow='0 0 0 3px var(--rose-bg)' }}
        onBlur={e => { e.target.style.borderColor='var(--border-md)'; e.target.style.boxShadow='none' }}
      />
      <button
        className="input-bar-btn"
        onClick={() => canSend && onSend(value)}
        disabled={!canSend}
        style={{ width:44, height:44, borderRadius:'50%', background: canSend?'var(--rose)':'var(--surface2)', color: canSend?'#fff':'var(--text-3)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor: canSend?'pointer':'default', transition:'all .15s' }}
      >
        {loading
          ? <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid currentColor', borderTopColor:'transparent', animation:'spin 0.7s linear infinite' }} />
          : <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 7.5h11M8.5 3l4.5 4.5L8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        }
      </button>
    </div>
  )
}
