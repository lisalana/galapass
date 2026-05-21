'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { supabase } from '../../lib/supabase'

const STAFF_PASSWORD = 'gala2026'

function ScanContent() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  const streamRef = useRef(null)

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

  async function startScanner() {
    setScanning(true)
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      videoRef.current.play()
      intervalRef.current = setInterval(() => scanFrame(), 500)
    } catch {
      alert('Impossible d acceder a la camera')
      setScanning(false)
    }
  }

  function stopScanner() {
    clearInterval(intervalRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    setScanning(false)
  }

async function scanFrame() {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    if (canvas.width === 0 || canvas.height === 0) return
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const jsQR = (await import('jsqr')).default
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    if (code) {
      clearInterval(intervalRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      setScanning(false)
      const rawData = code.data
      let token = rawData
      if (rawData.includes('/ticket/')) token = rawData.split('/ticket/')[1]
      if (rawData.includes('token=')) token = rawData.split('token=')[1]
      console.log('token extrait:', token)
      await handleScan(token)
    }
  }

  async function handleScan(token) {
    setLoading(true)
    console.log('handleScan appelé avec token:', token)
    const { data: guest, error } = await supabase.from('guests').select('*').eq('qr_token', token).single()
    console.log('guest:', guest, 'error:', error)
    if (!guest) {
      setResult({ valid: false, message: 'Invitation introuvable' })
      setLoading(false)
      return
    }
    console.log('scanned_at:', guest.scanned_at)
    if (guest.scanned_at) {
      setResult({ valid: false, message: 'Billet deja utilise le ' + new Date(guest.scanned_at).toLocaleString() })
      setLoading(false)
      return
    }
    await supabase.from('guests').update({ scanned_at: new Date().toISOString() }).eq('qr_token', token)
    setResult({ valid: true, message: 'Acces autorise', guest })
    setLoading(false)
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
        <>
          <video ref={videoRef} className={`w-full max-w-sm rounded-xl mb-4 ${scanning ? 'block' : 'hidden'}`} playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          {!scanning && (
            <button onClick={startScanner} className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition">
              Scanner
            </button>
          )}
          {scanning && (
            <button onClick={stopScanner} className="bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-red-700 transition">
              Arreter
            </button>
          )}
        </>
      )}
      {loading && <p className="text-gray-400 text-xl mt-4">Verification...</p>}
      {result && (
        <div className={`p-6 rounded-xl w-full max-w-md text-center ${result.valid ? 'bg-green-900' : 'bg-red-900'}`}>
          <p className="text-2xl font-bold mb-2">{result.valid ? 'ACCES AUTORISE' : 'REFUS'}</p>
          <p className="text-gray-300 mb-2">{result.message}</p>
          {result.guest && <p className="text-xl">{result.guest.prenom} {result.guest.nom}</p>}
          <button onClick={() => { setResult(null); startScanner() }} className="mt-4 bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition">
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