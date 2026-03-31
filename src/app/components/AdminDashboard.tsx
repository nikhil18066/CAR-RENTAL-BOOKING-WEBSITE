import { useState, useEffect, useMemo } from "react";
import {
  Car, CalendarCheck, LogOut, Plus, Pencil, Trash2,
  CheckCircle, XCircle, Clock, X, MapPin,
  LayoutDashboard, Globe, Star, TrendingUp, Eye, RotateCcw
} from "lucide-react";
import { api, type Vehicle, type Booking, type Destination } from "../lib/api";
import { toast } from "sonner";
import { ImageWithFallback } from "./ImageWithFallback";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

const CHART_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#eab308", "#06b6d4", "#ec4899"];
const STATUS_COLORS: Record<string, string> = { pending: "#eab308", confirmed: "#22c55e", cancelled: "#ef4444" };

type Tab = "overview" | "vehicles" | "bookings" | "destinations";

export function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(() => typeof window !== "undefined" && !!localStorage.getItem("adminToken"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showDestModal, setShowDestModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [vehicleForm, setVehicleForm] = useState({
    name: "", type: "Sedan", seats: 4, luggage: 2, ac: true,
    fuelType: "Petrol", pricePerKm: 12, pricePerDay: 2500,
    image: "", description: "", features: "", available: true,
  });
  const [destForm, setDestForm] = useState({
    name: "", tagline: "", image: "", price: 5000, duration: "2-3 days",
    rating: 4.5, highlights: "", description: "", category: "nature", featured: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const res = await api.adminLogin(username, password);
      if (res.token) {
        localStorage.setItem("adminToken", res.token);
      }
      setLoggedIn(true);
      setLoginError("");
    } catch {
      setLoginError("Invalid Administrator credentials.");
    } finally {
      setLoggingIn(false);
    }
  };

  useEffect(() => {
    if (loggedIn) loadData();
  }, [loggedIn]);

  const loadData = async () => {
    const results = await Promise.allSettled([
      api.getVehicles(),
      api.getBookings(),
      api.getDestinations(),
    ]);

    const [vResult, bResult, dResult] = results;

    if (vResult.status === "fulfilled") {
      setVehicles(Array.isArray(vResult.value) ? vResult.value : []);
    } else {
      console.error("Failed to load vehicles:", vResult.reason);
    }

    if (bResult.status === "fulfilled") {
      setBookings(Array.isArray(bResult.value) ? bResult.value : []);
    } else {
      console.error("Failed to load bookings:", bResult.reason);
    }

    if (dResult.status === "fulfilled") {
      setDestinations(Array.isArray(dResult.value) ? dResult.value : []);
    } else {
      console.error("Failed to load destinations:", dResult.reason);
    }

    const failedCount = results.filter((r) => r.status === "rejected").length;
    if (failedCount > 0) {
      toast.error(`Failed to load ${failedCount} data source(s). Some data may be missing.`);
    }
  };

  // Vehicle CRUD
  const openAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleForm({ name: "", type: "Sedan", seats: 4, luggage: 2, ac: true, fuelType: "Petrol", pricePerKm: 12, pricePerDay: 2500, image: "", description: "", features: "", available: true });
    setShowVehicleModal(true);
  };
  const openEditVehicle = (v: Vehicle) => {
    setEditingVehicle(v);
    setVehicleForm({ ...v, features: v.features.join(", ") } as any);
    setShowVehicleModal(true);
  };
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...vehicleForm, features: (vehicleForm.features as string).split(",").map((f: string) => f.trim()).filter(Boolean) };
    try {
      if (editingVehicle) {
        await api.updateVehicle(editingVehicle.id, data);
        toast.success("Vehicle updated!");
      } else {
        await api.createVehicle(data);
        toast.success("Vehicle added!");
      }
      setShowVehicleModal(false);
      loadData();
    } catch { toast.error("Failed to save vehicle"); }
  };
  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("Delete this vehicle?")) return;
    try { await api.deleteVehicle(id); toast.success("Vehicle deleted"); loadData(); }
    catch { toast.error("Failed to delete"); }
  };

  // Destination CRUD
  const openAddDest = () => {
    setEditingDest(null);
    setDestForm({ name: "", tagline: "", image: "", price: 5000, duration: "2-3 days", rating: 4.5, highlights: "", description: "", category: "nature", featured: false });
    setShowDestModal(true);
  };
  const openEditDest = (d: Destination) => {
    setEditingDest(d);
    setDestForm({ ...d, highlights: d.highlights.join(", ") } as any);
    setShowDestModal(true);
  };
  const handleSaveDest = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...destForm, highlights: (destForm.highlights as string).split(",").map((h: string) => h.trim()).filter(Boolean) };
    try {
      if (editingDest) {
        await api.updateDestination(editingDest.id, data);
        toast.success("Destination updated!");
      } else {
        await api.createDestination(data);
        toast.success("Destination added!");
      }
      setShowDestModal(false);
      loadData();
    } catch { toast.error("Failed to save destination"); }
  };
  const handleDeleteDest = async (id: string) => {
    if (!confirm("Delete this destination?")) return;
    try { await api.deleteDestination(id); toast.success("Destination deleted"); loadData(); }
    catch { toast.error("Failed to delete"); }
  };

  // Booking actions with confirmation + revert support
  const handleBookingStatus = async (id: string, newStatus: string) => {
    const labels: Record<string, string> = {
      confirmed: "confirm this booking",
      cancelled: "cancel this booking",
      pending: "revert this booking to pending",
    };
    const label = labels[newStatus] || `set status to ${newStatus}`;
    if (!confirm(`Are you sure you want to ${label}?`)) return;
    try {
      await api.updateBooking(id, { status: newStatus });
      toast.success(`Booking ${newStatus === "pending" ? "reverted to pending" : newStatus}`);
      loadData();
    } catch (err: any) {
      const msg = err?.message || "Failed to update booking";
      toast.error(msg);
    }
  };

  // Computed values (must be before any early return to satisfy React hooks rules)
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  // Chart data
  const vehicleTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach((v) => { counts[v.type] = (counts[v.type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [vehicles]);

  const bookingStatusData = useMemo(() => [
    { name: "Pending", value: pendingCount, fill: STATUS_COLORS.pending },
    { name: "Confirmed", value: confirmedCount, fill: STATUS_COLORS.confirmed },
    { name: "Cancelled", value: cancelledCount, fill: STATUS_COLORS.cancelled },
  ], [pendingCount, confirmedCount, cancelledCount]);

  const destCategoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    destinations.forEach((d) => { counts[d.category] = (counts[d.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [destinations]);

  // Login screen
  if (!loggedIn) {
    return (
      <div className="font-[Inter,system-ui,sans-serif] min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-br from-secondary via-white to-secondary">
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/10 p-8 w-full max-w-sm border border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
              <LayoutDashboard className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-extrabold font-[Plus_Jakarta_Sans,Inter,sans-serif]">Admin Panel</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to manage your platform</p>
          </div>
          {loginError && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-xl p-3 mb-4 font-medium">{loginError}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                placeholder="Enter user id" className="w-full px-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="Enter password" className="w-full px-4 py-3 rounded-xl bg-secondary border border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none" />
            </div>
            <button type="submit" disabled={loggingIn}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60">
              {loggingIn ? "Signing in..." : "Sign In"}
            </button>
          </form>

        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "vehicles", label: "Vehicles", icon: Car, badge: vehicles.length },
    { key: "bookings", label: "Bookings", icon: CalendarCheck, badge: pendingCount || undefined },
    { key: "destinations", label: "Destinations", icon: Globe, badge: destinations.length },
  ];

  return (
    <div className="font-[Inter,system-ui,sans-serif] min-h-screen bg-secondary/50">
      {/* Top Bar */}
      <div className="bg-white border-b border-border sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  tab === t.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${
                    t.key === "bookings" && pendingCount > 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}>{t.badge}</span>
                )}
              </button>
            ))}
          </div>
          <button onClick={() => { localStorage.removeItem("adminToken"); setLoggedIn(false); }} className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors font-medium">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ===== OVERVIEW ===== */}
        {tab === "overview" && (
          <div>
            <h2 className="text-2xl font-extrabold mb-6 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Dashboard Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[
                { label: "Total Vehicles", value: vehicles.length, icon: Car, color: "from-blue-500 to-blue-600" },
                { label: "Total Bookings", value: bookings.length, icon: CalendarCheck, color: "from-emerald-500 to-emerald-600" },
                { label: "Pending", value: pendingCount, icon: Clock, color: "from-yellow-500 to-yellow-600" },
                { label: "Confirmed", value: confirmedCount, icon: CheckCircle, color: "from-green-500 to-green-600" },
                { label: "Destinations", value: destinations.length, icon: Globe, color: "from-purple-500 to-purple-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm`}>
                      <s.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-[Plus_Jakarta_Sans,Inter,sans-serif]">{s.value}</p>
                </div>
              ))}
            </div>

            {/* ===== CHARTS ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
              {/* Vehicle Type Distribution */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Vehicle Types</h4>
                {vehicleTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={vehicleTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                        paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {vehicleTypeData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px", fontWeight: 600 }} />
                      <Legend iconType="circle" iconSize={8}
                        formatter={(v: string) => <span className="text-xs font-semibold text-muted-foreground">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No vehicle data</div>
                )}
              </div>

              {/* Booking Status */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Booking Status</h4>
                {bookings.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={bookingStatusData} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px", fontWeight: 600 }} cursor={{ fill: "#f8fafc" }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {bookingStatusData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No booking data</div>
                )}
              </div>

              {/* Destination Categories */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Destination Categories</h4>
                {destCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={destCategoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                        paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {destCategoryData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[(i + 3) % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px", fontWeight: 600 }} />
                      <Legend iconType="circle" iconSize={8}
                        formatter={(v: string) => <span className="text-xs font-semibold text-muted-foreground">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No destination data</div>
                )}
              </div>
            </div>

            <h3 className="text-lg font-bold mb-4 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Recent Bookings</h3>
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No bookings yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Customer</th>
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Route</th>
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-5 py-3.5 font-semibold">{b.customerName}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{b.pickupLocation} → {b.destination}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{b.travelDate}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              b.status === "confirmed" ? "bg-green-100 text-green-700" :
                              b.status === "cancelled" ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>{b.status}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-1.5">
                              {b.status === "pending" && (
                                <>
                                  <button onClick={() => handleBookingStatus(b.id, "confirmed")}
                                    className="bg-green-100 text-green-700 p-1.5 rounded-lg hover:bg-green-200 transition-colors" title="Confirm">
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleBookingStatus(b.id, "cancelled")}
                                    className="bg-red-100 text-red-700 p-1.5 rounded-lg hover:bg-red-200 transition-colors" title="Cancel">
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              {b.status === "confirmed" && (
                                <>
                                  <button onClick={() => handleBookingStatus(b.id, "pending")}
                                    className="bg-blue-100 text-blue-700 p-1.5 rounded-lg hover:bg-blue-200 transition-colors" title="Revert to Pending">
                                    <RotateCcw className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleBookingStatus(b.id, "cancelled")}
                                    className="bg-red-100 text-red-700 p-1.5 rounded-lg hover:bg-red-200 transition-colors" title="Cancel">
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              {b.status === "cancelled" && (
                                <button onClick={() => handleBookingStatus(b.id, "pending")}
                                  className="bg-blue-100 text-blue-700 p-1.5 rounded-lg hover:bg-blue-200 transition-colors" title="Revert to Pending">
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== VEHICLES ===== */}
        {tab === "vehicles" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold font-[Plus_Jakarta_Sans,Inter,sans-serif]">Manage Vehicles</h2>
              <button onClick={openAddVehicle} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Add Vehicle
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map((v) => (
                <div key={v.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-44 relative overflow-hidden">
                    <ImageWithFallback src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button onClick={() => openEditVehicle(v)} className="bg-white/95 backdrop-blur-sm p-2 rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
                        <Pencil className="h-3.5 w-3.5 text-blue-600" />
                      </button>
                      <button onClick={() => handleDeleteVehicle(v.id)} className="bg-white/95 backdrop-blur-sm p-2 rounded-xl hover:bg-red-50 transition-colors shadow-sm">
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold font-[Plus_Jakarta_Sans,Inter,sans-serif]">{v.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${v.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {v.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{v.type} | {v.seats} seats | {v.fuelType}</p>
                    <p className="text-sm font-bold text-primary">Rs. {v.pricePerKm}/km | Rs. {v.pricePerDay.toLocaleString()}/day</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== BOOKINGS ===== */}
        {tab === "bookings" && (
          <div>
            <h2 className="text-2xl font-extrabold mb-6 font-[Plus_Jakarta_Sans,Inter,sans-serif]">Manage Bookings</h2>
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {bookings.length === 0 ? (
                <div className="text-center py-20">
                  <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No bookings yet. Bookings will appear here when customers submit them.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Customer</th>
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Phone</th>
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Route</th>
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Vehicle</th>
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-5 py-4">
                            <p className="font-semibold">{b.customerName}</p>
                            <p className="text-xs text-muted-foreground">{b.email}</p>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">{b.phone}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3 text-primary" />
                              {b.pickupLocation} → {b.destination}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">{b.vehicleType}</td>
                          <td className="px-5 py-4 text-muted-foreground">{b.travelDate}</td>
                          <td className="px-5 py-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              b.status === "confirmed" ? "bg-green-100 text-green-700" :
                              b.status === "cancelled" ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>{b.status}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1.5">
                              {b.status === "pending" && (
                                <>
                                  <button onClick={() => handleBookingStatus(b.id, "confirmed")}
                                    className="bg-green-100 text-green-700 p-1.5 rounded-lg hover:bg-green-200 transition-colors" title="Confirm">
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleBookingStatus(b.id, "cancelled")}
                                    className="bg-red-100 text-red-700 p-1.5 rounded-lg hover:bg-red-200 transition-colors" title="Cancel">
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              {b.status === "confirmed" && (
                                <>
                                  <button onClick={() => handleBookingStatus(b.id, "pending")}
                                    className="bg-blue-100 text-blue-700 p-1.5 rounded-lg hover:bg-blue-200 transition-colors" title="Revert to Pending">
                                    <RotateCcw className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleBookingStatus(b.id, "cancelled")}
                                    className="bg-red-100 text-red-700 p-1.5 rounded-lg hover:bg-red-200 transition-colors" title="Cancel">
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              {b.status === "cancelled" && (
                                <button onClick={() => handleBookingStatus(b.id, "pending")}
                                  className="bg-blue-100 text-blue-700 p-1.5 rounded-lg hover:bg-blue-200 transition-colors" title="Revert to Pending">
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== DESTINATIONS ===== */}
        {tab === "destinations" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold font-[Plus_Jakarta_Sans,Inter,sans-serif]">Manage Destinations</h2>
              <button onClick={openAddDest} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Add Destination
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {destinations.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-44 relative overflow-hidden">
                    <ImageWithFallback src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button onClick={() => openEditDest(d)} className="bg-white/95 backdrop-blur-sm p-2 rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
                        <Pencil className="h-3.5 w-3.5 text-blue-600" />
                      </button>
                      <button onClick={() => handleDeleteDest(d.id)} className="bg-white/95 backdrop-blur-sm p-2 rounded-xl hover:bg-red-50 transition-colors shadow-sm">
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>
                    {d.featured && (
                      <div className="absolute top-2 left-2 bg-primary text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
                        Featured
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> {d.rating}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-lg font-[Plus_Jakarta_Sans,Inter,sans-serif]">{d.name}</h3>
                      <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded-lg capitalize font-medium">{d.category}</span>
                    </div>
                    <p className="text-xs text-primary font-semibold mb-2">{d.tagline}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{d.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-primary font-extrabold font-[Plus_Jakarta_Sans,Inter,sans-serif]">Rs. {d.price.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {d.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowVehicleModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-extrabold font-[Plus_Jakarta_Sans,Inter,sans-serif]">{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</h3>
              <button onClick={() => setShowVehicleModal(false)} className="p-1.5 hover:bg-muted rounded-xl"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveVehicle} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Vehicle Name *</label>
                  <input type="text" required value={vehicleForm.name} onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Type *</label>
                  <select value={vehicleForm.type} onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none">
                    {["Hatchback", "Sedan", "Premium Sedan", "SUV", "Minibus", "Bus"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Fuel Type</label>
                  <select value={vehicleForm.fuelType} onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none">
                    {["Petrol", "Diesel", "Petrol/Diesel", "CNG", "Electric"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Seats</label>
                  <input type="number" min={1} value={vehicleForm.seats} onChange={(e) => setVehicleForm({ ...vehicleForm, seats: +e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Luggage</label>
                  <input type="number" min={0} value={vehicleForm.luggage} onChange={(e) => setVehicleForm({ ...vehicleForm, luggage: +e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Price/km (Rs.)</label>
                  <input type="number" min={1} value={vehicleForm.pricePerKm} onChange={(e) => setVehicleForm({ ...vehicleForm, pricePerKm: +e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Price/day (Rs.)</label>
                  <input type="number" min={1} value={vehicleForm.pricePerDay} onChange={(e) => setVehicleForm({ ...vehicleForm, pricePerDay: +e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Image URL</label>
                  <input type="url" value={vehicleForm.image} onChange={(e) => setVehicleForm({ ...vehicleForm, image: e.target.value })}
                    placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Description</label>
                  <textarea rows={2} value={vehicleForm.description} onChange={(e) => setVehicleForm({ ...vehicleForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Features (comma-separated)</label>
                  <input type="text" value={vehicleForm.features} onChange={(e) => setVehicleForm({ ...vehicleForm, features: e.target.value })}
                    placeholder="AC, GPS, Music System" className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none" />
                </div>
                <div className="col-span-2 flex items-center gap-5">
                  <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
                    <input type="checkbox" checked={vehicleForm.ac} onChange={(e) => setVehicleForm({ ...vehicleForm, ac: e.target.checked })} className="rounded" />
                    AC
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
                    <input type="checkbox" checked={vehicleForm.available} onChange={(e) => setVehicleForm({ ...vehicleForm, available: e.target.checked })} className="rounded" />
                    Available
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  {editingVehicle ? "Update" : "Add Vehicle"}
                </button>
                <button type="button" onClick={() => setShowVehicleModal(false)} className="px-6 py-3 rounded-xl font-bold text-sm border border-border hover:bg-muted transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Destination Modal */}
      {showDestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDestModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-extrabold font-[Plus_Jakarta_Sans,Inter,sans-serif]">{editingDest ? "Edit Destination" : "Add Destination"}</h3>
              <button onClick={() => setShowDestModal(false)} className="p-1.5 hover:bg-muted rounded-xl"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveDest} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Destination Name *</label>
                  <input type="text" required value={destForm.name} onChange={(e) => setDestForm({ ...destForm, name: e.target.value })}
                    placeholder="e.g. Goa" className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Tagline *</label>
                  <input type="text" required value={destForm.tagline} onChange={(e) => setDestForm({ ...destForm, tagline: e.target.value })}
                    placeholder="e.g. Beaches & Nightlife" className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Category</label>
                  <select value={destForm.category} onChange={(e) => setDestForm({ ...destForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none">
                    {["beach", "mountain", "heritage", "nature", "adventure"].map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Price (Rs.)</label>
                  <input type="number" min={0} value={destForm.price} onChange={(e) => setDestForm({ ...destForm, price: +e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Duration</label>
                  <input type="text" value={destForm.duration} onChange={(e) => setDestForm({ ...destForm, duration: e.target.value })}
                    placeholder="e.g. 2-3 days" className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Rating</label>
                  <input type="number" step="0.1" min={0} max={5} value={destForm.rating} onChange={(e) => setDestForm({ ...destForm, rating: +e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Image URL</label>
                  <input type="url" value={destForm.image} onChange={(e) => setDestForm({ ...destForm, image: e.target.value })}
                    placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Description *</label>
                  <textarea rows={3} required value={destForm.description} onChange={(e) => setDestForm({ ...destForm, description: e.target.value })}
                    placeholder="Describe the destination..." className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Highlights (comma-separated)</label>
                  <input type="text" value={destForm.highlights} onChange={(e) => setDestForm({ ...destForm, highlights: e.target.value })}
                    placeholder="Baga Beach, Old Goa Churches" className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-transparent text-sm outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
                    <input type="checkbox" checked={destForm.featured} onChange={(e) => setDestForm({ ...destForm, featured: e.target.checked })} className="rounded" />
                    Featured (show on homepage)
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  {editingDest ? "Update" : "Add Destination"}
                </button>
                <button type="button" onClick={() => setShowDestModal(false)} className="px-6 py-3 rounded-xl font-bold text-sm border border-border hover:bg-muted transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
