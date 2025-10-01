import { Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"

const navItems = [
  { icon: Clock, label: "Pending", href: "/pending" },
  { icon: CheckCircle2, label: "Approved", href: "/approved" },
  { icon: XCircle, label: "Rejected", href: "/rejected" },
  { icon: MessageSquare, label: "Remarks", href: "/remarks" },
]

export function MobileNav() {
  const pathname = useLocation().pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
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
