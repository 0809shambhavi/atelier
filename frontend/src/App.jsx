import React, { useEffect, useState } from 'react'
import ChatLayout from './components/ChatLayout.jsx'
import SharePage from './pages/SharePage.jsx'
import SavesPage from './pages/SavesPage.jsx'

export default function App() {
  const [page, setPage] = useState('chat')
  const [pageParam, setPageParam] = useState('')

  useEffect(() => {
    const path = window.location.pathname
    if (path.startsWith('/share/')) {
      setPageParam(path.split('/share/')[1])
      setPage('share')
    } else if (path === '/saves') {
      setPage('saves')
    } else {
      setPage('chat')
    }
  }, [])

  if (page === 'share') return <SharePage shareId={pageParam} />
  if (page === 'saves') return <SavesPage onBack={() => { window.history.pushState({}, '', '/'); setPage('chat') }} />
  return <ChatLayout onViewSaves={() => { window.history.pushState({}, '', '/saves'); setPage('saves') }} />
}
