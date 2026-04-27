import React, { useState } from 'react'

const BODY_TYPES = ['Pear', 'Apple', 'Hourglass', 'Rectangle', 'Petite', 'Tall']
const SKIN_TONES = ['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Deep']

const FIELDS = [
  { key: 'weather',  label: 'Weather / city', placeholder: 'e.g. London, 18°C' },
  { key: 'occasion', label: 'Occasion',        placeholder: 'e.g. rooftop dinner' },
  { key: 'budget',   label: 'Budget',           placeholder: 'e.g. under $100' },
  { key: 'style',    label: 'My style',         placeholder: 'e.g. minimalist, boho' },
  { key: 'wardrobe', label: 'My wardrobe',      placeholder: 'e.g. white linen shirt, black trousers' },
]

export default function Sidebar({ ctx, update, chips, onChip, onViewSaves }) {
  const [open, setOpen] = useState(null)

  return (
    <aside style={{ width: 224, flexShrink: 0, borderRight: '0.5px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', padding: '22px 14px', gap: 22, overflowY: 'auto' }}>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 21, color: 'var(--rose)', padding: '0 4px' }}>✦ Atelier</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '0 4px', marginBottom: 2 }}>Context</div>

        {FIELDS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <button onClick={() => setOpen(open === key ? null : key)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 'var(--r-sm)', fontSize: 12, border: `0.5px solid ${ctx[key] ? 'var(--rose-lt)' : 'var(--border)'}`, background: ctx[key] ? 'var(--rose-bg)' : 'var(--bg)', color: ctx[key] ? 'var(--rose-dk)' : 'var(--text-2)', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all .15s', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
              {ctx[key] || label}
            </button>
            {open === key && (
              <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border-md)', borderRadius: 'var(--r-sm)', padding: 8, marginTop: 3 }}>
                {key === 'wardrobe' ? (
                  <textarea autoFocus placeholder={placeholder} value={ctx[key]} onChange={e => update(key, e.target.value)}
                    style={{ width: '100%', height: 80, border: '0.5px solid var(--border-md)', borderRadius: 6, padding: '7px 9px', fontSize: 11, background: 'var(--surface)', color: 'var(--text)', outline: 'none', resize: 'none', lineHeight: 1.5 }}
                  />
                ) : (
                  <input autoFocus placeholder={placeholder} value={ctx[key]}
                    onChange={e => update(key, e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && setOpen(null)}
                    style={{ width: '100%', height: 30, border: '0.5px solid var(--border-md)', borderRadius: 6, padding: '0 9px', fontSize: 12, background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}
                  />
                )}
              </div>
            )}
          </div>
        ))}

        {/* Body type */}
        <div>
          <button onClick={() => setOpen(open === 'bodyType' ? null : 'bodyType')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 'var(--r-sm)', fontSize: 12, border: `0.5px solid ${ctx.bodyType ? 'var(--rose-lt)' : 'var(--border)'}`, background: ctx.bodyType ? 'var(--rose-bg)' : 'var(--bg)', color: ctx.bodyType ? 'var(--rose-dk)' : 'var(--text-2)', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
            {ctx.bodyType || 'Body type'}
          </button>
          {open === 'bodyType' && (
            <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border-md)', borderRadius: 'var(--r-sm)', padding: 8, marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {BODY_TYPES.map(t => (
                <button key={t} onClick={() => { update('bodyType', t); setOpen(null) }}
                  style={{ padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: 11, border: `0.5px solid ${ctx.bodyType === t ? 'var(--rose)' : 'var(--border-md)'}`, background: ctx.bodyType === t ? 'var(--rose-bg)' : 'var(--bg)', color: ctx.bodyType === t ? 'var(--rose-dk)' : 'var(--text-2)', cursor: 'pointer' }}
                >{t}</button>
              ))}
            </div>
          )}
        </div>

        {/* Skin tone */}
        <div>
          <button onClick={() => setOpen(open === 'skinTone' ? null : 'skinTone')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 'var(--r-sm)', fontSize: 12, border: `0.5px solid ${ctx.skinTone ? 'var(--rose-lt)' : 'var(--border)'}`, background: ctx.skinTone ? 'var(--rose-bg)' : 'var(--bg)', color: ctx.skinTone ? 'var(--rose-dk)' : 'var(--text-2)', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
            {ctx.skinTone || 'Skin tone'}
          </button>
          {open === 'skinTone' && (
            <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border-md)', borderRadius: 'var(--r-sm)', padding: 8, marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {SKIN_TONES.map(t => (
                <button key={t} onClick={() => { update('skinTone', t); setOpen(null) }}
                  style={{ padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: 11, border: `0.5px solid ${ctx.skinTone === t ? 'var(--rose)' : 'var(--border-md)'}`, background: ctx.skinTone === t ? 'var(--rose-bg)' : 'var(--bg)', color: ctx.skinTone === t ? 'var(--rose-dk)' : 'var(--text-2)', cursor: 'pointer' }}
                >{t}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '0 4px', marginBottom: 4 }}>Quick starts</div>
        {chips.map(chip => (
          <button key={chip} onClick={() => onChip(chip)}
            style={{ textAlign: 'left', padding: '7px 10px', borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--text-2)', background: 'transparent', border: 'none', cursor: 'pointer', lineHeight: 1.4, transition: 'all .12s', width: '100%' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--rose-bg)'; e.currentTarget.style.color = 'var(--rose-dk)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' }}
          >{chip}</button>
        ))}
      </div>

      <div style={{ marginTop: 'auto', borderTop: '0.5px solid var(--border)', paddingTop: 12 }}>
        <button onClick={onViewSaves}
          style={{ textAlign: 'left', padding: '7px 10px', borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--text-2)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all .12s', width: '100%' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--rose-bg)'; e.currentTarget.style.color = 'var(--rose-dk)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' }}
        >Saved looks</button>
      </div>
    </aside>
  )
}
