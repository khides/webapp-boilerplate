import { Menu, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Page = "home" | "items";

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { page: Page; label: string }[] = [
  { page: "home", label: "Home" },
  { page: "items", label: "Items" },
];

export function Header({ currentPage, onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface-1/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity"
        >
          <Package className="h-6 w-6 text-primary" />
          {/* TODO: アプリケーション名に変更 */}
          <span>Webapp</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                currentPage === item.page
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
