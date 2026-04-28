const BASE = import.meta.env.VITE_BACKEND_URL || '/api'

export async function sendMessage(messages, context = {}, userId = null, sessionId = null) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context, user_id: userId, session_id: sessionId })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail || `HTTP ${res.status}`)
  }
  const data = await res.json()
  const raw = data.content || ''
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim())
  } catch {
    return { type: 'chat', message: raw, suggestions: [] }
  }
}

export async function saveItem(userId, type, data, title = '') {
  const res = await fetch(`${BASE}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, type, data, title })
  })
  return res.json()
}

export async function getSaves(userId) {
  const res = await fetch(`${BASE}/saves/${userId}`)
  return res.json()
}

export async function deleteSave(itemId) {
  const res = await fetch(`${BASE}/saves/${itemId}`, { method: 'DELETE' })
  return res.json()
}

export async function createShare(type, data) {
  const res = await fetch(`${BASE}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data })
  })
  return res.json()
}

export async function getShare(shareId) {
  const res = await fetch(`${BASE}/share/${shareId}`)
  if (!res.ok) return null
  return res.json()
}

export async function submitFeedback(payload) {
  try {
    await fetch(`${BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (e) {
    console.warn('[feedback] failed silently:', e)
  }
}

export async function checkHealth() {
  try {
    const res = await fetch(`${BASE}/health`)
    return res.json()
  } catch { return null }
}

export async function syncWishlist(url, sessionId) {
  const res = await fetch(`${BASE}/style/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, session_id: sessionId })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function getStyleProfile(sessionId) {
  try {
    const res = await fetch(`${BASE}/style/profile/${sessionId}`)
    const data = await res.json()
    return data.profile || null
  } catch { return null }
}

export async function deleteStyleProfile(sessionId) {
  const res = await fetch(`${BASE}/style/profile/${sessionId}`, { method: 'DELETE' })
  return res.json()
}
