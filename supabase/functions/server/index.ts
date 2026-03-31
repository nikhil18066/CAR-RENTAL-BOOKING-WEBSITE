// @ts-ignore: npm: imports are resolved by Deno runtime
import { Hono } from "npm:hono";
// @ts-ignore: npm: imports are resolved by Deno runtime
import { cors } from "npm:hono/cors";
// @ts-ignore: npm: imports are resolved by Deno runtime
import { logger } from "npm:hono/logger";
// @ts-ignore: npm: imports are resolved by Deno runtime
import { sign, verify } from "npm:hono/jwt";
import * as kv from "./kv_store.ts";

declare const Deno: { serve: (handler: any) => void; env: { get(key: string): string } };

const app = new Hono();

app.use("*", logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

const PREFIX = "/make-server-0a81263d";

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "fallback-super-secret-key-for-dev";

// Middleware to protect admin routes
const authMiddleware = async (c: any, next: any) => {
  const token = c.req.header("X-Admin-Token");
  if (!token) {
    return c.json({ error: "Unauthorized - Missing Admin Token" }, 401);
  }
  try {
    const payload = await verify(token, JWT_SECRET, "HS256");
    if (payload.role !== "admin") throw new Error("Not an admin");
    await next();
  } catch (err) {
    return c.json({ error: "Unauthorized - Invalid Token" }, 401);
  }
};

// Input sanitization helper
const sanitize = (str: string): string =>
  str.trim().replace(/<[^>]*>/g, "").substring(0, 500);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s-]{10,15}$/;

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["pending", "cancelled"],
  cancelled: ["pending"],
};

// Health check
app.get(`${PREFIX}/health`, (c: any) => c.json({ status: "ok" }));

