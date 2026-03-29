import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0a81263d`;

const defaultHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${publicAnonKey}`,
};

async function request(path: string, options?: RequestInit, retries = 2): Promise<any> {
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const headers: Record<string, string> = { ...defaultHeaders };
  if (adminToken) {
    headers["X-Admin-Token"] = adminToken;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: { ...headers, ...options?.headers },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        console.error(`API error ${path} (status ${res.status}):`, err);
        throw new Error(err.error || `Request failed with status ${res.status}`);
      }
      return await res.json();
    } catch (error: any) {
      const isNetworkError = error?.message === "Failed to fetch" || error?.name === "TypeError";
      if (isNetworkError && attempt < retries) {
        console.warn(`Retrying ${path} (attempt ${attempt + 1}/${retries})...`);
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
}

let seeded = false;

async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  try {
    await request("/seed", { method: "POST" });
    seeded = true;
  } catch (err) {
    console.warn("Seed call failed (may already be seeded):", err);
    seeded = true;
  }
}

export const api = {
  seed: ensureSeeded,

  getVehicles: async () => {
    await ensureSeeded();
    return request("/vehicles");
  },
  getVehicle: async (id: string) => {
    await ensureSeeded();
    return request(`/vehicles/${id}`);
  },
  createVehicle: (data: any) => request("/vehicles", { method: "POST", body: JSON.stringify(data) }),
  updateVehicle: (id: string, data: any) => request(`/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteVehicle: (id: string) => request(`/vehicles/${id}`, { method: "DELETE" }),

  getBookings: async () => {
    await ensureSeeded();
    return request("/bookings");
  },
  createBooking: (data: any) => request("/bookings", { method: "POST", body: JSON.stringify(data) }),
  updateBooking: (id: string, data: any) => request(`/bookings/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  getReviews: async () => {
    await ensureSeeded();
    return request("/reviews");
  },
  createReview: (data: any) => request("/reviews", { method: "POST", body: JSON.stringify(data) }),

  getDestinations: async () => {
    await ensureSeeded();
    return request("/destinations");
  },
  getDestination: async (id: string) => {
    await ensureSeeded();
    return request(`/destinations/${id}`);
  },
  createDestination: (data: any) => request("/destinations", { method: "POST", body: JSON.stringify(data) }),
  updateDestination: (id: string, data: any) => request(`/destinations/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDestination: (id: string) => request(`/destinations/${id}`, { method: "DELETE" }),

  sendContact: (data: any) => request("/contact", { method: "POST", body: JSON.stringify(data) }),

  adminLogin: async (username: string, password: string) => {
    await ensureSeeded();
    return request("/admin/login", { method: "POST", body: JSON.stringify({ username, password }) });
  },
};

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  seats: number;
  luggage: number;
  ac: boolean;
  fuelType: string;
  pricePerKm: number;
  pricePerDay: number;
  image: string;
  description: string;
  features: string[];
  available: boolean;
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  pickupLocation: string;
  destination: string;
  vehicleType: string;
  vehicleName?: string;
  travelDate: string;
  returnDate?: string;
  passengers: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  avatar: string;
  date: string;
}

export interface Destination {
  id: string;
  name: string;
  tagline: string;
  image: string;
  price: number;
  duration: string;
  rating: number;
  highlights: string[];
  description: string;
  category: string;
  featured: boolean;
}
