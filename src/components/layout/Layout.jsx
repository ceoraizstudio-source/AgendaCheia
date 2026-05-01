import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import NewLeadModal from '../leads/NewLeadModal'

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-8 py-8" style={{ minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
      <NewLeadModal />
    </div>
  )
}
