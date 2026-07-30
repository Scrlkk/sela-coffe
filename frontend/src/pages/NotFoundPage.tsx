import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coffee, ArrowLeft, Home } from "lucide-react";

const APP_NAME = import.meta.env.VITE_APP_NAME || "Sela Coffee";
const APP_VERSION = import.meta.env.VITE_APP_VERSION || "v2.1";

export default function NotFoundPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleRedirect = () => {
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 relative selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-md flex flex-col items-center my-auto py-6">
        <div className="flex flex-col items-center mb-8 text-center">
          {/* App Icon */}
          <div className="relative">
            <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-primary/20 ring-4 ring-card transition-transform hover:scale-105 duration-300">
              <Coffee className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="absolute -top-1 -right-2 bg-secondary text-secondary-foreground font-black text-xs px-2 py-0.5 rounded-full shadow-md font-mono border border-border">
              404
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Halaman Tidak Ditemukan
          </h1>

          {/* Description */}
          <p className="text-sm text-muted-foreground mt-1.5 font-medium max-w-sm">
            Maaf, menu atau halaman yang Anda tuju tidak dapat ditemukan.
          </p>
        </div>

        {/* Card Container */}
        <Card className="w-full max-w-md bg-card border-border rounded-3xl shadow-xl p-4 sm:p-6 text-center space-y-4">
          <CardContent className="pt-2 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Silakan kembali ke dashboard atau halaman login untuk melanjutkan
              aktivitas POS.
            </p>
            <Button
              onClick={handleRedirect}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-12 text-sm font-semibold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              {token ? (
                <>
                  <Home className="w-4 h-4" />
                  Kembali ke Dashboard
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Halaman Login
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <footer className="mt-8 text-center text-xs text-muted-foreground font-medium tracking-wide">
          {APP_NAME} POS & Inventory {APP_VERSION} · © 2026 {APP_NAME}
        </footer>
      </div>
    </main>
  );
}
