import { useState } from 'react'

export function useStyleContext() {
  const [ctx, setCtx] = useState({
    weather: '', occasion: '', budget: '', style: '',
    bodyType: '', skinTone: '', wardrobe: ''
  })

  function update(key, value) {
    setCtx(prev => ({ ...prev, [key]: value }))
  }

  return { ctx, update }
}
