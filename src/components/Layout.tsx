import { Link, NavLink, useLocation } from "react-router-dom";
import { Moon, Sun, Mic, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/playground", label: "Playground" },
  { to: "/voices", label: "Voix" },
  { to: "/docs", label: "Docs" },
];

export function Header() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 glass">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-brand blur-md opacity-50 group-hover:opacity-80 transition" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <span className="font-heading font-bold text-lg tracking-tight">{APP_NAME}</span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground border border-border">BETA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to}
              className={({ isActive }) => cn("px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                isActive ? "text-foreground bg-surface-2" : "text-muted-foreground hover:text-foreground hover:bg-surface-2")}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Theme">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link to="/dashboard"><LayoutDashboard className="w-4 h-4 mr-1.5" />Dashboard</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out"><LogOut className="w-4 h-4" /></Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link to="/auth">Connexion</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-brand text-white hover:opacity-90 shadow-glow">
                <Link to="/auth?mode=signup">Commencer</Link>
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur">
          <nav className="container py-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={({ isActive }) => cn("px-3 py-2 text-sm rounded-md",
                  isActive ? "bg-surface-2 text-foreground" : "text-muted-foreground")}>
                {n.label}
              </NavLink>
            ))}
            {user && <Link to="/dashboard" onClick={() => setOpen(false)} className="px-3 py-2 text-sm rounded-md text-muted-foreground">Dashboard</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-24">
      <div className="container py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-gradient-brand" />
            <span className="font-heading font-bold">{APP_NAME}</span>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">Plateforme de synthèse vocale gratuite, alimentée par 400+ voix neuronales dans plus de 100 langues.</p>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-xs uppercase tracking-wider text-muted-foreground">Produit</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/playground" className="hover:text-foreground">Playground</Link></li>
            <li><Link to="/voices" className="hover:text-foreground">Bibliothèque</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-xs uppercase tracking-wider text-muted-foreground">Développeurs</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/docs" className="hover:text-foreground">Documentation</Link></li>
            <li><Link to="/docs#quickstart" className="hover:text-foreground">Quickstart</Link></li>
            <li><Link to="/docs#endpoints" className="hover:text-foreground">Endpoints</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-xs uppercase tracking-wider text-muted-foreground">Légal</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>Conditions</li>
            <li>Confidentialité</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 py-5">
        <div className="container text-xs text-muted-foreground flex justify-between">
          <span>© {new Date().getFullYear()} {APP_NAME}</span>
          <span className="font-mono">Powered by Edge-TTS · Render</span>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background noise">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
