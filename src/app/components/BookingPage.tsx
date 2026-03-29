import { useState } from "react";
import { useSearchParams, Link } from "react-router";
import { MapPin, Calendar, Phone, User, Mail, Users, Car, CheckCircle, ArrowLeft, Sparkles, Shield, Clock, Star } from "lucide-react";
import { motion } from "motion/react";
import { api } from "../lib/api";
import { toast } from "sonner";

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: searchParams.get("phone") || "",
    pickupLocation: searchParams.get("pickupLocation") || "",
    destination: searchParams.get("destination") || "",
    vehicleType: searchParams.get("vehicleType") || "",
    vehicleName: searchParams.get("vehicleName") || "",
    travelDate: searchParams.get("travelDate") || "",
    returnDate: "",
    passengers: 1,
  });

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createBooking(form);
      setSubmitted(true);
      toast.success("Booking submitted successfully!");
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="font-[Inter,system-ui,sans-serif] min-h-[70vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold mb-3 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Booking Submitted!</h2>
          <p className="text-muted-foreground mb-2">
            Thank you, <strong>{form.customerName}</strong>. Your booking request has been received.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            We will contact you at <strong>{form.phone}</strong> to confirm your booking within 30 minutes.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              Back to Home
            </Link>
            <button
              onClick={() => { setSubmitted(false); setForm({ customerName: "", email: "", phone: "", pickupLocation: "", destination: "", vehicleType: "", vehicleName: "", travelDate: "", returnDate: "", passengers: 1 }); }}
              className="border border-border px-6 py-3 rounded-xl font-bold text-sm hover:bg-muted transition-all"
            >
              New Booking
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="font-[Inter,system-ui,sans-serif]">
      <section className="relative bg-[#0f0f23] py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-primary/15 text-primary">
              <Sparkles className="h-3 w-3" /> Book Your Ride
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Book Your Ride</h1>
            <p className="text-white/50 max-w-lg">Fill in the details below and we'll arrange the perfect vehicle for your journey.</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-border p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-extrabold mb-6 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" required value={form.customerName} onChange={(e) => update("customerName", e.target.value)}
                      placeholder="Your full name" className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)}
                      placeholder="your@email.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)}
                      placeholder="+91 98765 43210" className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Passengers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="number" min={1} max={50} value={form.passengers} onChange={(e) => update("passengers", parseInt(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-extrabold mb-6 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Journey Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Pickup Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" required value={form.pickupLocation} onChange={(e) => update("pickupLocation", e.target.value)}
                      placeholder="Where to pick you up" className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Destination *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <input type="text" required value={form.destination} onChange={(e) => update("destination", e.target.value)}
                      placeholder="Where are you going" className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Travel Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="date" required value={form.travelDate} onChange={(e) => update("travelDate", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Return Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="date" value={form.returnDate} onChange={(e) => update("returnDate", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Vehicle Type *</label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select required value={form.vehicleType} onChange={(e) => update("vehicleType", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none appearance-none">
                      <option value="">Select vehicle type</option>
                      <option value="Hatchback">Hatchback (4 seater)</option>
                      <option value="Sedan">Sedan (4 seater)</option>
                      <option value="Premium Sedan">Premium Sedan (4 seater)</option>
                      <option value="SUV">SUV (7 seater)</option>
                      <option value="Minibus">Minibus (12 seater)</option>
                      <option value="Bus">Bus (40 seater)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Booking Request"}
              </button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By submitting, you agree to our terms. We'll confirm your booking via phone call within 30 minutes.
              </p>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-bold text-sm mb-4 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Why Book With Us?</h3>
              <div className="space-y-4">
                {[
                  { icon: Shield, text: "100% insured rides" },
                  { icon: Clock, text: "Confirmation in 30 min" },
                  { icon: Star, text: "4.8+ rated drivers" },
                  { icon: Phone, text: "24/7 customer support" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#0f0f23] to-[#1a1a3e] rounded-2xl p-6 text-white">
              <h3 className="font-bold text-sm mb-3">Need Help Booking?</h3>
              <p className="text-white/50 text-sm mb-4">Our team is available 24/7 to assist you.</p>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-primary font-bold text-sm">
                <Phone className="h-4 w-4" /> +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
