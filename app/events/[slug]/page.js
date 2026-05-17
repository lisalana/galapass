
import { supabase } from '../../../lib/supabase'

export default async function EventPage({ params }) {
  const { slug } = await params
  const { data: event } = await supabase.from('events').select('*').eq('slug', slug).single()

  if (!event) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Evenement introuvable</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
      <p className="text-gray-400 mb-2">{event.location}</p>
      <p className="text-gray-500 mb-8">{event.description}</p>
      <a href={"/events/" + slug + "/register"} className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition">Je veux une invitation</a>
    </main>
  )
}