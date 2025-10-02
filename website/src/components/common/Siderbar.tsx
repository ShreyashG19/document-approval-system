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
  User2,
  PlusCircleIcon,
  Home,
  ArrowBigRightDash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/services/auth/useAuth";
import { useFetchDocumentCounts } from "@/services/documents/documentsApi";

interface SidebarProps {
  isOpen: boolean;
}

const navigationItems = [
  { icon: Clock, label: "Pending", href: "/pending", statusKey: "pending" },
  {
    icon: CheckCircle2,
    label: "Approved",
    href: "/approved",
    statusKey: "approved",
  },
  {
    icon: XCircle,
    label: "Rejected",
    href: "/rejected",
    statusKey: "rejected",
  },
  {
    icon: MessageSquare,
    label: "correction",
    href: "/correction",
    statusKey: "correction",
  },
];

const adminNavigationItems = [
  { icon: Home, label: "Home", href: "/admin-home", statusKey: null },
  { icon: User2, label: "Users", href: "/users", statusKey: null },
  {
    icon: PlusCircleIcon,
    label: "Create User",
    href: "/admin/create-user",
    statusKey: null,
  },
];

const approverNavigationItems = [
  { icon: Home, label: "Home", href: "/approver-home", statusKey: null },
  ...navigationItems,
  { icon: User2, label: "Users", href: "/users", statusKey: null },
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

  // Extract all status keys that need counts
  const statusKeys = displayNavigationItems
    .map((item) => item.statusKey)
    .filter((key): key is string => key !== null);

  // Fetch all counts at once
  const { counts, isLoading } = useFetchDocumentCounts(statusKeys);

  // Calculate totals for stats section
  const totalDocuments = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0
  );

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
            const count = item.statusKey ? counts[item.statusKey] ?? 0 : 0;

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
                    {item.statusKey && (
                      <Badge
                        variant="secondary"
                        className="h-5 min-w-5 px-1.5 text-xs"
                      >
                        {isLoading ? "..." : count}
                      </Badge>
                    )}
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
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Total Documents
                  <ArrowBigRightDash className="h-4 w-4 text-muted-foreground inline-block ml-1" />
                  {isLoading ? " ..." : ` ${totalDocuments}`}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
