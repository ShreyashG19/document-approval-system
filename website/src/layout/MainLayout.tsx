import { MobileNav } from "@/components/common/MobileNav"
import { MobileMenu } from "@/components/common/MobileMenu"
import { Navbar } from "@/components/common/Navbar"
import { Sidebar } from "@/components/common/Siderbar"
import { Outlet } from "react-router-dom"
import { useState } from "react"

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleMenuClick = () => {
    // Desktop toggles sidebar
    setSidebarOpen(!sidebarOpen)
    // Mobile toggles sheet menu
    if (window.innerWidth < 760) {
      setMobileMenuOpen(true)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar onMenuClick={handleMenuClick} />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />

      {/* Mobile sheet menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </div>
  )
}
