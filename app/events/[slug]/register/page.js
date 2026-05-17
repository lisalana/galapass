'use client'

import { useState } from 'react'
import { use } from 'react'
import { supabase } from '../../../../lib/supabase'

export default function RegisterPage({ params }) {
  const { slug } = use(params)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [ticketId, setTicketId] = useState(null)

  async function handleSubmit() {
    setLoading(true)
    const { data: event } = await supabase.from('events').select('id').eq('slug', slug).single()
    if (!event) {
      alert('Evenement introuvable')
      setLoading(false)
      return
    }
    const token = crypto.randomUUID()
    const { data: guest, error } = await supabase.from('guests').insert({
      event_id: event.id,
      nom,
      prenom,
      telephone,
      qr_token: token
    }).select().single()
    console.log('guest:', guest)
    console.log('error:', error)
    if (!guest) {
      alert('Erreur: ' + JSON.stringify(error))
      setLoading(false)
      return
    }
    setTicketId(guest.qr_token)
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-4">Inscription confirmee !</h1>
        <p className="text-gray-400 mb-8">Votre invitation est prete</p>
        <a href={"/ticket/" + ticketId} className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition">Voir mon invitation</a>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Inscription</h1>
      <div className="w-full max-w-md space-y-4">
        <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Prenom" className="w-full bg-gray-900 rounded-xl p-4 text-white outline-none" />
        <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom" className="w-full bg-gray-900 rounded-xl p-4 text-white outline-none" />
        <input value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="Telephone" className="w-full bg-gray-900 rounded-xl p-4 text-white outline-none" />
        <button onClick={handleSubmit} disabled={loading} className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition">
          {loading ? 'Chargement...' : "S'inscrire"}
        </button>
      </div>
    </main>
  )
}