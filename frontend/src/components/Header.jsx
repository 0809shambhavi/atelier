import React from 'react'

export default function Header() {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 28px', borderBottom: '0.5px solid var(--border)', background: 'var(--bg)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--rose-bg)', border: '0.5px solid var(--rose-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--rose-dk)' }}>A</div>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--text)' }}>Atelier</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.04em' }}>moodboards · looks · style advice</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50' }} />
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Live · Images · Weather</span>
        </div>
        <div style={{ fontSize: 10, padding: '3px 10px', borderRadius: 'var(--r-pill)', background: 'var(--rose-bg)', color: 'var(--rose-dk)', border: '0.5px solid var(--rose-lt)' }}>AI-powered</div>
      </div>
    </header>
  )
}
