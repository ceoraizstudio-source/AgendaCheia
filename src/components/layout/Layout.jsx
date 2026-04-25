import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import NewLeadModal from '../leads/NewLeadModal'

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-8 py-8" style={{ minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
      <NewLeadModal />
    </div>
  )
}
