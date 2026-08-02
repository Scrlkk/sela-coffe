import { LoginForm } from "@/components/shared/LoginForm";
import { LogoLogin } from "@/components/shared/SelaLogo";

const APP_NAME = import.meta.env.VITE_APP_NAME || "Sela Coffee";
const APP_VERSION = import.meta.env.VITE_APP_VERSION || "v2.1";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-linear-to-br from-background via-background to-primary/10 text-foreground flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 relative overflow-hidden selection:bg-primary selection:text-primary-foreground">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center my-auto py-6 z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          {/* App Logo  */}
          <div className="mb-4 flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <LogoLogin className="w-20 h-20 drop-shadow-md" />
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
