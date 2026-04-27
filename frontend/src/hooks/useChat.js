import { useState, useCallback } from 'react'
import { sendMessage } from '../services/api'

const WELCOME = {
  id: 'welcome', role: 'assistant',
  parsed: {
    type: 'chat',
    message: "Welcome to Atelier. Tell me your vibe, an occasion, or ask anything about style — I'll build moodboards with real images, curate complete looks with shoppable products, and generate AI outfit illustrations.",
    suggestions: ['Build me a summer moodboard', 'What should I wear to a rooftop dinner?', 'What are the biggest fashion trends right now?']
  }
}

export function useChat(context, sessionId) {
  const [messages, setMessages] = useState([WELCOME])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiHistory, setApiHistory] = useState([])

  const send = useCallback(async (text) => {
    if (!text.trim() || loading) return
    setError(null)
    const userMsg = { id: `${Date.now()}-u`, role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    const newHistory = [...apiHistory, { role: 'user', content: text }]
    setApiHistory(newHistory)
    setLoading(true)
    try {
      const parsed = await sendMessage(newHistory, context, null, sessionId)
      const raw = JSON.stringify(parsed)
      setApiHistory(prev => [...prev, { role: 'assistant', content: raw }])
      setMessages(prev => [...prev, { id: `${Date.now()}-a`, role: 'assistant', parsed }])
    } catch (err) {
      console.error('[useChat]', err)
      setError(err.message)
      setMessages(prev => [...prev, {
        id: `${Date.now()}-err`, role: 'assistant',
        parsed: { type: 'chat', message: `Error: ${err.message}`, suggestions: [] }
      }])
    } finally {
      setLoading(false)
    }
  }, [loading, apiHistory, context, sessionId])

  function reset() {
    setMessages([WELCOME])
    setApiHistory([])
  }

  return { messages, loading, error, send, reset }
}
