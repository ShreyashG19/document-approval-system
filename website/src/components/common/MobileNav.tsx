import { Clock, CheckCircle2, XCircle, MessageSquare, User2, PlusCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/services/auth/useAuth"

const navItems = [
  { icon: Clock, label: "Pending", href: "/pending" },
  { icon: CheckCircle2, label: "Approved", href: "/approved" },
  { icon: XCircle, label: "Rejected", href: "/rejected" },
  { icon: MessageSquare, label: "Corrections", href: "/correction" },
]

const adminNavItems = [
  { icon: User2, label: "Users", href: "/admin/users" },
  { icon: PlusCircleIcon, label: "Create User", href: "/admin/create-user" },
]

export function MobileNav() {
  const pathname = useLocation().pathname
  const { user } = useAuth()

  const displayNavItems =
    user?.role === "assistant" || user?.role === "approver"
      ? navItems
      : user?.role === "admin"
      ? adminNavItems
      : []

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div
        className="grid w-full"
        style={{ gridTemplateColumns: `repeat(${displayNavItems.length}, 1fr)` }}
      >
        {displayNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-3 text-xs w-full",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

