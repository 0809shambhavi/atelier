import React, { useState } from 'react'
import FeedbackWidget from './FeedbackWidget.jsx'
import { createShare } from '../services/api'

const ICONS = { tops:'○', bottoms:'▭', shoes:'◇', accessories:'✦', outerwear:'◻' }
const WEATHER_ICON = t => t > 30 ? '☀' : t > 22 ? '⛅' : t > 14 ? '🌤' : '❄'

export default function LooksCard({ data, msgId, shared }) {
  const items = data?.items || []
  const shopCards = data?.shopCards || []
  const weather = data?.weather
  const lookImages = data?.lookImages || []
  const generatedImage = data?.generatedImage || ''
  const [imgErrors, setImgErrors] = useState({})
  const [hovered, setHovered] = useState(null)
  const [saved, setSaved] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copying, setCopying] = useState(false)

  function handleSave() {
    const saves = JSON.parse(localStorage.getItem('atelier_saves') || '[]')
    saves.unshift({ id: Date.now(), type: 'looks', data, savedAt: new Date().toISOString() })
    localStorage.setItem('atelier_saves', JSON.stringify(saves.slice(0, 50)))
    setSaved(true)
  }

  async function handleShare() {
    setCopying(true)
    try {
      const result = await createShare('looks', data)
      if (result?.url) { setShareUrl(result.url); await navigator.clipboard.writeText(result.url).catch(() => {}) }
    } catch (e) { console.warn(e) }
    setCopying(false)
  }

  return (
    <div style={{ background:'var(--surface)', border:'0.5px solid var(--border)', borderRadius:'16px 16px 16px 4px', overflow:'hidden', animation:'fadeUp 0.25s ease' }}>

      {generatedImage && !imgErrors['dalle'] && (
        <div style={{ position:'relative', overflow:'hidden', borderBottom:'0.5px solid var(--border)' }}>
          <img src={generatedImage} alt="AI generated outfit" onError={() => setImgErrors(p=>({...p,dalle:true}))}
            style={{ width:'100%', objectFit:'cover', display:'block', maxHeight:360 }}
          />
          <div style={{ position:'absolute', top:10, left:10, fontSize:9, padding:'3px 8px', borderRadius:'var(--r-pill)', background:'rgba(0,0,0,0.5)', color:'#fff', letterSpacing:'0.08em', textTransform:'uppercase' }}>AI generated</div>
        </div>
      )}

      {lookImages.length > 0 && (
        <div className='looks-image-strip'>
          {lookImages.slice(0,3).map((img,i) => {
            const hasImg = img.url && !imgErrors[`look-${i}`]
            return (
              <div key={i} onClick={() => img.link && window.open(img.link,'_blank')}
                onMouseEnter={() => setHovered(`look-${i}`)} onMouseLeave={() => setHovered(null)}
                style={{ aspectRatio: i===0?'0.8':'1', position:'relative', background:'var(--surface2)', cursor: img.link?'pointer':'default', overflow:'hidden' }}
              >
                {hasImg
                  ? <img src={img.url} alt={img.label} onError={() => setImgErrors(p=>({...p,[`look-${i}`]:true}))}
                      style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform .35s', transform: hovered===`look-${i}`?'scale(1.06)':'scale(1)' }}
                    />
                  : <div className="skeleton" style={{ width:'100%', height:'100%' }} />
                }
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.4) 0%,transparent 50%)', opacity: hovered===`look-${i}`?1:0.6, transition:'opacity .2s' }} />
                <div style={{ position:'absolute', bottom:7, left:9 }}>
                  <span style={{ fontSize:9, color:'rgba(255,255,255,0.85)', letterSpacing:'0.06em', textTransform:'uppercase' }}>{img.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ padding:'13px 15px', display:'flex', flexDirection:'column', gap:11 }}>
        {weather && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'8px 11px', background:'var(--gold-bg)', borderRadius:'var(--r-sm)', border:'0.5px solid var(--gold-lt)' }}>
            <span style={{ fontSize:18, lineHeight:1, flexShrink:0 }}>{WEATHER_ICON(weather.temp)}</span>
            <div>
              <div style={{ fontSize:12, fontWeight:500, color:'var(--text)' }}>{weather.city} · {weather.temp}°C · <span style={{ color:'var(--text-2)', fontWeight:400 }}>{weather.condition}</span></div>
              <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2, lineHeight:1.4 }}>{weather.outfit_note}</div>
            </div>
          </div>
        )}

        {data?.intro && <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15, color:'var(--text-2)', lineHeight:1.5 }}>{data.intro}</p>}

        {(data?.bodyTypeTip || data?.skinToneTip) && (
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {data.bodyTypeTip && <div style={{ fontSize:11, padding:'6px 10px', background:'var(--lav-bg)', borderRadius:'var(--r-sm)', color:'var(--lav-dk)', border:'0.5px solid var(--lav-lt)' }}>{data.bodyTypeTip}</div>}
            {data.skinToneTip && <div style={{ fontSize:11, padding:'6px 10px', background:'var(--gold-bg)', borderRadius:'var(--r-sm)', color:'#8B6914', border:'0.5px solid var(--gold-lt)' }}>{data.skinToneTip}</div>}
          </div>
        )}

        <div className='items-grid'>
          {items.map((item,i) => (
            <div key={i}
              style={{ display:'flex', alignItems:'flex-start', gap:9, padding:'10px 12px', background: item.owned?'var(--green-bg)':'var(--bg)', border:`0.5px solid ${item.owned?'var(--green-lt)':'var(--border)'}`, borderRadius:'var(--r-sm)', transition:'border-color .12s', position:'relative' }}
              onMouseEnter={e => { if(!item.owned) e.currentTarget.style.borderColor='var(--rose-lt)' }}
              onMouseLeave={e => { if(!item.owned) e.currentTarget.style.borderColor='var(--border)' }}
            >
              {item.owned && <div style={{ position:'absolute', top:5, right:7, fontSize:9, color:'var(--green)' }}>owned</div>}
              <span style={{ fontSize:11, color:'var(--rose-mid)', flexShrink:0, marginTop:1 }}>{ICONS[item.category]||'·'}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:500, color:'var(--text)', lineHeight:1.3 }}>{item.piece}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3, lineHeight:1.4 }}>{item.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {data?.stylingNote && <p style={{ fontSize:11, color:'var(--text-3)', fontStyle:'italic', lineHeight:1.55 }}>{data.stylingNote}</p>}

        {data?.profileMatch && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'8px 11px', background:'var(--rose-bg)', borderRadius:'var(--r-sm)', border:'0.5px solid var(--rose-lt)' }}>
            <span style={{ fontSize:10, flexShrink:0, marginTop:1 }}>✦</span>
            <div style={{ fontSize:11, color:'var(--rose-dk)', lineHeight:1.5, fontStyle:'italic' }}>{data.profileMatch}</div>
          </div>
        )}

        {shopCards.length > 0 && (
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:11, display:'flex', flexDirection:'column', gap:7 }}>
            <span style={{ fontSize:9, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-3)' }}>Shop the look</span>
            <div className='shop-cards'>
              {shopCards.map((card,i) => (
                <a key={i} href={card.link||'#'} target="_blank" rel="noopener noreferrer"
                  style={{ flex:1, border:'0.5px solid var(--border-md)', borderRadius:'var(--r-sm)', padding:'10px 12px', background:'var(--bg)', cursor:'pointer', transition:'all .15s', textDecoration:'none', display:'block' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--rose)'; e.currentTarget.style.background='var(--rose-bg)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-md)'; e.currentTarget.style.background='var(--bg)' }}
                >
                  {card.image && <img src={card.image} alt={card.name} style={{ width:'100%', aspectRatio:'1', objectFit:'cover', borderRadius:4, marginBottom:6 }} onError={e => e.target.style.display='none'} />}
                  <div style={{ fontSize:9, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)' }}>{card.brand}</div>
                  <div style={{ fontSize:11, color:'var(--text)', marginTop:3, lineHeight:1.35 }}>{card.name}</div>
                  <div style={{ fontSize:14, fontFamily:'var(--serif)', fontWeight:500, color:'var(--rose-dk)', marginTop:5 }}>{card.price}</div>
                  {card.link && <div style={{ fontSize:9, color:'var(--rose)', marginTop:4 }}>Shop now →</div>}
                </a>
              ))}
            </div>
          </div>
        )}

        {!shared && (
          <div style={{ display:'flex', gap:8, alignItems:'center', borderTop:'0.5px solid var(--border)', paddingTop:10 }}>
            <button onClick={handleSave} disabled={saved}
              style={{ fontSize:11, padding:'5px 12px', borderRadius:'var(--r-pill)', background: saved?'var(--green-bg)':'var(--surface2)', color: saved?'var(--green)':'var(--text-2)', border:`0.5px solid ${saved?'var(--green-lt)':'var(--border-md)'}`, cursor: saved?'default':'pointer' }}
            >{saved?'✓ Saved':'Save'}</button>
            <button onClick={handleShare}
              style={{ fontSize:11, padding:'5px 12px', borderRadius:'var(--r-pill)', background:'var(--surface2)', color:'var(--text-2)', border:'0.5px solid var(--border-md)', cursor:'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--rose-bg)'; e.currentTarget.style.color='var(--rose-dk)' }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.color='var(--text-2)' }}
            >{copying?'Copying...':shareUrl?'✓ Copied':'Share'}</button>
            {shareUrl && <span style={{ fontSize:10, color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{shareUrl}</span>}
            <FeedbackWidget msgId={msgId} responseType="looks" messageText={data?.intro||''} />
          </div>
        )}
      </div>
    </div>
  )
}
