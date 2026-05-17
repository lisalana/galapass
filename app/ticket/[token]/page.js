
import { supabase } from '../../../lib/supabase'
import QRCode from 'qrcode'

export default async function TicketPage({ params }) {
  const { token } = await params
  const { data: guest } = await supabase.from('guests').select('*').eq('qr_token', token).single()

  if (!guest) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Invitation introuvable</p>
      </main>
    )
  }

  const qrDataUrl = await QRCode.toDataURL('https://galapass-chi.vercel.app/scan?token=' + token, { width: 300 })

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-2">Invitation</h1>
      <p className="text-xl text-gray-400 mb-1">{guest.prenom} {guest.nom}</p>
      <p className="text-gray-500 mb-8">{guest.telephone}</p>
      <div className="bg-white p-6 rounded-xl mb-4">
        <img src={qrDataUrl} alt="QR Code" width={300} height={300} />
      </div>
      <p className="text-gray-400 text-sm">Presentez ce QR code a l&apos;entree</p>
    </main>
  )
}