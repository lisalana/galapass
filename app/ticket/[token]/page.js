'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { use } from 'react'
import QRCode from 'qrcode'

const STAFF_PASSWORD = 'gala2026'

export default function TicketPage({ params }) {
  const { token } = use(params)
  const [guest, setGuest] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const [isStaff, setIsStaff] = useState(false)
  const [password, setPassword] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('staff_authed')
    if (stored === 'true') setIsStaff(true)
    async function fetchGuest() {
      const { data } = await supabase.from('guests').select('*').eq('qr_token', token).single()
      setGuest(data)
      const url = await QRCode.toDataURL('https://galapass-chi.vercel.app/ticket/' + token, { width: 300 })
      setQrUrl(url)
    }
    fetchGuest()
  }, [token])

  function handleLogin() {
    if (password === STAFF_PASSWORD) {
      localStorage.setItem('staff_authed', 'true')
      setIsStaff(true)
      setShowLogin(false)
    } else {
      alert('Mot de passe incorrect')
    }
  }

  async function handleValidate() {
    setLoading(true)
    const { data: freshGuest } = await supabase.from('guests').select('*').eq('qr_token', token).single()
    if (!freshGuest) {
      setResult({ valid: false, message: 'Invitation introuvable' })
      setLoading(false)
      return
    }
    if (freshGuest.scanned_at) {
      setResult({ valid: false, message: 'Billet deja utilise le ' + new Date(freshGuest.scanned_at).toLocaleString() })
      setLoading(false)
      return
    }
    await supabase.from('guests').update({ scanned_at: new Date().toISOString() }).eq('qr_token', token)
    setResult({ valid: true, message: 'Acces autorise' })
    setLoading(false)
  }

  if (!guest) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Chargement...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      {!isStaff && !showLogin && (
        <button onClick={() => setShowLogin(true)} className="absolute top-4 right-4 text-gray-600 text-sm">
          Staff
        </button>
      )}
      {showLogin && !isStaff && (
        <div className="w-full max-w-md space-y-4 mb-8">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe staff" className="w-full bg-gray-900 rounded-xl p-4 text-white outline-none" />
          <button onClick={handleLogin} className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition">Connexion</button>
        </div>
      )}
      {isStaff && !result && (
        <div className="w-full max-w-md mb-8">
          <div className="bg-gray-900 rounded-xl p-6 text-center mb-4">
            <p className="text-gray-400 text-sm mb-1">Mode Staff</p>
            <p className="text-xl font-bold">{guest.prenom} {guest.nom}</p>
            <p className="text-gray-400">{guest.telephone}</p>
          </div>
          <button onClick={handleValidate} disabled={loading} className="w-full bg-white text-black py-4 rounded-xl font-bold text-xl hover:bg-gray-200 transition">
            {loading ? 'Verification...' : 'Valider entree'}
          </button>
        </div>
      )}
      {isStaff && result && (
        <div className={`p-6 rounded-xl w-full max-w-md text-center mb-8 ${result.valid ? 'bg-green-900' : 'bg-red-900'}`}>
          <p className="text-2xl font-bold mb-2">{result.valid ? 'ACCES AUTORISE' : 'REFUS'}</p>
          <p className="text-gray-300">{result.message}</p>
          <p className="text-xl mt-2">{guest.prenom} {guest.nom}</p>
        </div>
      )}
      {!isStaff && (
        <>
          <h1 className="text-3xl font-bold mb-2">Invitation</h1>
          <p className="text-xl text-gray-400 mb-1">{guest.prenom} {guest.nom}</p>
          <p className="text-gray-500 mb-8">{guest.telephone}</p>
          <div className="bg-white p-6 rounded-xl mb-4">
            {qrUrl && <img src={qrUrl} alt="QR Code" width={300} height={300} />}
          </div>
          <p className="text-gray-400 text-sm">Presentez ce QR code a l&apos;entree</p>
        </>
      )}
    </main>
  )
}