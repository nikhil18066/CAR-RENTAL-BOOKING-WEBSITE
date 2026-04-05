import { Link, useNavigate } from "react-router";
import { Car, Phone, Mail, MapPin, Facebook, Instagram, Twitter, ArrowRight } from "lucide-react";

export function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="bg-[#0f0f23] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-gradient-to-br from-primary to-orange-500 rounded-xl p-2 shadow-lg shadow-primary/20">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold font-[Plus_Jakarta_Sans,Inter,sans-serif]">Shree Ganesh Travels</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Your trusted travel partner for car rentals, outstation trips, and tour packages across India. Safe, reliable, and affordable.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-5 uppercase tracking-wider text-white/60">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/fleet", label: "Our Fleet" },
                { to: "/destinations", label: "Destinations" },
                { to: "/book", label: "Book a Ride" },
                { to: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/40 hover:text-primary text-sm transition-colors flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-5 uppercase tracking-wider text-white/60">Services</h4>
            <ul className="space-y-3 text-sm text-white/40">
              {["Local Car Rental", "Outstation Trips", "Airport Transfer", "Corporate Travel", "Wedding Car Hire", "Tour Packages"].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-5 uppercase tracking-wider text-white/60">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
                <a href="https://maps.google.com/?q=Nildhara+housing+society,+1645,+near+Sai+Baba+mandir,+MHB+Colony,+Satpur+Colony,+Nashik,+Maharashtra+422007,+India" target="_blank" rel="noopener noreferrer" className="text-white/40 text-sm hover:text-primary transition-colors leading-relaxed">
                  Nildhara housing society, 1645, near Sai Baba mandir, MHB Colony, Satpur Colony, Nashik, Maharashtra 422007, India
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                </div>
                <a href="tel:+919422273107" className="text-white/40 text-sm hover:text-primary transition-colors">+91 94222 73107</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                </div>
                <a href="mailto:kishorsontakke2@gmail.com" className="text-white/40 text-sm hover:text-primary transition-colors">kishorsontakke2@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-sm cursor-default select-none" onDoubleClick={() => navigate("/admin")}>© 2026 Shree Ganesh Travels. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