// ============ SEED DATA ============
app.post(`${PREFIX}/seed`, async (c: any) => {
  try {
    // Admin credentials
    await kv.del("admin:admin");
    await kv.set("admin:shreeganesh_admin", { password: "Admin@Secure2026!", role: "admin" });

    const existing = await kv.get("vehicles_index");
    if (existing && Array.isArray(existing) && existing.length > 0) {
      return c.json({ message: "Admin updated. Data already seeded" });
    }

    const vehicles = [
      {
        id: "v1",
        name: "Swift Dzire",
        type: "Sedan",
        seats: 4,
        luggage: 2,
        ac: true,
        fuelType: "Petrol/Diesel",
        pricePerKm: 12,
        pricePerDay: 2500,
        image: "https://images.unsplash.com/photo-1758794580187-fe31bac5eaae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNlZGFuJTIwY2FyJTIwcmVudGFsfGVufDF8fHx8MTc3MzA3NzcxNXww&ixlib=rb-4.1.0&q=80&w=1080",
        description: "Perfect for city travel and short trips. Comfortable sedan with AC and ample boot space.",
        features: ["AC", "Music System", "GPS Navigation", "First Aid Kit"],
        available: true,
      },
      {
        id: "v2",
        name: "Toyota Innova Crysta",
        type: "SUV",
        seats: 7,
        luggage: 4,
        ac: true,
        fuelType: "Diesel",
        pricePerKm: 18,
        pricePerDay: 4500,
        image: "https://images.unsplash.com/photo-1767749995450-7b63ab7cd4fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMFNVViUyMGx1eHVyeSUyMHZlaGljbGV8ZW58MXx8fHwxNzczMDU2MjE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
        description: "Spacious and luxurious SUV ideal for family trips and long-distance travel.",
        features: ["AC", "Music System", "GPS", "Reclining Seats", "Charging Ports"],
        available: true,
      },
      {
        id: "v3",
        name: "Tempo Traveller",
        type: "Minibus",
        seats: 12,
        luggage: 8,
        ac: true,
        fuelType: "Diesel",
        pricePerKm: 25,
        pricePerDay: 7000,
        image: "https://images.unsplash.com/photo-1748215210939-ad8b6c8c086d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3lvdGElMjBpbm5vdmElMjBtaW5pdmFuJTIwaW5kaWF8ZW58MXx8fHwxNzczMDc3NzE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        description: "Perfect for group travel. Spacious minibus with push-back seats and entertainment system.",
        features: ["AC", "Push-back Seats", "LCD TV", "Music System", "Curtains"],
        available: true,
      },
      {
        id: "v4",
        name: "Luxury Coach Bus",
        type: "Bus",
        seats: 40,
        luggage: 20,
        ac: true,
        fuelType: "Diesel",
        pricePerKm: 45,
        pricePerDay: 15000,
        image: "https://images.unsplash.com/photo-1538391912490-304338a7f94c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBidXMlMjB0cmF2ZWwlMjBjb2FjaHxlbnwxfHx8fDE3NzMwNzc3MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        description: "Full-size luxury coach for corporate events, weddings, and large group tours.",
        features: ["AC", "Reclining Seats", "Entertainment System", "Restroom", "WiFi"],
        available: true,
      },
      {
        id: "v5",
        name: "Maruti Alto",
        type: "Hatchback",
        seats: 4,
        luggage: 1,
        ac: true,
        fuelType: "Petrol",
        pricePerKm: 9,
        pricePerDay: 1800,
        image: "https://images.unsplash.com/photo-1761320121830-0bae7d4649cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYWN0JTIwaGF0Y2hiYWNrJTIwY2FyJTIwY2l0eXxlbnwxfHx8fDE3NzMwNzc3MjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        description: "Budget-friendly compact car, perfect for solo travelers or couples on city trips.",
        features: ["AC", "Music System", "Power Steering"],
        available: true,
      },
      {
        id: "v6",
        name: "Honda City",
        type: "Premium Sedan",
        seats: 4,
        luggage: 3,
        ac: true,
        fuelType: "Petrol/Diesel",
        pricePerKm: 15,
        pricePerDay: 3500,
        image: "https://images.unsplash.com/photo-1771210353591-20006eba7ad7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwc2VkYW4lMjBleGVjdXRpdmUlMjBjYXJ8ZW58MXx8fHwxNzczMDc3NzIwfDA&ixlib=rb-4.1.0&q=80&w=1080",
        description: "Premium sedan for executive travel. Superior comfort and refined driving experience.",
        features: ["AC", "Leather Seats", "Sunroof", "GPS Navigation", "Bluetooth"],
        available: true,
      },
    ];

    // Batch write vehicles
    const vehicleKeys = vehicles.map((v) => `vehicle:${v.id}`);
    const vehicleIds = vehicles.map((v) => v.id);
    await kv.mset(vehicleKeys, vehicles);
    await kv.set("vehicles_index", vehicleIds);

    const reviews = [
      {
        id: "r1",
        name: "Rajesh Kumar",
        rating: 5,
        comment: "Excellent service! The car was spotless and the driver was very professional. Highly recommend for family trips.",
        avatar: "https://images.unsplash.com/photo-1595956936239-4cad0fa009e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGN1c3RvbWVyJTIwcG9ydHJhaXQlMjB0ZXN0aW1vbmlhbHxlbnwxfHx8fDE3NzMwNzc3MTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        date: "2026-02-15",
      },
      {
        id: "r2",
        name: "Priya Sharma",
        rating: 5,
        comment: "Booked the Innova for our Goa trip. Everything was seamless from booking to drop-off. Will definitely use again!",
        avatar: "https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczMDI4OTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        date: "2026-01-28",
      },
      {
        id: "r3",
        name: "Amit Patel",
        rating: 4,
        comment: "Great value for money. The tempo traveller was perfect for our office team outing. Comfortable ride throughout.",
        avatar: "https://images.unsplash.com/photo-1762708590808-c453c0e4fb0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0JTIwY2FzdWFsJTIwc21pbGluZ3xlbnwxfHx8fDE3NzMwNzYzODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        date: "2026-03-01",
      },
    ];

    // Batch write reviews
    const reviewKeys = reviews.map((r) => `review:${r.id}`);
    const reviewIds = reviews.map((r) => r.id);
    await kv.mset(reviewKeys, reviews);
    await kv.set("reviews_index", reviewIds);

    // Seed destinations
    const destinations = [
      {
        id: "d1",
        name: "Goa",
        tagline: "Beaches & Nightlife",
        image: "https://images.unsplash.com/photo-1766162689608-b14a572cf9d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHb2ElMjBiZWFjaCUyMHRyb3BpY2FsJTIwZGVzdGluYXRpb258ZW58MXx8fHwxNzczMDc3NzE3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        price: 4500,
        duration: "2-3 days",
        rating: 4.8,
        highlights: ["Baga Beach", "Old Goa Churches", "Dudhsagar Falls", "Night Markets"],
        description: "Discover the vibrant beaches, Portuguese heritage, and amazing nightlife of Goa. Perfect for couples, friends, and families.",
        category: "beach",
        featured: true,
      },
      {
        id: "d2",
        name: "Manali",
        tagline: "Mountains & Adventure",
        image: "https://images.unsplash.com/photo-1685795361575-413e869d744b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNYW5hbGklMjBtb3VudGFpbnMlMjBoaWxsJTIwc3RhdGlvbnxlbnwxfHx8fDE3NzMwNzc3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        price: 8000,
        duration: "4-5 days",
        rating: 4.9,
        highlights: ["Rohtang Pass", "Solang Valley", "Hadimba Temple", "Old Manali"],
        description: "Experience the breathtaking beauty of the Himalayas. Adventure sports, scenic valleys, and serene landscapes await you.",
        category: "mountain",
        featured: true,
      },
      {
        id: "d3",
        name: "Rajasthan",
        tagline: "Heritage & Culture",
        image: "https://images.unsplash.com/photo-1713682995521-22ec819b50ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxSYWphc3RoYW4lMjBwYWxhY2UlMjBkZXNlcnR8ZW58MXx8fHwxNzczMDc3NzE4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        price: 6500,
        duration: "5-7 days",
        rating: 4.7,
        highlights: ["Jaipur Hawa Mahal", "Udaipur Lakes", "Jaisalmer Desert Safari", "Jodhpur Fort"],
        description: "Step into the royal heritage of Rajasthan. Majestic forts, vibrant culture, and golden deserts create an unforgettable experience.",
        category: "heritage",
        featured: true,
      },
      {
        id: "d4",
        name: "Kerala",
        tagline: "Backwaters & Nature",
        image: "https://images.unsplash.com/photo-1707893013488-51672ef83425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLZXJhbGElMjBiYWNrd2F0ZXJzJTIwaG91c2Vib2F0fGVufDF8fHx8MTc3Mjk4MjY3Nnww&ixlib=rb-4.1.0&q=80&w=1080",
        price: 7000,
        duration: "4-6 days",
        rating: 4.9,
        highlights: ["Alleppey Houseboat", "Munnar Tea Gardens", "Kovalam Beach", "Periyar Wildlife"],
        description: "God's Own Country awaits. Lush green landscapes, tranquil backwaters, and pristine beaches make Kerala a paradise.",
        category: "nature",
        featured: true,
      },
      {
        id: "d5",
        name: "Shimla",
        tagline: "Colonial Charm & Snow",
        image: "https://images.unsplash.com/photo-1769685369460-29716f92fd80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaGltbGElMjBoaWxsJTIwc3RhdGlvbiUyMG1vdW50YWlucyUyMHNub3d8ZW58MXx8fHwxNzczMTQwMzY3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        price: 5500,
        duration: "3-4 days",
        rating: 4.6,
        highlights: ["Mall Road", "Jakhoo Temple", "Kufri", "Toy Train"],
        description: "The Queen of Hills awaits with colonial architecture, pine forests, and stunning mountain views.",
        category: "mountain",
        featured: false,
      },
      {
        id: "d6",
        name: "Agra",
        tagline: "Wonder of the World",
        image: "https://images.unsplash.com/photo-1671375159307-960b2e7fabc7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZ3JhJTIwVGFqJTIwTWFoYWwlMjBtb251bWVudCUyMEluZGlhfGVufDF8fHx8MTc3MzE0MDM3MHww&ixlib=rb-4.1.0&q=80&w=1080",
        price: 3500,
        duration: "1-2 days",
        rating: 4.8,
        highlights: ["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Mehtab Bagh"],
        description: "Visit the iconic Taj Mahal and explore the rich Mughal heritage of Agra. A must-visit destination for every traveler.",
        category: "heritage",
        featured: false,
      },
      {
        id: "d7",
        name: "Ladakh",
        tagline: "Land of High Passes",
        image: "https://images.unsplash.com/photo-1731317607718-9885dd942730?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMYWRha2glMjBtb3VudGFpbnMlMjBsYW5kc2NhcGUlMjBhZHZlbnR1cmV8ZW58MXx8fHwxNzczMTQwMzY5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        price: 12000,
        duration: "7-10 days",
        rating: 4.9,
        highlights: ["Pangong Lake", "Nubra Valley", "Khardung La", "Leh Palace"],
        description: "The ultimate adventure destination. Dramatic landscapes, crystal-clear lakes, and ancient monasteries in the Himalayas.",
        category: "adventure",
        featured: false,
      },
      {
        id: "d8",
        name: "Ooty",
        tagline: "Queen of Nilgiris",
        image: "https://images.unsplash.com/photo-1623648919321-30c07d2084ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxPb3R5JTIwdGVhJTIwcGxhbnRhdGlvbnMlMjBncmVlbiUyMGhpbGxzfGVufDF8fHx8MTc3MzE0MDM2OHww&ixlib=rb-4.1.0&q=80&w=1080",
        price: 5000,
        duration: "3-4 days",
        rating: 4.5,
        highlights: ["Botanical Garden", "Ooty Lake", "Nilgiri Mountain Railway", "Doddabetta Peak"],
        description: "Escape to the lush green tea plantations and misty hills of Ooty. Perfect for a peaceful retreat.",
        category: "nature",
        featured: false,
      },
    ];

    const destKeys = destinations.map((d) => `destination:${d.id}`);
    const destIds = destinations.map((d) => d.id);
    await kv.mset(destKeys, destinations);
    await kv.set("destinations_index", destIds);

    return c.json({ message: "Seed data created successfully" });
  } catch (error) {
    console.log("Seed error:", error);
    return c.json({ error: `Seed failed: ${error}` }, 500);
  }
});

