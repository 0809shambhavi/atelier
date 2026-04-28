import React, { useState, useEffect } from 'react'
import { syncWishlist, getStyleProfile, deleteStyleProfile } from '../services/api.js'

const SUPPORTED = ['Myntra', 'ASOS', 'Zara', 'H&M', 'Mango', 'Ajio', 'Nykaa Fashion', 'Uniqlo']

export default function StyleSync({ sessionId, onProfileChange }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [open, setOpen] = useState(false)

  // Load existing profile on mount
  useEffect(() => {
    if (!sessionId) return
    getStyleProfile(sessionId).then(p => {
      if (p) { setProfile(p); onProfileChange(p) }
    })
  }, [sessionId])

  async function handleSync() {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    try {
      const result = await syncWishlist(url.trim(), sessionId)
      setProfile(result.profile)
      onProfileChange(result.profile)
      setUrl('')
      setOpen(false)
    } catch (e) {
      setError(e.message || 'Could not analyse this URL. Try a public wishlist page.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    await deleteStyleProfile(sessionId)
    setProfile(null)
    onProfileChange(null)
  }

  const pill = (text, bg, color, border) => (
    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: bg, color, border: `0.5px solid ${border}`, display: 'inline-block' }}>
      {text}
    </span>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

      {/* Header button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 'var(--r-sm)', fontSize: 12, border: `0.5px solid ${profile ? 'var(--rose-lt)' : 'var(--border)'}`, background: profile ? 'var(--rose-bg)' : 'var(--bg)', color: profile ? 'var(--rose-dk)' : 'var(--text-2)', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all .15s' }}
      >
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: profile ? 'var(--rose-dk)' : 'var(--text-3)', flexShrink: 0 }} />
        {profile ? `Style synced · ${profile.aesthetic || 'profile ready'}` : 'Sync your style'}
      </button>

      {/* Expanded panel */}
      {open && (
        <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border-md)', borderRadius: 'var(--r-sm)', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>

          {profile ? (
            /* Profile summary */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                {profile.aesthetic}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
                {profile.personality}
              </div>
              {profile.colors?.always?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {profile.colors.always.map(c => pill(c, 'var(--surface2)', 'var(--text-2)', 'var(--border-md)'))}
                </div>
              )}
              {profile.brands?.owns?.length > 0 && (
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                  Owns: {profile.brands.owns.join(', ')}
                  {profile.brands?.aspirational?.length > 0 && ` · Loves: ${profile.brands.aspirational.join(', ')}`}
                </div>
              )}
              <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
                <button
                  onClick={() => { setOpen(false); setUrl('') }}
                  style={{ flex: 1, fontSize: 10, padding: '4px 8px', borderRadius: 'var(--r-pill)', background: 'var(--rose-bg)', color: 'var(--rose-dk)', border: '0.5px solid var(--rose-lt)', cursor: 'pointer' }}
                >Update URL</button>
                <button
                  onClick={handleReset}
                  style={{ fontSize: 10, padding: '4px 8px', borderRadius: 'var(--r-pill)', background: 'var(--surface2)', color: 'var(--text-3)', border: '0.5px solid var(--border-md)', cursor: 'pointer' }}
                >Reset</button>
              </div>
            </div>
          ) : (
            /* URL input */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.5 }}>
                Paste your wishlist URL from any of: {SUPPORTED.join(', ')}
              </div>
              <input
                autoFocus
                placeholder="https://www.myntra.com/wishlist"
                value={url}
                onChange={e => { setUrl(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSync()}
                style={{ width: '100%', height: 32, border: '0.5px solid var(--border-md)', borderRadius: 6, padding: '0 9px', fontSize: 11, background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}
              />
              {error && <div style={{ fontSize: 10, color: 'var(--rose-dk)', lineHeight: 1.4 }}>{error}</div>}
              <button
                onClick={handleSync}
                disabled={loading || !url.trim()}
                style={{ fontSize: 11, padding: '6px 0', borderRadius: 'var(--r-sm)', background: loading || !url.trim() ? 'var(--surface2)' : 'var(--rose)', color: loading || !url.trim() ? 'var(--text-3)' : '#fff', border: 'none', cursor: loading || !url.trim() ? 'default' : 'pointer', transition: 'all .15s', fontWeight: 500 }}
              >
                {loading ? 'Analysing your style...' : 'Sync style'}
              </button>
              {loading && (
                <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.5 }}>
                  Fetching page → extracting items → building your profile
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
