import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await authService.login({
        username,
        password,
        rememberMe,
      });
      login(token, user);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;
        setError(response?.data?.message || "Invalid username or password.");
      } else {
        setError("Invalid username or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-card border-border rounded-3xl shadow-xl p-3 sm:p-4">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-foreground font-semibold text-sm"
            >
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`bg-background/20 border-border rounded-2xl h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:border-transparent transition-all shadow-inner ${
                error ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              placeholder="Username"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-foreground font-semibold text-sm"
              >
                Password
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`bg-background/20 border-border rounded-2xl h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:border-transparent transition-all shadow-inner pr-11 ${
                  error ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg cursor-pointer select-none"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2.5">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
              />
              <Label
                htmlFor="rememberMe"
                className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
              >
                Stay signed in
              </Label>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive font-medium text-center flex items-center justify-center gap-1.5 animate-in fade-in duration-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-12 text-sm font-semibold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all duration-200"
          >
            {loading ? "Signing in..." : "Sign in to Workspace"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
