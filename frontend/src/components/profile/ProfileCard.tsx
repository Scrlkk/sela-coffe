import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { userService } from "@/services/user";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelaLogo } from "@/components/shared/SelaLogo";
import {
  User,
  AtSign,
  Phone,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
  Sun,
  Moon,
  Coffee,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/formatString";

export const ProfileCard: React.FC = () => {
  const { user, login, token } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    userService
      .getProfile()
      .then((userData) => {
        if (userData) {
          setName(userData.name || "");
          setUsername(userData.username || "");
          setPhone(userData.phone || "");
        }
      })
      .catch(() => {});
  }, [token, login]);

  const isFormDirty =
    name !== (user?.name || "") ||
    username !== (user?.username || "") ||
    phone !== (user?.phone || "") ||
    Boolean(newPassword);

  const isPasswordLengthValid = !newPassword || newPassword.length >= 6;
  const isPasswordMatchValid = !newPassword || newPassword === confirmPassword;
  const isFormValid =
    isFormDirty && isPasswordLengthValid && isPasswordMatchValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormDirty) return;

    if (newPassword) {
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long.");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("New password confirmation does not match.");
        return;
      }
    }

    setLoading(true);
    try {
      const cleanName = name.trim();
      const cleanUsername = username.trim().replace(/^@/, "");
      const cleanPhone = phone.trim();

      const payload: {
        name?: string;
        username?: string;
        phone?: string;
        password?: string;
      } = {};

      if (cleanName) payload.name = cleanName;
      if (cleanUsername) payload.username = cleanUsername;
      if (cleanPhone !== undefined) payload.phone = cleanPhone;
      if (newPassword && newPassword.length >= 6) {
        payload.password = newPassword;
      }

      const updatedUser = await userService.updateProfile(
        user?.id || 1,
        payload,
      );

      if (token && updatedUser) {
        login(token, updatedUser);
      }

      toast.success("Profile updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const errorObj = err as {
        response?: {
          data?: {
            message?: string;
            errors?: Array<{ path: string; message: string }>;
          };
        };
      };
      const errorData = errorObj?.response?.data;
      const errMsg =
        errorData?.errors?.[0]?.message ||
        errorData?.message ||
        "Failed to update profile. Please check your inputs.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border shadow-md rounded-3xl overflow-hidden transition-colors w-full p-0">
      <div className="h-24 sm:h-32 bg-linear-to-r from-primary via-primary/95 to-secondary/80 relative overflow-hidden flex items-start justify-end p-3 sm:p-4 select-none rounded-t-3xl">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-secondary/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 right-12 w-64 h-64 bg-primary/40 rounded-full blur-3xl pointer-events-none" />
        <SelaLogo className="absolute right-4 -bottom-6 w-32 h-32 sm:w-36 sm:h-36 text-primary-foreground/10 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-bold uppercase tracking-widest shadow-xs">
          <Coffee className="w-3.5 h-3.5 text-secondary" />
          <span>Sela Coffee Employee</span>
        </div>
      </div>

      <CardContent className="p-4 sm:p-5 pt-0 relative">
        <div className="flex items-end justify-between gap-4 -mt-9 sm:-mt-18 mb-3">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary text-secondary-foreground font-black text-xl sm:text-2xl flex items-center justify-center shadow-xl border-4 border-card ring-2 ring-primary/20">
              {getInitials(name || user?.name)}
            </div>
            <span
              className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-card shadow-xs"
              title="Active Account"
            />
          </div>

          <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-2xl border border-border/60 shadow-2xs">
            <button
              onClick={() => setTheme("light")}
              type="button"
              className={cn(
                "flex items-center justify-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                theme === "light"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>

            <button
              onClick={() => setTheme("dark")}
              type="button"
              className={cn(
                "flex items-center justify-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                theme === "dark"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <div className="mb-4 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-tight">
              {name || user?.name || "Sela Cashier"}
            </h2>
            <Badge
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider shadow-2xs shrink-0 flex items-center gap-1 border-0",
                user?.role === "ADMIN"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground",
              )}
            >
              <Shield className="w-3 h-3" />
              {user?.role || "CASHIER"}
            </Badge>
          </div>

          <p className="text-xs font-semibold text-muted-foreground">
            @
            {username
              ? username.replace(/^@/, "")
              : user?.username || "username"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>User Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="profile-name"
                  className="text-xs font-bold text-foreground/90 block"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter full name"
                    className="pl-10 pr-3.5 h-10 sm:h-10.5 rounded-2xl bg-secondary/25 border-border focus-visible:ring-2 focus-visible:ring-primary/20 text-xs font-medium text-foreground placeholder:text-muted-foreground shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="profile-username"
                  className="text-xs font-bold text-foreground/90 block"
                >
                  Username
                </Label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="profile-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter username"
                    className="pl-10 pr-3.5 h-10 sm:h-10.5 rounded-2xl bg-secondary/25 border-border focus-visible:ring-2 focus-visible:ring-primary/20 text-xs font-medium text-foreground placeholder:text-muted-foreground shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="profile-phone"
                  className="text-xs font-bold text-foreground/90 block"
                >
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="profile-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 08123456789"
                    className="pl-10 pr-3.5 h-10 sm:h-10.5 rounded-2xl bg-secondary/25 border-border focus-visible:ring-2 focus-visible:ring-primary/20 text-xs font-medium text-foreground placeholder:text-muted-foreground shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border/60" />

          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Security & Password (Optional)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="profile-new-pass"
                  className="text-xs font-bold text-foreground/90 block"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="profile-new-pass"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className={cn(
                      "pl-3.5 pr-10 h-10 sm:h-10.5 rounded-2xl bg-secondary/25 border-border focus-visible:ring-2 focus-visible:ring-primary/20 text-xs font-medium text-foreground placeholder:text-muted-foreground shadow-2xs transition-all",
                      newPassword && newPassword.length < 6
                        ? "border-amber-500/70 focus-visible:ring-amber-500/30"
                        : newPassword && newPassword.length >= 6
                          ? "border-emerald-500/70 focus-visible:ring-emerald-500/30"
                          : "",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg cursor-pointer select-none"
                    title={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {newPassword.length > 0 && (
                  <div className="pt-0.5">
                    {newPassword.length < 6 ? (
                      <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 animate-in fade-in duration-150">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Must be at least 6 characters (currently{" "}
                          {newPassword.length}/6)
                        </span>
                      </p>
                    ) : (
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in duration-150">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Minimum length met ({newPassword.length} characters)
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="profile-confirm-pass"
                  className="text-xs font-bold text-foreground/90 block"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="profile-confirm-pass"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className={cn(
                      "pl-3.5 pr-10 h-10 sm:h-11 rounded-2xl bg-secondary/25 border-border focus-visible:ring-2 focus-visible:ring-primary/20 text-xs font-medium text-foreground placeholder:text-muted-foreground shadow-2xs transition-all",
                      confirmPassword && newPassword !== confirmPassword
                        ? "border-destructive/70 focus-visible:ring-destructive/30"
                        : confirmPassword && newPassword === confirmPassword
                          ? "border-emerald-500/70 focus-visible:ring-emerald-500/30"
                          : "",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg cursor-pointer select-none"
                    title={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {confirmPassword.length > 0 && (
                  <div className="pt-0.5">
                    {newPassword === confirmPassword ? (
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in duration-150">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Passwords match</span>
                      </p>
                    ) : (
                      <p className="text-[11px] font-semibold text-destructive flex items-center gap-1.5 animate-in fade-in duration-150">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Passwords do not match</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-1 pb-3 flex justify-end">
            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full sm:w-auto px-6 h-10 sm:h-10.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-2xl shadow-md shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