// ============ VEHICLES ============
app.get(`${PREFIX}/vehicles`, async (c: any) => {
  try {
    const index = await kv.get("vehicles_index");
    if (!index || index.length === 0) return c.json([]);
    const keys = index.map((id: string) => `vehicle:${id}`);
    const vehicles = await kv.mget(keys);
    return c.json(vehicles.filter(Boolean));
  } catch (error) {
    console.log("Get vehicles error:", error);
    return c.json({ error: `Failed to get vehicles: ${error}` }, 500);
  }
});

app.get(`${PREFIX}/vehicles/:id`, async (c: any) => {
  try {
    const id = c.req.param("id");
    const vehicle = await kv.get(`vehicle:${id}`);
    if (!vehicle) return c.json({ error: "Vehicle not found" }, 404);
    return c.json(vehicle);
  } catch (error) {
    console.log("Get vehicle error:", error);
    return c.json({ error: `Failed to get vehicle: ${error}` }, 500);
  }
});

app.post(`${PREFIX}/vehicles`, authMiddleware, async (c: any) => {
  try {
    const body = await c.req.json();
    const id = `v${Date.now()}`;
    const vehicle = { ...body, id };
    await kv.set(`vehicle:${id}`, vehicle);
    const index = (await kv.get("vehicles_index")) || [];
    index.push(id);
    await kv.set("vehicles_index", index);
    return c.json(vehicle, 201);
  } catch (error) {
    console.log("Create vehicle error:", error);
    return c.json({ error: `Failed to create vehicle: ${error}` }, 500);
  }
});

