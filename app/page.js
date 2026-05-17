
export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-4">GalaPass</h1>
      <p className="text-xl text-gray-400 mb-8 text-center max-w-md">
        La plateforme d&apos;invitations nominatives anti-fraude pour vos &eacute;v&eacute;nements sportifs
      </p>
      <a href="/events" className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition">
        Voir les &eacute;v&eacute;nements
      </a>
    </main>
  )
}