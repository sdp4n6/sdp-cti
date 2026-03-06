import Sidebar from "./Sidebar"
import Header from "./Header"

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-200">

      <Sidebar />

      <div className="flex flex-col flex-1">

        <Header />

        <main className="p-6 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  )
}