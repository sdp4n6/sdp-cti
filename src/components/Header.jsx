export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">

      <input
        type="text"
        placeholder="Search indicators, actors, investigations..."
        className="bg-gray-800 px-4 py-2 rounded w-96"
      />

      <div className="text-sm text-gray-400">
        Analyst
      </div>

    </header>
  )
}