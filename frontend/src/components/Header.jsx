import React from 'react'

export default function Header({ styleProfile, onMenuClick }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid var(--border)', background: 'var(--bg)', flexShrink: 0 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Hamburger — only visible on mobile */}
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          style={{ display: 'none', width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-sm)', background: 'var(--surface)', border: '0.5px solid var(--border-md)', cursor: 'pointer', flexShrink: 0 }}
          className="menu-btn"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="var(--text-2)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--rose-bg)', border: '0.5px solid var(--rose-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--rose-dk)', flexShrink: 0 }}>A</div>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--text)' }}>Atelier</div>
          <div className="header-subtitle" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.04em' }}>moodboards · looks · style advice</div>
        </div>
      </div>

      <div className="header-badges" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {styleProfile && (
          <div style={{ fontSize: 10, padding: '3px 10px', borderRadius: 'var(--r-pill)', background: 'var(--rose-bg)', color: 'var(--rose-dk)', border: '0.5px solid var(--rose-lt)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--rose)', flexShrink: 0 }} />
            {styleProfile.aesthetic || 'style synced'}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Live</span>
        </div>
        <div style={{ fontSize: 10, padding: '3px 10px', borderRadius: 'var(--r-pill)', background: 'var(--surface2)', color: 'var(--text-3)', border: '0.5px solid var(--border)' }}>AI</div>
      </div>
    </header>
  )
}
