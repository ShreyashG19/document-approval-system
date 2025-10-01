import { MobileNav } from "@/components/common/MobileNav"
import { Navbar } from "@/components/common/Navbar"
import { Sidebar } from "@/components/common/Siderbar"
import { Outlet } from 'react-router-dom'
import { useState } from "react"

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar onMenuClick={handleMenuClick} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />

        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="p-4 lg:p-6">
            {/* Render nested route content */}
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
