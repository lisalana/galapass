'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { supabase } from '../../../lib/supabase'

const STAFF_PASSWORD = 'gala2026'

export default function ScanTokenPage({ params }) {
  const { token } = use(params)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [result, setResult] = useState(null)
  const [guest, setGuest] = useState(null)
  const [loading, setLoading] = useState(false)

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

  async function handleValidate() {
    console.log('handleValidate appelé !')
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
    setGuest(freshGuest)
    setResult({ valid: true, message: 'Acces autorise' })
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

  if (result) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <div className={`p-8 rounded-xl w-full max-w-md text-center ${result.valid ? 'bg-green-900' : 'bg-red-900'}`}>
          <p className="text-4xl font-bold mb-4">{result.valid ? 'ACCES AUTORISE' : 'REFUS'}</p>
          <p className="text-gray-300 mb-2">{result.message}</p>
          {guest && <p className="text-2xl mt-2">{guest.prenom} {guest.nom}</p>}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Valider entree</h1>
      <button onClick={handleValidate} disabled={loading} className="w-full max-w-md bg-white text-black py-6 rounded-xl font-bold text-2xl hover:bg-gray-200 transition">
      {loading ? 'Verification...' : 'Valider'}
      </button>
    </main>
  )
}