export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          Flux CRM
        </h1>
        <p className="text-gray-400 text-xl">
          Modern Customer Relationship Management
        </p>
        <div className="mt-8">
          <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200">
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}
