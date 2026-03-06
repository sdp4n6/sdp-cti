export default function Investigations() {

  const investigations = [
    {
      id: "TRI-2026-03-001",
      title: "DarkGate Campaign Analysis",
      status: "Active",
    },
    {
      id: "TRI-2026-03-002",
      title: "Stealer Malware Infrastructure",
      status: "Closed",
    },
  ]

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">
        Investigations
      </h1>

      <table className="w-full bg-gray-900 border border-gray-800">

        <thead>
          <tr className="border-b border-gray-800 text-left">
            <th className="p-3">ID</th>
            <th className="p-3">Title</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>

        <tbody>

          {investigations.map((inv) => (
            <tr key={inv.id} className="border-b border-gray-800">

              <td className="p-3 text-[#97CC04]">
                {inv.id}
              </td>

              <td className="p-3">
                {inv.title}
              </td>

              <td className="p-3">
                {inv.status}
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  )
}