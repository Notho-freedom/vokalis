import { Link, NavLink } from "react-router-dom";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/playground", label: "playground" },
  { to: "/voices", label: "voices" },
  { to: "/docs", label: "docs" },
];

export function Header() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b hairline bg-background/85 backdrop-blur">
      <div className="container flex h-12 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <span className="signal-dot" />
          <span className="font-mono font-medium text-sm tracking-tight lowercase">{APP_NAME.toLowerCase()}</span>
          <span className="mono-label text-muted-foreground hidden sm:inline">v2.0</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-xs font-mono">
          {NAV.map((n, i) => (
            <span key={n.to} className="flex items-center">
              {i > 0 && <span className="text-muted-foreground/40 mx-1">/</span>}
              <NavLink
                to={n.to}
                className={({ isActive }) =>
                  cn(
                    "px-2 py-1 transition-colors",
                    isActive
                      ? "text-foreground underline underline-offset-4 decoration-signal decoration-2"
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {n.label}
              </NavLink>
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button onClick={toggle} aria-label="Theme" className="p-2 text-muted-foreground hover:text-foreground transition">
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="hidden md:inline-block px-3 py-1 text-xs font-mono text-muted-foreground hover:text-foreground transition">
                dashboard
              </Link>
              <button onClick={signOut} className="px-3 py-1 text-xs font-mono text-muted-foreground hover:text-foreground transition">
                sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="hidden md:inline-block px-3 py-1 text-xs font-mono text-muted-foreground hover:text-foreground transition">
                sign in
              </Link>
              <Link
                to="/auth?mode=signup"
                className="ml-1 px-3 py-1 text-xs font-mono bg-foreground text-background hover:bg-signal hover:text-accent-foreground transition"
              >
                get key →
              </Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 ml-1">
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t hairline bg-background">
          <nav className="container py-3 flex flex-col gap-2 text-sm font-mono">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-2 py-1 text-muted-foreground">
                / {n.label}
              </NavLink>
            ))}
            {user && <Link to="/dashboard" onClick={() => setOpen(false)} className="px-2 py-1">/ dashboard</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t hairline mt-24">
      <div className="container py-12 grid gap-10 md:grid-cols-4 text-xs font-mono">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="signal-dot" />
            <span className="font-medium lowercase">{APP_NAME}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-[28ch]">
            Free neural text-to-speech. 400+ voices. 100+ languages. Built for makers.
          </p>
        </div>
        <div>
          <div className="mono-label text-muted-foreground mb-4">// product</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/playground" className="hover:text-foreground">→ playground</Link></li>
            <li><Link to="/voices" className="hover:text-foreground">→ voice library</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">→ dashboard</Link></li>
          </ul>
        </div>
        <div>
          <div className="mono-label text-muted-foreground mb-4">// developers</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/docs" className="hover:text-foreground">→ documentation</Link></li>
            <li><Link to="/docs#streaming" className="hover:text-foreground">→ streaming</Link></li>
            <li><Link to="/docs#translate" className="hover:text-foreground">→ translation</Link></li>
          </ul>
        </div>
        <div>
          <div className="mono-label text-muted-foreground mb-4">// status</div>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2"><span className="signal-dot" /> all systems normal</li>
            <li>uptime · 99.9%</li>
            <li>latency · ~620ms</li>
          </ul>
        </div>
      </div>
      <div className="border-t hairline">
        <div className="container py-4 flex flex-col sm:flex-row justify-between gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          <span>© {new Date().getFullYear()} {APP_NAME} — synthetic voice for everyone</span>
          <span>edge·tts / fastapi / lovable cloud</span>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background grain">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