app.put(`${PREFIX}/vehicles/:id`, authMiddleware, async (c: any) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`vehicle:${id}`);
    if (!existing) return c.json({ error: "Vehicle not found" }, 404);
    const updated = { ...existing, ...body, id };
    await kv.set(`vehicle:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.log("Update vehicle error:", error);
    return c.json({ error: `Failed to update vehicle: ${error}` }, 500);
  }
});

app.delete(`${PREFIX}/vehicles/:id`, authMiddleware, async (c: any) => {
  try {
    const id = c.req.param("id");
    await kv.del(`vehicle:${id}`);
    const index = (await kv.get("vehicles_index")) || [];
    const newIndex = index.filter((vid: string) => vid !== id);
    await kv.set("vehicles_index", newIndex);
    return c.json({ message: "Vehicle deleted" });
  } catch (error) {
    console.log("Delete vehicle error:", error);
    return c.json({ error: `Failed to delete vehicle: ${error}` }, 500);
  }
});

// ============ BOOKINGS ============
app.get(`${PREFIX}/bookings`, async (c: any) => {
  try {
    const index = (await kv.get("bookings_index")) || [];
    if (index.length === 0) return c.json([]);
    const keys = index.map((id: string) => `booking:${id}`);
    const bookings = await kv.mget(keys);
    return c.json(bookings.filter(Boolean));
  } catch (error) {
    console.log("Get bookings error:", error);
    return c.json({ error: `Failed to get bookings: ${error}` }, 500);
  }
});

app.post(`${PREFIX}/bookings`, async (c: any) => {
  try {
    const body = await c.req.json();
    const errors: Record<string, string> = {};

    // Required field checks
    const requiredFields = ["customerName", "email", "phone", "pickupLocation", "destination", "vehicleType", "travelDate"];
    for (const field of requiredFields) {
      if (!body[field] || (typeof body[field] === "string" && body[field].trim().length === 0)) {
        errors[field] = `${field} is required`;
      }
    }

    // Format checks
    if (body.email && !EMAIL_RE.test(body.email)) {
      errors.email = "Invalid email format";
    }
    if (body.phone && !PHONE_RE.test(body.phone.replace(/\s/g, ""))) {
      errors.phone = "Invalid phone number (10-15 digits required)";
    }
    if (body.customerName && body.customerName.trim().length < 2) {
      errors.customerName = "Name must be at least 2 characters";
    }
    if (body.pickupLocation && body.pickupLocation.trim().length < 2) {
      errors.pickupLocation = "Pickup location must be at least 2 characters";
    }
    if (body.destination && body.destination.trim().length < 2) {
      errors.destination = "Destination must be at least 2 characters";
    }

    // Date validation
    if (body.travelDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const travelDate = new Date(body.travelDate + "T00:00:00");
      if (isNaN(travelDate.getTime())) {
        errors.travelDate = "Invalid travel date format";
      } else if (travelDate < today) {
        errors.travelDate = "Travel date cannot be in the past";
      }
    }
    if (body.returnDate) {
      const returnDate = new Date(body.returnDate + "T00:00:00");
      const travelDate = new Date((body.travelDate || "") + "T00:00:00");
      if (isNaN(returnDate.getTime())) {
        errors.returnDate = "Invalid return date format";
      } else if (!isNaN(travelDate.getTime()) && returnDate < travelDate) {
        errors.returnDate = "Return date must be on or after travel date";
      }
    }

    // Passengers range
    const passengers = parseInt(body.passengers) || 1;
    if (passengers < 1 || passengers > 50) {
      errors.passengers = "Passengers must be between 1 and 50";
    }

    // Valid vehicle types
    const validVehicleTypes = ["Hatchback", "Sedan", "Premium Sedan", "SUV", "Minibus", "Bus"];
    if (body.vehicleType && !validVehicleTypes.includes(body.vehicleType)) {
      errors.vehicleType = "Invalid vehicle type";
    }

    if (Object.keys(errors).length > 0) {
      return c.json({ error: "Validation failed", fields: errors }, 400);
    }

    // Sanitize and build booking
    const id = `b${Date.now()}`;
    const booking = {
      customerName: sanitize(body.customerName),
      email: sanitize(body.email).toLowerCase(),
      phone: sanitize(body.phone),
      pickupLocation: sanitize(body.pickupLocation),
      destination: sanitize(body.destination),
      vehicleType: body.vehicleType,
      vehicleName: body.vehicleName ? sanitize(body.vehicleName) : "",
      travelDate: body.travelDate,
      returnDate: body.returnDate || "",
      passengers,
      id,
      status: "pending",
      createdAt: new Date().toISOString(),
      statusHistory: [{ status: "pending", at: new Date().toISOString() }],
    };
    await kv.set(`booking:${id}`, booking);
    const index = (await kv.get("bookings_index")) || [];
    index.push(id);
    await kv.set("bookings_index", index);
    return c.json(booking, 201);
  } catch (error) {
    console.log("Create booking error:", error);
    return c.json({ error: `Failed to create booking: ${error}` }, 500);
  }
});

app.put(`${PREFIX}/bookings/:id`, authMiddleware, async (c: any) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`booking:${id}`);
    if (!existing) return c.json({ error: "Booking not found" }, 404);

    // Status transition validation
    if (body.status) {
      const currentStatus = existing.status || "pending";
      const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
      if (!allowedTransitions.includes(body.status)) {
        return c.json({
          error: `Cannot change status from '${currentStatus}' to '${body.status}'`,
          allowed: allowedTransitions,
        }, 400);
      }
    }

    // Build statusHistory audit trail
    const history = existing.statusHistory || [];
    if (body.status && body.status !== existing.status) {
      history.push({ status: body.status, at: new Date().toISOString(), previousStatus: existing.status });
    }

    const updated = { ...existing, ...body, statusHistory: history };
    await kv.set(`booking:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.log("Update booking error:", error);
    return c.json({ error: `Failed to update booking: ${error}` }, 500);
  }
});

