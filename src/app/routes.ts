import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/HomePage";
import { FleetPage } from "./components/FleetPage";
import { VehicleDetailPage } from "./components/VehicleDetailPage";
import { DestinationsPage } from "./components/DestinationsPage";
import { BookingPage } from "./components/BookingPage";
import { ContactPage } from "./components/ContactPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { NotFoundPage } from "./components/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "fleet", Component: FleetPage },
      { path: "fleet/:id", Component: VehicleDetailPage },
      { path: "destinations", Component: DestinationsPage },
      { path: "book", Component: BookingPage },
      { path: "contact", Component: ContactPage },
      { path: "admin", Component: AdminDashboard },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);