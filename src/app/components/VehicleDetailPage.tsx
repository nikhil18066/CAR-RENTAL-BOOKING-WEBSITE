import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Users, Fuel, CheckCircle2, ArrowLeft, Luggage, Star, ArrowRight, Phone, Shield, Clock, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { api, type Vehicle } from "../lib/api";
import { ImageWithFallback } from "./ImageWithFallback";

export function VehicleDetailPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([
        api.getVehicle(id).then(setVehicle),
        api.getVehicles().then(setAllVehicles),
      ]).catch(console.error).finally(() => setLoading(false));
    }
  }, [id]);

  const similarVehicles = allVehicles
    .filter((v) => v.id !== id && vehicle && v.type === vehicle.type)
    .slice(0, 3);

  const otherVehicles = similarVehicles.length > 0
    ? similarVehicles
    : allVehicles.filter((v) => v.id !== id).slice(0, 3);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse font-[Inter,system-ui,sans-serif]">
        <div className="h-5 bg-muted rounded w-32 mb-8" />
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="h-[450px] bg-muted rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-24" />
            <div className="h-10 bg-muted rounded w-64" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-[Inter,system-ui,sans-serif]">
        <h2 className="text-2xl font-bold mb-4">Vehicle Not Found</h2>
        <Link to="/fleet" className="text-primary hover:underline font-semibold">Back to Fleet</Link>
      </div>
    );
  }

  return (
    <div className="font-[Inter,system-ui,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/fleet" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Fleet
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="rounded-3xl overflow-hidden border border-border shadow-lg">
              <ImageWithFallback src={vehicle.image} alt={vehicle.name} className="w-full h-[450px] object-cover" />
            </div>
            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: "Insured" },
                { icon: Clock, label: "On-time" },
                { icon: Star, label: "Top Rated" },
              ].map((b) => (
                <div key={b.label} className="bg-secondary rounded-2xl p-3 flex items-center gap-2 justify-center text-sm font-medium text-muted-foreground">
                  <b.icon className="h-4 w-4 text-primary" /> {b.label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-xl text-sm font-bold">{vehicle.type}</span>
              {vehicle.available && (
                <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Available Now
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 font-[Plus_Jakarta_Sans,Inter,sans-serif]">{vehicle.name}</h1>
            <p className="text-muted-foreground leading-relaxed mb-8 text-base">{vehicle.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Users, label: "Seats", value: `${vehicle.seats} Passengers`, color: "bg-blue-50 text-blue-600" },
                { icon: Luggage, label: "Luggage", value: `${vehicle.luggage} Bags`, color: "bg-purple-50 text-purple-600" },
                { icon: Fuel, label: "Fuel Type", value: vehicle.fuelType, color: "bg-emerald-50 text-emerald-600" },
                { icon: Sparkles, label: "AC", value: vehicle.ac ? "Yes - Climate Control" : "No", color: "bg-orange-50 text-orange-600" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-border hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">{item.label}</p>
                    <p className="font-bold text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h3 className="text-base font-bold mb-3 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Features & Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((f) => (
                  <span key={f} className="bg-primary/5 text-primary/80 border border-primary/10 px-3 py-2 rounded-xl text-sm flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0f0f23] to-[#1a1a3e] rounded-3xl p-7 text-white">
              <div className="flex items-end gap-8 mb-6">
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Per Kilometer</p>
                  <p className="text-3xl font-extrabold text-primary font-[Plus_Jakarta_Sans,Inter,sans-serif]">Rs. {vehicle.pricePerKm}</p>
                </div>
                <div className="border-l border-white/10 pl-8">
                  <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Per Day</p>
                  <p className="text-3xl font-extrabold font-[Plus_Jakarta_Sans,Inter,sans-serif]">Rs. {vehicle.pricePerDay.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  to={`/book?vehicleType=${vehicle.type}&vehicleName=${vehicle.name}`}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold text-center hover:bg-primary/90 transition-all shadow-xl shadow-primary/25"
                >
                  Book This Vehicle
                </Link>
                <a
                  href="tel:+919876543210"
                  className="px-6 py-4 rounded-2xl border border-white/15 hover:bg-white/10 transition-colors flex items-center gap-2 font-bold text-sm"
                >
                  <Phone className="h-4 w-4" /> Call
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Similar Vehicles */}
        {otherVehicles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-20"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-primary/10 text-primary">
                  Similar Vehicles
                </span>
                <h2 className="text-2xl font-extrabold font-[Plus_Jakarta_Sans,Inter,sans-serif]">You May Also Like</h2>
              </div>
              <Link to="/fleet" className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherVehicles.map((v) => (
                <Link
                  key={v.id}
                  to={`/fleet/${v.id}`}
                  className="bg-white rounded-3xl border border-border overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="h-48 overflow-hidden">
                    <ImageWithFallback src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-primary font-bold">{v.type}</span>
                    <h3 className="text-lg font-bold mt-1 mb-2 font-[Plus_Jakarta_Sans,Inter,sans-serif]">{v.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {v.seats}</span>
                      <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" /> {v.fuelType}</span>
                    </div>
                    <span className="text-primary font-extrabold text-lg font-[Plus_Jakarta_Sans,Inter,sans-serif]">Rs. {v.pricePerKm}/km</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
