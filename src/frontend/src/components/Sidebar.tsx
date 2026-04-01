import { BookOpen, CheckSquare, Repeat2, Wallet, Zap } from "lucide-react";
import type { Page } from "../App";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "habits", label: "Habits", icon: Repeat2 },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "expenses", label: "Expenses", icon: Wallet },
];

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ current, onNavigate }: SidebarProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border"
      style={{ minHeight: "100vh" }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-success flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sidebar-foreground font-semibold text-sm leading-tight">
              Daily Suite
            </p>
            <p className="text-sidebar-foreground/50 text-xs">{today}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = current === id;
          return (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.link`}
              onClick={() => onNavigate(id)}
              className={[
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground border-l-2 border-success pl-[10px]"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-l-2 border-transparent pl-[10px]",
              ].join(" ")}
            >
              <Icon
                className={[
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  active ? "text-success" : "text-sidebar-foreground/40",
                ].join(" ")}
              />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-sidebar-foreground/30 text-xs leading-relaxed">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-sidebar-foreground/60 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </aside>
  );
}
