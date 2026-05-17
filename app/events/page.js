import { supabase } from '../../lib/supabase'

export default async function Events() {
  const { data: events } = await supabase.from('events').select('*')

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Evenements</h1>
      {events && events.map((event) => (
        <a key={event.id} href={"/events/" + event.slug} className="block bg-gray-900 rounded-xl p-6 mb-4 hover:bg-gray-800 transition">
          <h2 className="text-2xl font-bold mb-2">{event.name}</h2>
          <p className="text-gray-400 mb-1">{event.location}</p>
          <p className="text-gray-500">{event.description}</p>
        </a>
      ))}
    </main>
  )
}