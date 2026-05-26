export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold mb-6">
          South African Data, Made Accessible
        </h1>
        <p className="text-xl text-slate-400 mb-8">
          Download official government data. No barriers. No paywalls. Raw, clean, ready for analysis.
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded font-semibold">
          Start Downloading
        </button>
        <p className="text-slate-400 mt-12 text-sm">
          🚀 Frontend is being built in Google AI Studio. Backend API is ready at /api/
        </p>
      </div>
    </main>
  )
}
