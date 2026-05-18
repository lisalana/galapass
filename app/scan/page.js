'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { supabase } from '../../lib/supabase'
import { useSearchParams } from 'next/navigation'

const STAFF_PASSWORD = 'gala2026'

function ScanContent() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [result, setResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const html5QrRef = useRef(null)
  const searchParams = useSearchParams()

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
    if (loading) return
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

  useEffect(() => {
    if (!scanning) return
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      const scanner = new Html5Qrcode('qr-reader')
      html5QrRef.current = scanner
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          scanner.stop()
          setScanning(false)
          handleScan(decodedText)
        },
        () => {}
      )
    })
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {})
      }
    }
  }, [scanning])

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
      {!result && (
        <>
          <div id="qr-reader" className="w-full max-w-sm mb-4"></div>
          <button onClick={() => setScanning(!scanning)} className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition">
            {scanning ? 'Arreter' : 'Scanner'}
          </button>
        </>
      )}
      {result && (
        <div className={`p-6 rounded-xl w-full max-w-md text-center ${result.valid ? 'bg-green-900' : 'bg-red-900'}`}>
          <p className="text-2xl font-bold mb-2">{result.valid ? 'ACCES AUTORISE' : 'REFUS'}</p>
          <p className="text-gray-300 mb-2">{result.message}</p>
          {result.guest && (
            <p className="text-xl">{result.guest.prenom} {result.guest.nom}</p>
          )}
          <button onClick={() => { setResult(null); setScanning(true) }} className="mt-4 bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition">
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