// ============ REVIEWS ============
app.get(`${PREFIX}/reviews`, async (c: any) => {
  try {
    const index = (await kv.get("reviews_index")) || [];
    if (index.length === 0) return c.json([]);
    const keys = index.map((id: string) => `review:${id}`);
    const reviews = await kv.mget(keys);
    return c.json(reviews.filter(Boolean));
  } catch (error) {
    console.log("Get reviews error:", error);
    return c.json({ error: `Failed to get reviews: ${error}` }, 500);
  }
});

app.post(`${PREFIX}/reviews`, async (c: any) => {
  try {
    const body = await c.req.json();
    const id = `r${Date.now()}`;
    const review = { ...body, id, date: new Date().toISOString().split("T")[0] };
    await kv.set(`review:${id}`, review);
    const index = (await kv.get("reviews_index")) || [];
    index.push(id);
    await kv.set("reviews_index", index);
    return c.json(review, 201);
  } catch (error) {
    console.log("Create review error:", error);
    return c.json({ error: `Failed to create review: ${error}` }, 500);
  }
});

// ============ CONTACT ============
app.post(`${PREFIX}/contact`, async (c: any) => {
  try {
    const body = await c.req.json();
    const id = `c${Date.now()}`;
    const contact = { ...body, id, createdAt: new Date().toISOString() };
    await kv.set(`contact:${id}`, contact);
    const index = (await kv.get("contacts_index")) || [];
    index.push(id);
    await kv.set("contacts_index", index);
    return c.json({ message: "Message sent successfully" }, 201);
  } catch (error) {
    console.log("Contact error:", error);
    return c.json({ error: `Failed to send message: ${error}` }, 500);
  }
});

