import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Car, Menu, X, Phone, ChevronRight } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/fleet", label: "Our Fleet" },
    { to: "/destinations", label: "Destinations" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const isHome = location.pathname === "/";
  const navBg = scrolled || !isHome
    ? "bg-white/95 backdrop-blur-xl border-b border-border/50 shadow-sm"
    : "bg-transparent border-b border-transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-primary to-orange-500 rounded-xl p-2 group-hover:scale-105 transition-transform shadow-lg shadow-primary/20">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className={`text-lg font-extrabold tracking-tight font-[Plus_Jakarta_Sans,Inter,sans-serif] ${!scrolled && isHome ? "text-white" : "text-foreground"}`}>
                Shree Ganesh
              </span>
              <span className="text-lg font-extrabold text-primary tracking-tight font-[Plus_Jakarta_Sans,Inter,sans-serif]"> Travels</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.to)
                    ? "bg-primary/10 text-primary"
                    : !scrolled && isHome
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+919876543210" className={`flex items-center gap-2 text-sm transition-colors ${!scrolled && isHome ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-primary"}`}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-medium">+91 98765 43210</span>
            </a>
            <Link
              to="/book"
              className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
            >
              Book Now
            </Link>

          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setOpen(!open)} className={`lg:hidden p-2 rounded-xl transition-colors ${!scrolled && isHome ? "text-white hover:bg-white/10" : "hover:bg-muted"}`}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-border shadow-2xl animate-in slide-in-from-top-2">
          <div className="px-4 py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(link.to) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {link.label}
                <ChevronRight className="h-4 w-4 opacity-40" />
              </Link>
            ))}
            <div className="pt-3 space-y-2">
              <Link
                to="/book"
                className="block px-4 py-3.5 bg-primary text-white text-center rounded-xl text-sm font-bold shadow-lg shadow-primary/20"
              >
                Book Now
              </Link>

            </div>
          </div>
        </div>
      )}
    </nav>
  );
}