import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { MapPin, Calendar, Phone, User, Mail, Users, Car, CheckCircle, ArrowLeft, Sparkles, Shield, Clock, Star, AlertCircle, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { api } from "../lib/api";
import { toast } from "sonner";

type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const NAME_RE = /^[a-zA-Z\s'.,-]+$/;

const INDIAN_LOCATIONS = [
  "Mumbai, Maharashtra", "Pune, Maharashtra", "Nagpur, Maharashtra", "Nashik, Maharashtra", "Aurangabad, Maharashtra",
  "Delhi, NCR", "New Delhi, NCR", "Noida, Uttar Pradesh", "Gurgaon, Haryana", "Faridabad, Haryana", "Ghaziabad, Uttar Pradesh",
  "Bangalore, Karnataka", "Mysore, Karnataka", "Mangalore, Karnataka", "Hubli, Karnataka",
  "Chennai, Tamil Nadu", "Coimbatore, Tamil Nadu", "Madurai, Tamil Nadu", "Salem, Tamil Nadu",
  "Hyderabad, Telangana", "Warangal, Telangana", "Vijayawada, Andhra Pradesh", "Visakhapatnam, Andhra Pradesh", "Tirupati, Andhra Pradesh",
  "Kolkata, West Bengal", "Howrah, West Bengal", "Siliguri, West Bengal", "Durgapur, West Bengal",
  "Ahmedabad, Gujarat", "Surat, Gujarat", "Vadodara, Gujarat", "Rajkot, Gujarat",
  "Jaipur, Rajasthan", "Udaipur, Rajasthan", "Jodhpur, Rajasthan", "Ajmer, Rajasthan", "Jaisalmer, Rajasthan",
  "Lucknow, Uttar Pradesh", "Varanasi, Uttar Pradesh", "Agra, Uttar Pradesh", "Kanpur, Uttar Pradesh", "Prayagraj, Uttar Pradesh",
  "Bhopal, Madhya Pradesh", "Indore, Madhya Pradesh", "Gwalior, Madhya Pradesh", "Ujjain, Madhya Pradesh",
  "Chandigarh, Punjab", "Amritsar, Punjab", "Ludhiana, Punjab", "Jalandhar, Punjab",
  "Patna, Bihar", "Gaya, Bihar", "Ranchi, Jharkhand", "Jamshedpur, Jharkhand",
  "Bhubaneswar, Odisha", "Puri, Odisha", "Cuttack, Odisha",
  "Kochi, Kerala", "Thiruvananthapuram, Kerala", "Kozhikode, Kerala", "Munnar, Kerala", "Alleppey, Kerala",
  "Goa, Goa", "Panaji, Goa", "Margao, Goa",
  "Shimla, Himachal Pradesh", "Manali, Himachal Pradesh", "Dharamshala, Himachal Pradesh",
  "Dehradun, Uttarakhand", "Rishikesh, Uttarakhand", "Haridwar, Uttarakhand", "Mussoorie, Uttarakhand", "Nainital, Uttarakhand",
  "Guwahati, Assam", "Shillong, Meghalaya", "Imphal, Manipur", "Gangtok, Sikkim", "Darjeeling, West Bengal",
  "Srinagar, Jammu & Kashmir", "Leh, Ladakh", "Jammu, Jammu & Kashmir",
  "Raipur, Chhattisgarh", "Bilaspur, Chhattisgarh",
  "Thiruvananthapuram, Kerala", "Ooty, Tamil Nadu", "Kodaikanal, Tamil Nadu", "Pondicherry, Puducherry",
  "Lonavala, Maharashtra", "Mahabaleshwar, Maharashtra", "Shirdi, Maharashtra",
];

function LocationSelect({ value, onChange, onBlur, placeholder, iconColor, field, inputBorder, showError }: {
  value: string; onChange: (v: string) => void; onBlur: () => void;
  placeholder: string; iconColor: string; field: string;
  inputBorder: (f: string) => string; showError: (f: string) => string | undefined;
}) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return INDIAN_LOCATIONS.slice(0, 15);
    const q = query.toLowerCase();
    return INDIAN_LOCATIONS.filter(l => l.toLowerCase().includes(q)).slice(0, 15);
  }, [query]);

  return (
    <div ref={ref} className="relative">
      <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${iconColor}`} />
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input type="text" value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { setTimeout(() => { setOpen(false); onBlur(); }, 150); }}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full pl-10 pr-9 py-3 rounded-xl bg-secondary border text-sm outline-none ${inputBorder(field)}`} />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white rounded-xl border border-border shadow-xl max-h-48 overflow-y-auto">
          {filtered.map((loc) => (
            <button key={loc} type="button"
              onMouseDown={(e) => { e.preventDefault(); setQuery(loc); onChange(loc); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors flex items-center gap-2 ${
                loc === value ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
              }`}>
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              {loc}
            </button>
          ))}
        </div>
      )}
      <FieldError message={showError(field)} />
    </div>
  );
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-600 mt-1.5 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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

  const today = useMemo(() => getTodayString(), []);

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  // Validation logic — returns all errors for current form state
  const validate = useCallback((): FieldErrors => {
    const errors: FieldErrors = {};
    const f = form;

    // Full Name
    if (!f.customerName.trim()) {
      errors.customerName = "Full name is required";
    } else if (f.customerName.trim().length < 2) {
      errors.customerName = "Name must be at least 2 characters";
    } else if (!NAME_RE.test(f.customerName.trim())) {
      errors.customerName = "Name should contain only letters and spaces";
    }

    // Email
    if (!f.email.trim()) {
      errors.email = "Email is required";
    } else if (!EMAIL_RE.test(f.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    // Phone — strict Indian 10-digit
    const digits = f.phone.replace(/[^\d]/g, "");
    if (!f.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (digits.length !== 10 || !PHONE_RE.test(digits)) {
      errors.phone = "Enter a valid 10-digit Indian mobile number (starting with 6-9)";
    }

    // Passengers
    if (f.passengers < 1 || f.passengers > 50) {
      errors.passengers = "Passengers must be between 1 and 50";
    }

    // Pickup Location
    if (!f.pickupLocation.trim()) {
      errors.pickupLocation = "Pickup location is required";
    } else if (f.pickupLocation.trim().length < 2) {
      errors.pickupLocation = "Pickup location must be at least 2 characters";
    }

    // Destination
    if (!f.destination.trim()) {
      errors.destination = "Destination is required";
    } else if (f.destination.trim().length < 2) {
      errors.destination = "Destination must be at least 2 characters";
    }

    // Travel Date
    if (!f.travelDate) {
      errors.travelDate = "Travel date is required";
    } else if (f.travelDate < today) {
      errors.travelDate = "Travel date cannot be in the past";
    }

    // Return Date (optional but must be valid if set)
    if (f.returnDate) {
      if (f.travelDate && f.returnDate < f.travelDate) {
        errors.returnDate = "Return date must be on or after travel date";
      }
      if (f.returnDate < today) {
        errors.returnDate = "Return date cannot be in the past";
      }
    }

    // Vehicle Type
    if (!f.vehicleType) {
      errors.vehicleType = "Please select a vehicle type";
    }

    return errors;
  }, [form, today]);

  const errors = validate();
  const hasErrors = Object.keys(errors).length > 0;

  // Show error for a field only if it's been touched or form was submitted
  const showError = (field: string) => (touched[field] ? errors[field] : undefined);

  const inputBorder = (field: string) =>
    touched[field] && errors[field]
      ? "border-red-400 ring-2 ring-red-100 focus:ring-red-200 focus:border-red-400"
      : "border-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary/30";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Touch all fields to reveal any errors
    const allTouched: Record<string, boolean> = {};
    Object.keys(form).forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);

    if (hasErrors) {
      toast.error("Please fix the highlighted errors before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await api.createBooking(form);
      setSubmitted(true);
      toast.success("Booking submitted successfully!");
    } catch (err: any) {
      console.error("Booking error:", err);
      // Show server-side validation errors if returned
      if (err?.message?.includes("Validation failed")) {
        toast.error("Server validation failed. Please check your input.");
      } else {
        toast.error("Failed to submit booking. Please try again.");
      }
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
              onClick={() => { setSubmitted(false); setTouched({}); setForm({ customerName: "", email: "", phone: "", pickupLocation: "", destination: "", vehicleType: "", vehicleName: "", travelDate: "", returnDate: "", passengers: 1 }); }}
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
            <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl border border-border p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-extrabold mb-6 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" value={form.customerName}
                      onChange={(e) => update("customerName", e.target.value)}
                      onBlur={() => markTouched("customerName")}
                      placeholder="Your full name"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border text-sm outline-none ${inputBorder("customerName")}`} />
                  </div>
                  <FieldError message={showError("customerName")} />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="email" value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      onBlur={() => markTouched("email")}
                      placeholder="your@email.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border text-sm outline-none ${inputBorder("email")}`} />
                  </div>
                  <FieldError message={showError("email")} />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Phone Number * <span className="normal-case text-[10px] font-normal">(10-digit Indian mobile)</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="tel" value={form.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d]/g, "").slice(0, 10);
                        update("phone", val);
                      }}
                      onBlur={() => markTouched("phone")}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border text-sm outline-none ${inputBorder("phone")}`} />
                  </div>
                  <FieldError message={showError("phone")} />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Passengers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="number" min={1} max={50} value={form.passengers}
                      onChange={(e) => update("passengers", parseInt(e.target.value) || 1)}
                      onBlur={() => markTouched("passengers")}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border text-sm outline-none ${inputBorder("passengers")}`} />
                  </div>
                  <FieldError message={showError("passengers")} />
                </div>
              </div>

              <h2 className="text-lg font-extrabold mb-6 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Journey Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Pickup Location * <span className="normal-case text-[10px] font-normal">(City, State)</span></label>
                  <LocationSelect value={form.pickupLocation} onChange={(v) => update("pickupLocation", v)}
                    onBlur={() => markTouched("pickupLocation")} placeholder="Type to search city..."
                    iconColor="text-muted-foreground" field="pickupLocation" inputBorder={inputBorder} showError={showError} />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Destination * <span className="normal-case text-[10px] font-normal">(City, State)</span></label>
                  <LocationSelect value={form.destination} onChange={(v) => update("destination", v)}
                    onBlur={() => markTouched("destination")} placeholder="Type to search city..."
                    iconColor="text-primary" field="destination" inputBorder={inputBorder} showError={showError} />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Travel Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="date" min={today} value={form.travelDate}
                      onChange={(e) => update("travelDate", e.target.value)}
                      onBlur={() => markTouched("travelDate")}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border text-sm outline-none ${inputBorder("travelDate")}`} />
                  </div>
                  <FieldError message={showError("travelDate")} />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Return Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="date" min={form.travelDate || today} value={form.returnDate}
                      onChange={(e) => update("returnDate", e.target.value)}
                      onBlur={() => markTouched("returnDate")}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border text-sm outline-none ${inputBorder("returnDate")}`} />
                  </div>
                  <FieldError message={showError("returnDate")} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Vehicle Type *</label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select value={form.vehicleType}
                      onChange={(e) => update("vehicleType", e.target.value)}
                      onBlur={() => markTouched("vehicleType")}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border text-sm outline-none appearance-none ${inputBorder("vehicleType")}`}>
                      <option value="">Select vehicle type</option>
                      <option value="Hatchback">Hatchback (4 seater)</option>
                      <option value="Sedan">Sedan (4 seater)</option>
                      <option value="Premium Sedan">Premium Sedan (4 seater)</option>
                      <option value="SUV">SUV (7 seater)</option>
                      <option value="Minibus">Minibus (12 seater)</option>
                      <option value="Bus">Bus (40 seater)</option>
                    </select>
                  </div>
                  <FieldError message={showError("vehicleType")} />
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
