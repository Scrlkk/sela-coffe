import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

const APP_NAME = import.meta.env.VITE_APP_NAME || "Sela Coffee";
const APP_VERSION = import.meta.env.VITE_APP_VERSION || "v2.1";

export default function ServerErrorPage() {
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
            <div className="w-16 h-16 bg-destructive rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-destructive/20 ring-4 ring-card transition-transform hover:scale-105 duration-300">
              <AlertTriangle className="w-8 h-8 text-destructive-foreground" />
            </div>
            <span className="absolute -top-1 -right-2 bg-destructive text-destructive-foreground font-black text-xs px-2 py-0.5 rounded-full shadow-md font-mono">
              500
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Kesalahan Server
          </h1>

          {/* Description */}
          <p className="text-sm text-muted-foreground mt-1.5 font-medium max-w-sm">
            Mesin server sedang mengalami kendala teknis sementara.
          </p>
        </div>

        {/* Card Container */}
        <Card className="w-full max-w-md bg-card border-border rounded-3xl shadow-xl p-4 sm:p-6 text-center space-y-4">
          <CardContent className="pt-2 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Coba muat ulang halaman atau kembali ke menu utama POS.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full border-border rounded-2xl h-12 text-sm font-semibold hover:bg-muted flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang Halaman
            </Button>

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
