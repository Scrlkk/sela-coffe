import React, { useState, useRef, useEffect } from "react";
import type { SupplierItem } from "@/services/supplier";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Truck, Pencil } from "lucide-react";

interface SupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: SupplierItem | null;
  onSave: (supplierData: Omit<SupplierItem, "id">) => void;
}

export const SupplierDialog: React.FC<SupplierDialogProps> = ({
  isOpen,
  onClose,
  supplier,
  onSave,
}) => {
  const [name, setName] = useState(supplier?.name ?? "");
  const [contactPerson, setContactPerson] = useState(
    supplier?.contactPerson ?? "",
  );
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [email, setEmail] = useState(supplier?.email ?? "");
  const [address, setAddress] = useState(supplier?.address ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [prevSupplier, setPrevSupplier] = useState<SupplierItem | null>(null);
  const [prevOpen, setPrevOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (isOpen !== prevOpen || supplier !== prevSupplier) {
    setPrevOpen(isOpen);
    setPrevSupplier(supplier);
    setName(supplier?.name ?? "");
    setContactPerson(supplier?.contactPerson ?? "");
    setPhone(supplier?.phone ?? "");
    setEmail(supplier?.email ?? "");
    setAddress(supplier?.address ?? "");
    setErrors({});
  }

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120,
      )}px`;
    }
  }, [address, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Supplier name is required";
    if (!contactPerson.trim())
      errs.contactPerson = "Contact person is required";
    if (!phone.trim()) errs.phone = "Phone number is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
    >
      <Card className="border-border/60 shadow-xl rounded-2xl sm:rounded-3xl bg-card text-card-foreground max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 sm:pb-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {supplier ? (
                  <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {supplier ? "Edit Supplier" : "Add New Supplier"}
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  {supplier
                    ? "Update supplier information for Sela Coffee"
                    : "Fill in the details for partner supplier"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <Label
                htmlFor="name"
                className="text-xs font-bold text-foreground"
              >
                Company / Supplier Name{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Example: PT Sangkar Kopi Utama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`h-8.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold focus-visible:ring-primary ${
                  errors.name ? "border-destructive" : ""
                }`}
              />
              {errors.name && (
                <p className="text-[11px] text-destructive mt-0.5 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor="contactPerson"
                  className="text-xs font-bold text-foreground"
                >
                  Contact Person <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactPerson"
                  placeholder="Mr. Ahmad"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className={`h-8.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold focus-visible:ring-primary ${
                    errors.contactPerson ? "border-destructive" : ""
                  }`}
                />
                {errors.contactPerson && (
                  <p className="text-[11px] text-destructive mt-0.5 font-medium">
                    {errors.contactPerson}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="phone"
                  className="text-xs font-bold text-foreground"
                >
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`h-8.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold focus-visible:ring-primary ${
                    errors.phone ? "border-destructive" : ""
                  }`}
                />
                {errors.phone && (
                  <p className="text-[11px] text-destructive mt-0.5 font-medium">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-foreground"
              >
                Email Address{" "}
                <span className="text-muted-foreground font-normal">
                  (Optional)
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="supplier@kopi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="address"
                className="text-xs font-bold text-foreground"
              >
                Full Address{" "}
                <span className="text-muted-foreground font-normal">
                  (Optional)
                </span>
              </Label>
              <Textarea
                ref={textareaRef}
                id="address"
                placeholder="Office or warehouse address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={1}
                className="min-h-10 max-h-30 text-xs sm:text-sm font-semibold leading-relaxed transition-all overflow-y-auto"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-2 sm:pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-9 sm:h-11 rounded-full border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 sm:h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-all active:scale-[0.99] cursor-pointer"
              >
                {supplier ? "Save Changes" : "Add Supplier"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
