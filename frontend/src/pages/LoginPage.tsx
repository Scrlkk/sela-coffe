import { Coffee } from "lucide-react";
import { LoginForm } from "@/components/shared/LoginForm";

const APP_NAME = import.meta.env.VITE_APP_NAME || "Sela Coffee";
const APP_VERSION = import.meta.env.VITE_APP_VERSION || "v2.1";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 relative selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-md flex flex-col items-center my-auto py-6">
        <div className="flex flex-col items-center mb-8 text-center">
          {/* App Icon */}
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-primary/20 ring-4 ring-card transition-transform hover:scale-105 duration-300">
            <Coffee className="w-8 h-8 text-primary-foreground" />
          </div>

          {/* App Name */}
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {APP_NAME}
          </h1>

          {/* App Description */}
          <p className="text-sm text-muted-foreground mt-1.5 font-medium">
            Log in to your POS & inventory dashboard
          </p>
        </div>

        <LoginForm />

        <footer className="mt-8 text-center text-xs text-muted-foreground font-medium tracking-wide">
          {APP_NAME} POS & Inventory {APP_VERSION} · © 2026 {APP_NAME}
        </footer>
      </div>
    </main>
  );
}
