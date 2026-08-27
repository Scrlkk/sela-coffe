import React, { useState } from "react";
import type { UserItem } from "@/services/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Pencil,
  Shield,
  Smartphone,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
  onSave: (userData: Omit<UserItem, "id"> & { password?: string }) => void;
}

const UserForm: React.FC<{
  user: UserItem | null;
  onClose: () => void;
  onSave: (userData: Omit<UserItem, "id"> & { password?: string }) => void;
}> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [role, setRole] = useState<"ADMIN" | "CASHIER">(
    user?.role ?? "CASHIER",
  );
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!username.trim()) {
      errs.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      errs.username = "Only letters, numbers, and underscores allowed";
    }

    if (!user && !password.trim()) {
      errs.password = "Password is required for new user";
    } else if (password && password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    if (password && password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      role,
      phone: phone.trim() || undefined,
      status: user?.status ?? "ACTIVE",
      password: password.trim() || undefined,
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {user ? (
            <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
        <div className="space-y-0.5 min-w-0">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
            {user ? "Edit User Account" : "Add New User"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {user
              ? "Update account credentials and system role"
              : "Fill in account details for staff or administrator"}
          </DialogDescription>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 py-2">
        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs font-bold text-foreground">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. Ahmad Fauzi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className={cn(
              "h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold",
              errors.name && "border-destructive",
            )}
          />
          {errors.name && (
            <p className="text-[11px] text-destructive mt-0.5 font-medium">
              {errors.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div className="space-y-1">
            <Label
              htmlFor="username"
              className="text-xs font-bold text-foreground"
            >
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              placeholder="e.g. ahmad_fauzi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={cn(
                "h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold",
                errors.username && "border-destructive",
              )}
            />
            {errors.username && (
              <p className="text-[11px] text-destructive mt-0.5 font-medium">
                {errors.username}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="phone"
              className="text-xs font-bold text-foreground"
            >
              Phone Number (Optional)
            </Label>
            <div className="relative">
              <Input
                id="phone"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold pl-8.5"
              />
              <Smartphone className="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              Account Role <span className="text-destructive">*</span>
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">
              {role === "ADMIN" ? "Full Access" : "POS Access Only"}
            </span>
          </div>
          <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-xl border border-border/50 gap-1 h-11">
            <button
              type="button"
              onClick={() => setRole("ADMIN")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                role === "ADMIN"
                  ? "bg-card text-foreground shadow-xs border border-border/40 font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("CASHIER")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                role === "CASHIER"
                  ? "bg-card text-foreground shadow-xs border border-border/40 font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              <span>Cashier</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label
              htmlFor="password"
              className="text-xs font-bold text-foreground"
            >
              {user ? "Change Password (Optional)" : "Password"}{" "}
              {!user && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={
                  user ? "Leave blank to keep current" : "Min. 6 characters"
                }
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  if (!val) {
                    setConfirmPassword("");
                  }
                }}
                className={cn(
                  "h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold pl-8.5 pr-9",
                  errors.password
                    ? "border-destructive"
                    : password && password.length < 6
                      ? "border-amber-500/70 focus-visible:ring-amber-500/30"
                      : password && password.length >= 6
                        ? "border-emerald-500/70 focus-visible:ring-emerald-500/30"
                        : "",
                )}
              />
              <KeyRound className="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg cursor-pointer select-none"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {password.length > 0 && (
              <div className="pt-0.5">
                {password.length < 6 ? (
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Must be at least 6 chars ({password.length}/6)
                    </span>
                  </p>
                ) : (
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in duration-150">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Minimum length met</span>
                  </p>
                )}
              </div>
            )}
            {errors.password && !password && (
              <p className="text-[11px] text-destructive mt-0.5 font-medium">
                {errors.password}
              </p>
            )}
          </div>

          {password.length > 0 && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-bold text-foreground"
              >
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold pl-8.5 pr-9",
                    errors.confirmPassword
                      ? "border-destructive"
                      : confirmPassword && password !== confirmPassword
                        ? "border-destructive/70 focus-visible:ring-destructive/30"
                        : confirmPassword && password === confirmPassword
                          ? "border-emerald-500/70 focus-visible:ring-emerald-500/30"
                          : "",
                  )}
                />
                <KeyRound className="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg cursor-pointer select-none"
                  title={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <div className="pt-0.5">
                  {password !== confirmPassword ? (
                    <p className="text-[11px] font-semibold text-destructive flex items-center gap-1 animate-in fade-in duration-150">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Passwords do not match</span>
                    </p>
                  ) : (
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in duration-150">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Passwords match</span>
                    </p>
                  )}
                </div>
              )}
              {errors.confirmPassword && !confirmPassword && (
                <p className="text-[11px] text-destructive mt-0.5 font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 sm:pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9.5 sm:h-10 rounded-xl border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-9.5 sm:h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            {user ? "Save Changes" : "Create User"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export const UserDialog: React.FC<UserDialogProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        {isOpen && (
          <UserForm
            key={user ? user.id : "new"}
            user={user}
            onClose={onClose}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
