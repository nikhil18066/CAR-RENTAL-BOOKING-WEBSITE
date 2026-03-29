import { useState, useEffect } from "react";
import { Link } from "react-router";
import { MapPin, Clock, Star, ArrowRight, Sparkles, Search } from "lucide-react";
import { motion } from "motion/react";
import { api, type Destination } from "../lib/api";
import { ImageWithFallback } from "./ImageWithFallback";

const categories = ["All", "beach", "mountain", "heritage", "nature", "adventure"];
const categoryLabels: Record<string, string> = {
  All: "All", beach: "Beach", mountain: "Mountain", heritage: "Heritage", nature: "Nature", adventure: "Adventure",
};

export function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getDestinations()
      .then(setDestinations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = destinations.filter((d) => {
    const matchCat = filter === "All" || d.category === filter;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.tagline.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
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
              <Sparkles className="h-3 w-3" /> Explore India
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Travel Destinations</h1>
            <p className="text-white/50 max-w-lg text-base">Explore India's most beautiful destinations with our curated travel packages.</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-10"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text" placeholder="Search destinations..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                  filter === c ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white border border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                }`}
              >
                {categoryLabels[c]}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-border overflow-hidden animate-pulse flex flex-col lg:flex-row h-80">
                <div className="lg:w-1/2 bg-muted h-full" />
                <div className="lg:w-1/2 p-8 space-y-4">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-8 bg-muted rounded w-48" />
                  <div className="h-16 bg-muted rounded w-full" />
                  <div className="h-10 bg-muted rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">No destinations found.</p>
            <button onClick={() => { setFilter("All"); setSearch(""); }} className="text-primary font-semibold text-sm mt-3 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filtered.map((d, idx) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className={`bg-white rounded-3xl border border-border overflow-hidden flex flex-col ${
                  idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } hover:shadow-xl transition-all group`}
              >
                <div className="lg:w-1/2 relative h-72 lg:h-auto overflow-hidden">
                  <ImageWithFallback src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent lg:bg-none" />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm">
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" /> {d.rating}
                  </div>
                  {d.featured && (
                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                      Featured
                    </div>
                  )}
                </div>
                <div className="lg:w-1/2 p-8 flex flex-col justify-center">
                  <span className="text-xs text-primary font-bold uppercase tracking-wider mb-2">{d.tagline}</span>
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-3 font-[Plus_Jakarta_Sans,Inter,sans-serif]">{d.name}</h2>
                  <p className="text-muted-foreground mb-5 leading-relaxed">{d.description}</p>
                  <div className="flex items-center gap-5 mb-5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {d.duration}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> Multiple stops</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Highlights</p>
                    <div className="flex flex-wrap gap-2">
                      {d.highlights.map((h) => (
                        <span key={h} className="bg-primary/5 text-primary/80 border border-primary/10 px-3 py-1.5 rounded-xl text-xs font-medium">{h}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-5 border-t border-border">
                    <div>
                      <span className="text-xs text-muted-foreground">Starting from</span>
                      <p className="text-2xl font-extrabold text-primary font-[Plus_Jakarta_Sans,Inter,sans-serif]">Rs. {d.price.toLocaleString()}</p>
                    </div>
                    <Link
                      to={`/book?destination=${d.name}`}
                      className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5"
                    >
                      Book Trip <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
