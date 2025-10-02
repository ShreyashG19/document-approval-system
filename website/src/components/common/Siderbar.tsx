import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Upload,
  ChevronRight,
  User2,
  PlusCircleIcon,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/services/auth/useAuth";

interface SidebarProps {
  isOpen: boolean;
}

const navigationItems = [
  // { icon: Dock, label: "All Documents", href: "/all-documents", count: 12 },
  { icon: Clock, label: "Pending", href: "/pending", count: 12 },
  { icon: CheckCircle2, label: "Approved", href: "/approved", count: 45 },
  { icon: XCircle, label: "Rejected", href: "/rejected", count: 3 },
  { icon: MessageSquare, label: "correction", href: "/correction", count: 8 },
];

const adminNavigationItems = [
  { icon: Home, label: "Home", href: "/admin-home", count: 12 },
  { icon: User2, label: "Users", href: "/users", count: 12 },
  {
    icon: PlusCircleIcon,
    label: "Create User",
    href: "/admin/create-user",
    count: 12,
  },
];

const approverNavigationItems = [
  { icon: Home, label: "Home", href: "/approver-home", count: 12 },
  ...navigationItems,
  { icon: User2, label: "Users", href: "/users", count: 12 },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = useLocation().pathname;

  const { user } = useAuth();

  const displayNavigationItems = (() => {
    if (!user) return [];
    switch (user?.role) {
      case "assistant":
        return navigationItems;
      case "admin":
        return adminNavigationItems;
      case "approver":
        return approverNavigationItems;
      default:
        return [];
    }
  })();

  return (
    <aside
      className={cn(
        "hidden flex-col border-r bg-background transition-all duration-300 md:flex",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="p-4">
        {user?.role === "assistant" && (
          <Button
            className="w-full justify-start gap-3 rounded-lg shadow-md"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("openUploadModal"))
            }
          >
            <Upload className="h-5 w-5" />
            {isOpen && <span>Upload Document</span>}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <nav className="space-y-3 px-1 pb-4">
          {displayNavigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    <Badge
                      variant="secondary"
                      className="h-5 min-w-5 px-1.5 text-xs"
                    >
                      {item.count}
                    </Badge>
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {isOpen && (
        <>
          <Separator />
          <div className="p-4">
            <div className="text-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium">Document Stats</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total Documents</span>
                  <span className="font-medium text-foreground">68</span>
                </div>
                <div className="flex justify-between">
                  <span>This Month</span>
                  <span className="font-medium text-foreground">15</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Review</span>
                  <span className="font-medium text-foreground">12</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
