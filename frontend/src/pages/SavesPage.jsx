import React, { useEffect, useState } from 'react'
import MoodboardCard from '../components/MoodboardCard.jsx'
import LooksCard from '../components/LooksCard.jsx'

export default function SavesPage({ onBack }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const saves = JSON.parse(localStorage.getItem('atelier_saves') || '[]')
    setItems(saves)
  }, [])

  function handleDelete(id) {
    const updated = items.filter(i => i.id !== id)
    setItems(updated)
    localStorage.setItem('atelier_saves', JSON.stringify(updated))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ padding: '14px 24px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)' }}>
        <button onClick={onBack} style={{ fontSize: 13, color: 'var(--text-2)', cursor: 'pointer', background: 'none', border: 'none', padding: '4px 0' }}>← Back</button>
        <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--text)' }}>Saved looks</span>
      </div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {items.length === 0 && (
          <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: 60 }}>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, marginBottom: 8 }}>Nothing saved yet</div>
            <div style={{ fontSize: 13 }}>Hit Save on any moodboard or look to save it here.</div>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} style={{ position: 'relative' }}>
            <button onClick={() => handleDelete(item.id)}
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Remove"
            >×</button>
            {item.type === 'moodboard'
              ? <MoodboardCard data={item.data} msgId={String(item.id)} />
              : <LooksCard data={item.data} msgId={String(item.id)} />
            }
            {item.savedAt && (
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, paddingLeft: 4 }}>
                Saved {new Date(item.savedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
