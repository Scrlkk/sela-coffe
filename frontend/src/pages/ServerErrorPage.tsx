import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Home, ArrowLeft } from "lucide-react";
import { LogoLogin } from "@/components/shared/SelaLogo";
import { APP_NAME, APP_VERSION } from "@/constants/app";

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
    <main className="min-h-screen w-full bg-linear-to-br from-background via-background to-destructive/10 text-foreground flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 relative overflow-hidden selection:bg-primary selection:text-primary-foreground">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-destructive/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center my-auto py-6 z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          {/* App Logo */}
          <div className="relative mb-4 flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <LogoLogin className="w-28 h-28 sm:w-32 sm:h-32 drop-shadow-md" />
            <span className="absolute top-0 right-0 bg-destructive text-destructive-foreground font-black text-xs px-2.5 py-0.5 rounded-full shadow-md font-mono">
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
              className="w-full border-border rounded-2xl h-12 text-sm font-semibold hover:bg-muted flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang Halaman
            </Button>

            <Button
              onClick={handleRedirect}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-12 text-sm font-semibold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
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
