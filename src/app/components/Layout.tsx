import { Outlet, useLocation } from "react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";
import { FloatingButtons } from "./FloatingButtons";

export function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col font-[Inter,system-ui,sans-serif]">
      <ScrollToTop />
      <Navbar />
      <main className={`flex-1 ${isHome ? "" : "pt-[72px]"}`}>
        <Outlet />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}