// ============ DESTINATIONS ============
app.get(`${PREFIX}/destinations`, async (c: any) => {
  try {
    const index = (await kv.get("destinations_index")) || [];
    if (index.length === 0) return c.json([]);
    const keys = index.map((id: string) => `destination:${id}`);
    const destinations = await kv.mget(keys);
    return c.json(destinations.filter(Boolean));
  } catch (error) {
    console.log("Get destinations error:", error);
    return c.json({ error: `Failed to get destinations: ${error}` }, 500);
  }
});

app.get(`${PREFIX}/destinations/:id`, async (c: any) => {
  try {
    const id = c.req.param("id");
    const destination = await kv.get(`destination:${id}`);
    if (!destination) return c.json({ error: "Destination not found" }, 404);
    return c.json(destination);
  } catch (error) {
    console.log("Get destination error:", error);
    return c.json({ error: `Failed to get destination: ${error}` }, 500);
  }
});

app.post(`${PREFIX}/destinations`, authMiddleware, async (c: any) => {
  try {
    const body = await c.req.json();
    const id = `d${Date.now()}`;
    const destination = { ...body, id };
    await kv.set(`destination:${id}`, destination);
    const index = (await kv.get("destinations_index")) || [];
    index.push(id);
    await kv.set("destinations_index", index);
    return c.json(destination, 201);
  } catch (error) {
    console.log("Create destination error:", error);
    return c.json({ error: `Failed to create destination: ${error}` }, 500);
  }
});

app.put(`${PREFIX}/destinations/:id`, authMiddleware, async (c: any) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`destination:${id}`);
    if (!existing) return c.json({ error: "Destination not found" }, 404);
    const updated = { ...existing, ...body, id };
    await kv.set(`destination:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.log("Update destination error:", error);
    return c.json({ error: `Failed to update destination: ${error}` }, 500);
  }
});

app.delete(`${PREFIX}/destinations/:id`, authMiddleware, async (c: any) => {
  try {
    const id = c.req.param("id");
    await kv.del(`destination:${id}`);
    const index = (await kv.get("destinations_index")) || [];
    const newIndex = index.filter((did: string) => did !== id);
    await kv.set("destinations_index", newIndex);
    return c.json({ message: "Destination deleted" });
  } catch (error) {
    console.log("Delete destination error:", error);
    return c.json({ error: `Failed to delete destination: ${error}` }, 500);
  }
});

// ============ ADMIN AUTH ============
app.post(`${PREFIX}/admin/login`, async (c: any) => {
  try {
    const { username, password } = await c.req.json();
    const admin = await kv.get(`admin:${username}`);
    if (!admin || admin.password !== password) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    const token = await sign({ username, role: admin.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, JWT_SECRET);
    return c.json({ token, username, role: admin.role });
  } catch (error) {
    console.log("Admin login error:", error);
    return c.json({ error: `Login failed: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);
