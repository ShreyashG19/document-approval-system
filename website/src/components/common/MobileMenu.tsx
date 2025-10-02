import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  User2,
  PlusCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/services/auth/useAuth";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { icon: Clock, label: "Pending", href: "/pending", count: 12 },
  { icon: CheckCircle2, label: "Approved", href: "/approved", count: 45 },
  { icon: XCircle, label: "Rejected", href: "/rejected", count: 3 },
  { icon: MessageSquare, label: "correction", href: "/correction", count: 8 },
]

const adminNavigationItems = [
  { icon: User2, label: "Users", href :"/users", count: 12 },
  { icon: PlusCircleIcon, label: "Create User", href :"/admin/create-user", count: 12 },
]

const approverNavigationItems = [...navigationItems, {icon: User2, label: "Users", href :"/users", count: 12}]



export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useAuth();

  const displayNavigationItems = (() => {
    if(!user) return[];
    switch(user?.role) {
      case "assistant":
        return navigationItems
      case "admin":
        return adminNavigationItems
      case "approver":
        return approverNavigationItems
      default:
        return []
    }
  })();


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-left">Menu</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Navigate through your menu options
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav className="space-y-1 p-2">
            {displayNavigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-4 rounded-lg px-4 py-3 text-sm transition-colors",
                  // You can add logic here for active link if needed
                  "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
