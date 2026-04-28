import React, { useState } from 'react'
import FeedbackWidget from './FeedbackWidget.jsx'
import { createShare, submitFeedback } from '../services/api'

export default function MoodboardCard({ data, msgId, shared }) {
  const tiles = data?.tiles || []
  const palette = data?.palette || []
  const keyPieces = data?.keyPieces || []
  const [imgErrors, setImgErrors] = useState({})
  const [hoveredTile, setHoveredTile] = useState(null)
  const [saved, setSaved] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copying, setCopying] = useState(false)

  function handleSave() {
    const saves = JSON.parse(localStorage.getItem('atelier_saves') || '[]')
    saves.unshift({ id: Date.now(), type: 'moodboard', data, savedAt: new Date().toISOString() })
    localStorage.setItem('atelier_saves', JSON.stringify(saves.slice(0, 50)))
    setSaved(true)
  }

  async function handleShare() {
    setCopying(true)
    try {
      const result = await createShare('moodboard', data)
      if (result?.url) {
        setShareUrl(result.url)
        await navigator.clipboard.writeText(result.url).catch(() => {})
      }
    } catch (e) { console.warn(e) }
    setCopying(false)
  }

  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '16px 16px 16px 4px', overflow: 'hidden', animation: 'fadeUp 0.25s ease' }}>
      {data?.intro && (
        <div style={{ padding: '14px 16px 0' }}>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--text-2)', lineHeight: 1.5 }}>{data.intro}</p>
        </div>
      )}

      <div className='moodboard-grid' style={{ margin: '12px 0 0' }}>
        {tiles.map((tile, i) => {
          const hasImg = tile.url && !imgErrors[i]
          const isLarge = i === 0
          return (
            <div key={i}
              onMouseEnter={() => setHoveredTile(i)} onMouseLeave={() => setHoveredTile(null)}
              onClick={() => tile.link && window.open(tile.link, '_blank')}
              style={{ aspectRatio: isLarge ? '1.2' : '1', position: 'relative', background: tile.color || '#C4859A', cursor: tile.link ? 'pointer' : 'default', overflow: 'hidden', gridColumn: isLarge ? 'span 2' : 'span 1', transition: 'transform .2s', transform: hoveredTile === i ? 'scale(0.98)' : 'scale(1)' }}
            >
              {hasImg
                ? <img src={tile.url} alt={tile.label} onError={() => setImgErrors(p => ({...p,[i]:true}))}
                    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform .3s', transform: hoveredTile===i?'scale(1.05)':'scale(1)' }}
                  />
                : <div className="skeleton" style={{ width:'100%', height:'100%' }} />
              }
              <div style={{ position:'absolute', inset:0, background: hasImg?'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 60%)':'linear-gradient(135deg,rgba(255,255,255,0.12),rgba(0,0,0,0.12))', opacity: hoveredTile===i?1:0.7, transition:'opacity .2s' }} />
              <div style={{ position:'absolute', bottom:8, left:10, right:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:10, fontWeight:500, color:'#fff', textShadow:'0 1px 4px rgba(0,0,0,.6)', textTransform:'lowercase', letterSpacing:'0.05em' }}>{tile.label}</span>
                {tile.source==='pinterest' && <div style={{ background:'#E60023', borderRadius:'50%', width:14, height:14, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ color:'#fff', fontSize:8, fontWeight:700 }}>P</span></div>}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {palette.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:9, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-3)', flexShrink:0 }}>Palette</span>
            <div style={{ display:'flex', gap:4 }}>
              {palette.map((hex,i) => <div key={i} title={hex} style={{ width:22, height:22, borderRadius:4, background:hex, border:'0.5px solid var(--border-md)' }} />)}
            </div>
          </div>
        )}

        {keyPieces.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {keyPieces.map((p,i) => <span key={i} style={{ fontSize:11, padding:'4px 10px', borderRadius:'var(--r-pill)', background:'var(--rose-bg)', color:'var(--rose-dk)', border:'0.5px solid var(--rose-lt)', fontFamily:'var(--serif)', fontStyle:'italic' }}>{p}</span>)}
          </div>
        )}

        {data?.advice && <p style={{ fontSize:12, color:'var(--text-3)', fontStyle:'italic', lineHeight:1.6, borderTop:'0.5px solid var(--border)', paddingTop:10 }}>{data.advice}</p>}

        {data?.profileMatch && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'8px 11px', background:'var(--rose-bg)', borderRadius:'var(--r-sm)', border:'0.5px solid var(--rose-lt)' }}>
            <span style={{ fontSize:10, flexShrink:0, marginTop:1 }}>✦</span>
            <div style={{ fontSize:11, color:'var(--rose-dk)', lineHeight:1.5, fontStyle:'italic' }}>{data.profileMatch}</div>
          </div>
        )}

        {!shared && (
          <div style={{ display:'flex', gap:8, alignItems:'center', borderTop:'0.5px solid var(--border)', paddingTop:10 }}>
            <button onClick={handleSave} disabled={saved}
              style={{ fontSize:11, padding:'5px 12px', borderRadius:'var(--r-pill)', background: saved?'var(--green-bg)':'var(--surface2)', color: saved?'var(--green)':'var(--text-2)', border:`0.5px solid ${saved?'var(--green-lt)':'var(--border-md)'}`, cursor: saved?'default':'pointer', transition:'all .15s' }}
            >{saved ? '✓ Saved' : 'Save'}</button>
            <button onClick={handleShare}
              style={{ fontSize:11, padding:'5px 12px', borderRadius:'var(--r-pill)', background:'var(--surface2)', color:'var(--text-2)', border:'0.5px solid var(--border-md)', cursor:'pointer', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--rose-bg)'; e.currentTarget.style.color='var(--rose-dk)' }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.color='var(--text-2)' }}
            >{copying?'Copying...':shareUrl?'✓ Copied':'Share'}</button>
            {shareUrl && <span style={{ fontSize:10, color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{shareUrl}</span>}
            <FeedbackWidget msgId={msgId} responseType="moodboard" messageText={data?.intro||''} />
          </div>
        )}
      </div>
    </div>
  )
}
