import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Home,
  HardDrive,
  Monitor,
  Users,
  Clock,
  Star,
  AlertOctagon,
  Trash2,
  HardDriveDownload,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  { icon: Home, label: "Home", href: "/", active: true },
  { icon: HardDrive, label: "My Drive", href: "/my-drive" },
  { icon: Monitor, label: "Computers", href: "/computers" },
  { icon: Users, label: "Shared with me", href: "/shared" },
  { icon: Clock, label: "Recent", href: "/recent" },
  { icon: Star, label: "Starred", href: "/starred" },
  { icon: AlertOctagon, label: "Spam", href: "/spam" },
  { icon: Trash2, label: "Trash", href: "/trash" },
  { icon: HardDriveDownload, label: "Storage", href: "/storage" },
]

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav className="space-y-1 p-2">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-4 rounded-lg px-4 py-3 text-sm transition-colors",
                  item.active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4">
          <div className="text-sm text-muted-foreground">
            <div className="mb-2 flex items-center justify-between">
              <span>Storage</span>
              <ChevronRight className="h-4 w-4" />
            </div>
            <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/2 bg-primary" />
            </div>
            <p className="text-xs">4.11 GB of 2 TB used</p>
            <Button variant="outline" size="sm" className="mt-3 w-full bg-transparent text-xs">
              Get more storage
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
