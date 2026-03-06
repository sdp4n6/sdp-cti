export default function Dashboard() {

  const stats = [
    { title: "Active Investigations", value: 4 },
    { title: "Threat Actors Tracked", value: 19 },
    { title: "IOCs Collected", value: 1823 },
    { title: "New Indicators Today", value: 34 },
  ]

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">
        Intelligence Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-4">

        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-900 p-4 rounded border border-gray-800"
          >
            <div className="text-sm text-gray-400">
              {stat.title}
            </div>

            <div className="text-2xl font-bold text-[#97CC04]">
              {stat.value}
            </div>
          </div>
        ))}

      </div>

    </div>
  )
}