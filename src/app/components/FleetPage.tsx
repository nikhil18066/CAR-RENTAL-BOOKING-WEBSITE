import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Users, Fuel, CheckCircle2, ArrowRight, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { api, type Vehicle } from "../lib/api";
import { ImageWithFallback } from "./ImageWithFallback";

const vehicleTypes = ["All", "Hatchback", "Sedan", "Premium Sedan", "SUV", "Minibus", "Bus"];

export function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVehicles().then((v) => { setVehicles(v); setLoading(false); }).catch(console.error);
  }, []);

  const filtered = vehicles.filter((v) => {
    const matchType = filter === "All" || v.type === filter;
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.type.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="font-[Inter,system-ui,sans-serif]">
      {/* Header */}
      <section className="relative bg-[#0f0f23] py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-primary/15 text-primary">
              <Sparkles className="h-3 w-3" /> Our Fleet
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Our Vehicle Fleet</h1>
            <p className="text-white/50 max-w-lg text-base">Choose from our wide range of vehicles for any occasion. All vehicles are well-maintained and come with experienced drivers.</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            {vehicleTypes.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filter === t ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white border border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Count */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-6">
            Showing <strong className="text-foreground">{filtered.length}</strong> vehicle{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-border overflow-hidden animate-pulse">
                <div className="h-56 bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-10 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">No vehicles found matching your criteria.</p>
            <button onClick={() => { setFilter("All"); setSearch(""); }} className="text-primary font-semibold text-sm mt-3 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link
                  to={`/fleet/${v.id}`}
                  className="bg-white rounded-3xl border border-border overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1 block"
                >
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">{v.type}</div>
                    {v.available && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">Available</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 font-[Plus_Jakarta_Sans,Inter,sans-serif]">{v.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{v.description}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-5">
                      <span className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-lg"><Users className="h-3.5 w-3.5" /> {v.seats}</span>
                      <span className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-lg"><Fuel className="h-3.5 w-3.5" /> {v.fuelType}</span>
                      {v.ac && <span className="flex items-center gap-1.5 bg-green-50 text-green-600 px-2.5 py-1 rounded-lg"><CheckCircle2 className="h-3.5 w-3.5" /> AC</span>}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <span className="text-xl font-extrabold text-primary font-[Plus_Jakarta_Sans,Inter,sans-serif]">Rs. {v.pricePerKm}</span>
                        <span className="text-xs text-muted-foreground">/km</span>
                        <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">| Rs. {v.pricePerDay.toLocaleString()}/day</span>
                      </div>
                      <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Book <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
