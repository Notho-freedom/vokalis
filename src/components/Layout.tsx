import { Link, NavLink } from "react-router-dom";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/playground", label: "Playground" },
  { to: "/lab", label: "Voice Lab" },
  { to: "/personas", label: "Personas" },
  { to: "/voices", label: "Voices" },
  { to: "/reader", label: "Reader" },
  { to: "/docs", label: "Docs" },
];

export function Header() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b hairline bg-background/70 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-6 flex h-14 items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="signal-dot" />
          <span className="font-display text-[19px] tracking-tight lowercase">{APP_NAME.toLowerCase()}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-[13px]">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "transition-colors duration-200 relative",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {n.label}
                  {isActive && <span className="absolute -bottom-[18px] left-0 right-0 h-px bg-signal" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggle} aria-label="Theme" className="p-2 text-muted-foreground hover:text-foreground transition">
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="hidden md:inline-block px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground transition">
                Dashboard
              </Link>
              <button onClick={signOut} className="px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground transition">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="hidden md:inline-block px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground transition">
                Sign in
              </Link>
              <Link
                to="/auth?mode=signup"
                className="ml-1 px-3.5 py-1.5 text-[13px] font-medium bg-foreground text-background hover:bg-signal hover:text-accent-foreground transition rounded-md"
              >
                Get API key
              </Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 ml-1">
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t hairline bg-background">
          <nav className="container py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition"
              >
                {n.label}
              </NavLink>
            ))}
            {user && <Link to="/dashboard" onClick={() => setOpen(false)} className="px-2 py-2 text-sm">Dashboard</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t hairline mt-32 relative z-10">
      <div className="mx-auto max-w-[1400px] px-6 py-16 grid gap-12 md:grid-cols-5 text-[13px]">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="signal-dot" />
            <span className="font-display text-2xl lowercase">{APP_NAME}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-[36ch]">
            Cinematic neural text-to-speech. 400+ voices, 100+ languages. Free forever for makers, dependable for production.
          </p>
        </div>
        <div>
          <div className="mono-label text-muted-foreground mb-4">Product</div>
          <ul className="space-y-2.5 text-muted-foreground">
            <li><Link to="/playground" className="hover:text-foreground">Playground</Link></li>
            <li><Link to="/lab" className="hover:text-foreground">Voice Lab</Link></li>
            <li><Link to="/personas" className="hover:text-foreground">Personas</Link></li>
            <li><Link to="/voices" className="hover:text-foreground">Voice library</Link></li>
            <li><Link to="/reader" className="hover:text-foreground">Article Reader</Link></li>
          </ul>
        </div>
        <div>
          <div className="mono-label text-muted-foreground mb-4">Developers</div>
          <ul className="space-y-2.5 text-muted-foreground">
            <li><Link to="/docs" className="hover:text-foreground">Documentation</Link></li>
            <li><Link to="/docs#streaming" className="hover:text-foreground">Streaming API</Link></li>
            <li><Link to="/docs#sdk" className="hover:text-foreground">JavaScript SDK</Link></li>
            <li><Link to="/docs#webhooks" className="hover:text-foreground">Webhooks</Link></li>
            <li><Link to="/status" className="hover:text-foreground">Status</Link></li>
          </ul>
        </div>
        <div>
          <div className="mono-label text-muted-foreground mb-4">System</div>
          <ul className="space-y-2.5 text-muted-foreground">
            <li className="flex items-center gap-2"><span className="signal-dot" /> All systems normal</li>
            <li>Uptime · 99.97%</li>
            <li>p95 latency · 612ms</li>
            <li>Voices online · 412</li>
          </ul>
        </div>
      </div>
      <div className="border-t hairline">
        <div className="mx-auto max-w-[1400px] px-6 py-5 flex flex-col sm:flex-row justify-between gap-2 text-[11px] font-mono text-muted-foreground">
          <span>© {new Date().getFullYear()} {APP_NAME} — synthetic voice for everyone</span>
          <span className="opacity-70">Built on edge·tts / FastAPI / Lovable Cloud</span>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background grain">
      <Header />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
