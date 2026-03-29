import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  MapPin, Calendar, Car, Users, Shield, Clock, Star,
  ChevronRight, ArrowRight, Phone, CheckCircle2, Fuel,
  Search, CalendarCheck, ThumbsUp, Headphones, Play,
  Sparkles, TrendingUp, Award, Heart
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { api, type Vehicle, type Review, type Destination } from "../lib/api";
import { ImageWithFallback } from "./ImageWithFallback";

const HERO_IMG = "https://images.unsplash.com/photo-1721994234246-45087e5aca16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjByb2FkJTIwdHJpcCUyMHN1bnNldCUyMGluZGlhfGVufDF8fHx8MTc3MzE0MDM2N3ww&ixlib=rb-4.1.0&q=80&w=1080";

const stats = [
  { value: "10K+", label: "Happy Customers", icon: Heart },
  { value: "500+", label: "Vehicles", icon: Car },
  { value: "50+", label: "Destinations", icon: MapPin },
  { value: "24/7", label: "Support", icon: Headphones },
];

const howItWorks = [
  { step: "01", icon: Search, title: "Choose Your Trip", desc: "Select your pickup, destination, travel date and preferred vehicle type." },
  { step: "02", icon: CalendarCheck, title: "Book & Confirm", desc: "Fill in your details and submit the booking. We'll confirm within 30 minutes." },
  { step: "03", icon: Car, title: "Enjoy the Ride", desc: "Our driver picks you up on time. Sit back, relax, and enjoy the journey." },
  { step: "04", icon: ThumbsUp, title: "Rate & Review", desc: "Share your experience. Your feedback helps us improve our service." },
];

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ badge, title, subtitle, light = false }: { badge?: string; title: string; subtitle: string; light?: boolean }) {
  return (
    <div className="text-center mb-14">
      {badge && (
        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 ${light ? "bg-white/10 text-white/80" : "bg-primary/10 text-primary"}`}>
          <Sparkles className="h-3 w-3" /> {badge}
        </span>
      )}
      <h2 className={`text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold leading-tight mb-4 font-[Plus_Jakarta_Sans,Inter,sans-serif] ${light ? "text-white" : "text-foreground"}`}>
        {title}
      </h2>
      <p className={`max-w-2xl mx-auto text-base leading-relaxed ${light ? "text-white/60" : "text-muted-foreground"}`}>
        {subtitle}
      </p>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    pickupLocation: "",
    destination: "",
    travelDate: "",
    vehicleType: "",
    phone: "",
  });

  useEffect(() => {
    Promise.all([
      api.getVehicles().then(setVehicles),
      api.getReviews().then(setReviews),
      api.getDestinations().then(setDestinations),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(bookingForm);
    navigate(`/book?${params.toString()}`);
  };

  const featuredDestinations = destinations.filter(d => d.featured).slice(0, 4);

  return (
    <div className="font-[Inter,system-ui,sans-serif]">
      {/* Hero */}
      <section className="relative min-h-[90vh] lg:min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback src={HERO_IMG} alt="Travel" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f23]/95 via-[#0f0f23]/75 to-[#0f0f23]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f23]/50 via-transparent to-transparent" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 px-5 py-2 rounded-full text-sm font-medium mb-8 border border-white/10">
                <div className="flex -space-x-1.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-orange-400 border-2 border-[#0f0f23]" />
                  ))}
                </div>
                <span>Trusted by 10,000+ travelers across India</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] mb-6 font-[Plus_Jakarta_Sans,Inter,sans-serif]"
            >
              Travel With
              <br />
              <span className="bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">Confidence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-white/60 mb-10 max-w-lg leading-relaxed"
            >
              Premium car rentals, outstation cabs, and curated tour packages.
              Experience safe, comfortable, and memorable journeys with Shree Ganesh Travels.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/book"
                className="group bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-primary/25 flex items-center gap-3 transition-all hover:-translate-y-0.5"
              >
                Book Your Ride
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/fleet"
                className="bg-white/10 backdrop-blur-md border border-white/15 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-white/20 transition-all flex items-center gap-3"
              >
                <Play className="h-4 w-4" />
                Explore Fleet
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center gap-6 mt-12 pt-8 border-t border-white/10"
            >
              {[
                { icon: Shield, text: "Insured Rides" },
                { icon: Award, text: "Verified Drivers" },
                { icon: TrendingUp, text: "Best Prices" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/50 text-sm">
                  <item.icon className="h-4 w-4 text-primary/80" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Booking Form - overlapping hero */}
      <section className="relative z-10 -mt-12 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-3xl shadow-2xl shadow-black/10 border border-border/50 p-5 md:p-6"
          >
            <form onSubmit={handleQuickBook} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="lg:col-span-1">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Pickup</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text" placeholder="City or Address" required
                    value={bookingForm.pickupLocation}
                    onChange={(e) => setBookingForm({ ...bookingForm, pickupLocation: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="lg:col-span-1">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <input
                    type="text" placeholder="Where to?" required
                    value={bookingForm.destination}
                    onChange={(e) => setBookingForm({ ...bookingForm, destination: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="lg:col-span-1">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date" required
                    value={bookingForm.travelDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, travelDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="lg:col-span-1">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Vehicle</label>
                <select
                  required
                  value={bookingForm.vehicleType}
                  onChange={(e) => setBookingForm({ ...bookingForm, vehicleType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                >
                  <option value="">Select type</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Premium Sedan">Premium Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Minibus">Minibus</option>
                  <option value="Bus">Bus</option>
                </select>
              </div>
              <div className="lg:col-span-1">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel" placeholder="+91" required
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="lg:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Search Rides
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative bg-white rounded-2xl border border-border p-6 text-center group hover:shadow-lg hover:border-primary/20 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <s.icon className="h-5 w-5 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-foreground font-[Plus_Jakarta_Sans,Inter,sans-serif]">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <AnimatedSection>
        <section className="py-20 bg-gradient-to-b from-secondary/50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              badge="Simple Process"
              title="How It Works"
              subtitle="Book your ride in 4 easy steps. Simple, fast, and completely hassle-free."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="relative text-center group"
                >
                  <div className="relative mx-auto mb-6">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-black/5 group-hover:shadow-primary/15 group-hover:bg-primary transition-all duration-300 border border-border group-hover:border-primary">
                      <item.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="absolute -top-2 -right-2 bg-gradient-to-br from-primary to-orange-500 text-white text-xs font-bold w-8 h-8 rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold mb-2 font-[Plus_Jakarta_Sans,Inter,sans-serif]">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[calc(50%+50px)] w-[calc(100%-100px)] border-t-2 border-dashed border-primary/15" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="Why Us"
              title="Why Choose Shree Ganesh Travels?"
              subtitle="We go above and beyond to ensure your travel experience is comfortable, safe, and truly memorable."
            />
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Shield, title: "Safe & Secure", desc: "GPS-tracked vehicles, verified drivers, and comprehensive insurance coverage.", gradient: "from-blue-500 to-blue-600" },
              { icon: Clock, title: "24/7 Availability", desc: "Round-the-clock booking and customer support for all your travel needs.", gradient: "from-purple-500 to-purple-600" },
              { icon: Car, title: "Premium Fleet", desc: "Regularly serviced vehicles ensuring reliability and comfort on every trip.", gradient: "from-primary to-orange-500" },
              { icon: Headphones, title: "Dedicated Support", desc: "Personal trip coordinator assigned for every booking. We're always a call away.", gradient: "from-emerald-500 to-emerald-600" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-6 border border-border hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold mb-2 font-[Plus_Jakarta_Sans,Inter,sans-serif]">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Preview */}
      <section className="py-20 bg-secondary/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-primary/10 text-primary">
                  <Car className="h-3 w-3" /> Our Fleet
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold font-[Plus_Jakarta_Sans,Inter,sans-serif]">Choose Your Ride</h2>
                <p className="text-muted-foreground mt-2">Well-maintained vehicles for every travel need</p>
              </div>
              <Link to="/fleet" className="hidden md:flex items-center gap-1.5 text-primary font-bold text-sm hover:gap-2.5 transition-all">
                View All Fleet <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl border border-border overflow-hidden animate-pulse">
                  <div className="h-56 bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-10 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.slice(0, 3).map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link
                    to={`/fleet/${v.id}`}
                    className="bg-white rounded-3xl border border-border overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all block"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <ImageWithFallback src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                        {v.type}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold text-primary shadow-sm">
                        Rs. {v.pricePerKm}/km
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-3 font-[Plus_Jakarta_Sans,Inter,sans-serif]">{v.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-5">
                        <span className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-lg"><Users className="h-3.5 w-3.5" /> {v.seats}</span>
                        <span className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-lg"><Fuel className="h-3.5 w-3.5" /> {v.fuelType}</span>
                        {v.ac && <span className="flex items-center gap-1.5 bg-green-50 text-green-600 px-2.5 py-1 rounded-lg"><CheckCircle2 className="h-3.5 w-3.5" /> AC</span>}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                          <span className="text-2xl font-extrabold text-primary font-[Plus_Jakarta_Sans,Inter,sans-serif]">Rs. {v.pricePerDay.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">/day</span>
                        </div>
                        <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          Details <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          <div className="md:hidden mt-8 text-center">
            <Link to="/fleet" className="inline-flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 px-6 py-3 rounded-xl">
              View All Vehicles <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="relative py-24 bg-[#0f0f23] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="Explore India"
              title="Popular Destinations"
              subtitle="Explore India's most breathtaking destinations with our comfortable travel packages."
              light
            />
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(featuredDestinations.length > 0 ? featuredDestinations : destinations.slice(0, 4)).map((d, i) => (
              <motion.div
                key={d.id || d.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link to={`/book?destination=${d.name}`} className="relative rounded-3xl overflow-hidden group h-80 block">
                  <ImageWithFallback src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> {d.rating}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-xs text-primary font-semibold uppercase tracking-wider">{d.tagline}</span>
                    <h3 className="text-white text-2xl font-extrabold mt-1 mb-2 font-[Plus_Jakarta_Sans,Inter,sans-serif]">{d.name}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white/50 text-xs">from </span>
                        <span className="text-white font-bold text-lg">Rs. {d.price.toLocaleString()}</span>
                      </div>
                      <span className="text-white/50 text-xs flex items-center gap-1"><Clock className="h-3 w-3" /> {d.duration}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/destinations" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all">
              Explore All Destinations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeader
              badge="Testimonials"
              title="What Our Customers Say"
              subtitle="Real reviews from our happy travelers who trust us for their journeys"
            />
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.length === 0 && !loading ? (
              <p className="col-span-3 text-center text-muted-foreground py-10">Loading reviews...</p>
            ) : (
              reviews.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="bg-white rounded-3xl border border-border p-7 hover:shadow-xl hover:-translate-y-1 transition-all relative"
                >
                  {/* Quote mark */}
                  <div className="absolute top-5 right-6 text-6xl text-primary/10 font-serif leading-none">"</div>
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 relative z-10">"{r.comment}"</p>
                  <div className="flex items-center gap-3 pt-5 border-t border-border">
                    <ImageWithFallback src={r.avatar} alt={r.name} className="w-11 h-11 rounded-2xl object-cover" />
                    <div>
                      <p className="font-bold text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.date}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-orange-500" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white/90 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-white/10">
              <Sparkles className="h-3 w-3" /> Start Your Adventure
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 font-[Plus_Jakarta_Sans,Inter,sans-serif]">
              Ready to Hit the Road?
            </h2>
            <p className="text-white/70 mb-10 max-w-lg mx-auto text-base leading-relaxed">
              Book your ride now and experience premium travel with Shree Ganesh Travels. Your comfort is our top priority.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/book"
                className="bg-white text-primary px-10 py-4 rounded-2xl font-bold hover:bg-white/95 transition-all shadow-xl hover:-translate-y-0.5"
              >
                Book Now
              </Link>
              <a
                href="tel:+919876543210"
                className="border-2 border-white/30 text-white px-10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Phone className="h-4 w-4" /> Call Us
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
