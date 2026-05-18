'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { supabase } from '../../lib/supabase'

const STAFF_PASSWORD = 'gala2026'

function ScanContent() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('staff_authed')
    if (stored === 'true') setAuthed(true)
  }, [])

  function handleLogin() {
    if (password === STAFF_PASSWORD) {
      localStorage.setItem('staff_authed', 'true')
      setAuthed(true)
    } else {
      alert('Mot de passe incorrect')
    }
  }

  async function handleScan(token) {
    setLoading(true)
    const { data: guest } = await supabase.from('guests').select('*').eq('qr_token', token).single()
    if (!guest) {
      setResult({ valid: false, message: 'Invitation introuvable' })
      setLoading(false)
      return
    }
    if (guest.scanned_at) {
      setResult({ valid: false, message: 'Billet deja utilise le ' + new Date(guest.scanned_at).toLocaleString() })
      setLoading(false)
      return
    }
    await supabase.from('guests').update({ scanned_at: new Date().toISOString() }).eq('qr_token', token)
    setResult({ valid: true, message: 'Acces autorise', guest })
    setLoading(false)
  }

  async function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    const jsQR = (await import('jsqr')).default
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      if (code) {
        const rawData = code.data
      const token = rawData.includes('/ticket/') ? rawData.split('/ticket/')[1] : rawData
      handleScan(token)
      } else {
        setResult({ valid: false, message: 'QR code non reconnu' })
        setLoading(false)
      }
    }
    img.src = URL.createObjectURL(file)
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-8">Acces Staff</h1>
        <div className="w-full max-w-md space-y-4">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full bg-gray-900 rounded-xl p-4 text-white outline-none" />
          <button onClick={handleLogin} className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition">Connexion</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Scanner un billet</h1>
      {!result && !loading && (
        <label className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg cursor-pointer hover:bg-gray-200 transition">
          Scanner
          <input type="file" accept="image/*" capture="environment" onChange={handleImage} className="hidden" />
        </label>
      )}
      {loading && <p className="text-gray-400 text-xl">Verification...</p>}
      {result && (
        <div className={`p-6 rounded-xl w-full max-w-md text-center ${result.valid ? 'bg-green-900' : 'bg-red-900'}`}>
          <p className="text-2xl font-bold mb-2">{result.valid ? 'ACCES AUTORISE' : 'REFUS'}</p>
          <p className="text-gray-300 mb-2">{result.message}</p>
          {result.guest && <p className="text-xl">{result.guest.prenom} {result.guest.nom}</p>}
          <button onClick={() => setResult(null)} className="mt-4 bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition">
            Scanner suivant
          </button>
        </div>
      )}
    </main>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Chargement...</div>}>
      <ScanContent />
    </Suspense>
  )
}