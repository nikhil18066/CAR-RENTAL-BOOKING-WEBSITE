import { Link } from "react-router";
import { MapPinOff, Home, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export function NotFoundPage() {
  return (
    <div className="font-[Inter,system-ui,sans-serif] min-h-[70vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="w-28 h-28 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <MapPinOff className="h-14 w-14 text-primary" />
        </div>
        <h1 className="text-7xl font-extrabold text-foreground mb-2 font-[Plus_Jakarta_Sans,Inter,sans-serif]">404</h1>
        <h2 className="text-xl font-bold mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          Looks like you've taken a wrong turn. The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Home className="h-4 w-4" /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="border border-border px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-muted transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
