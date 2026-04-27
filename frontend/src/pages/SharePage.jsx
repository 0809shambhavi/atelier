import React, { useEffect, useState } from 'react'
import { getShare } from '../services/api'
import MoodboardCard from '../components/MoodboardCard.jsx'
import LooksCard from '../components/LooksCard.jsx'

export default function SharePage({ shareId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const id = shareId || window.location.pathname.split('/share/')[1]

  useEffect(() => {
    getShare(id).then(d => { setData(d); setLoading(false) })
  }, [id])

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:18, color:'var(--rose)' }}>loading...</span>
    </div>
  )

  if (!data) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ color:'var(--text-3)' }}>This share link has expired or doesn't exist.</span>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', padding:'40px 24px' }}>
      <div style={{ maxWidth:560, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>
        <div style={{ textAlign:'center', marginBottom:8 }}>
          <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:26, color:'var(--rose)' }}>✦ Atelier</div>
          <div style={{ fontSize:12, color:'var(--text-3)', marginTop:4 }}>A look curated just for you</div>
        </div>
        {data.type === 'moodboard'
          ? <MoodboardCard data={data.data} msgId="share" shared />
          : <LooksCard data={data.data} msgId="share" shared />
        }
        <div style={{ textAlign:'center', padding:'16px 0' }}>
          <a href="/" style={{ fontSize:13, color:'var(--rose)', textDecoration:'none', fontFamily:'var(--serif)', fontStyle:'italic' }}>
            Get your own moodboard → atelier.app
          </a>
        </div>
      </div>
    </div>
  )
}
