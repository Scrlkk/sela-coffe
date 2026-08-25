import React, { useState, useRef, useEffect } from "react";
import type { SupplierItem } from "@/services/supplier";
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
import { Textarea } from "@/components/ui/textarea";
import { Truck, Pencil } from "lucide-react";

interface SupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: SupplierItem | null;
  onSave: (supplierData: Omit<SupplierItem, "id">) => void;
}

interface SupplierFormProps {
  supplier: SupplierItem | null;
  onClose: () => void;
  onSave: (supplierData: Omit<SupplierItem, "id">) => void;
}

const SupplierDialogForm: React.FC<SupplierFormProps> = ({
  supplier,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(supplier?.name ?? "");
  const [contactPerson, setContactPerson] = useState(
    supplier?.contactPerson ?? "",
  );
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [link, setLink] = useState(supplier?.link || supplier?.email || "");
  const [address, setAddress] = useState(supplier?.address ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120,
      )}px`;
    }
  }, [address]);

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

    let formattedLink = link.trim();
    if (
      formattedLink &&
      !formattedLink.startsWith("http://") &&
      !formattedLink.startsWith("https://")
    ) {
      formattedLink = `https://${formattedLink}`;
    }

    onSave({
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      link: formattedLink || undefined,
      address: address.trim() || undefined,
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {supplier ? (
            <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
        <div className="space-y-0.5 min-w-0">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
            {supplier ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {supplier
              ? "Update supplier details & purchase link for Sela Coffee"
              : "Fill in partner supplier details and re-order store link"}
          </DialogDescription>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 py-2">
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
            required
            autoFocus
            className={`h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold ${
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
              className={`h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold ${
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
              Phone / WhatsApp <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="08123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold ${
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
            htmlFor="link"
            className="text-xs font-bold text-foreground"
          >
            Store / Purchase Link (E-Commerce / Catalog URL){" "}
            <span className="text-muted-foreground font-normal">
              (Optional)
            </span>
          </Label>
          <Input
            id="link"
            type="text"
            placeholder="e.g. https://tokopedia.com/... or https://shopee.co.id/..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold"
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
            className="min-h-10 max-h-30 text-xs sm:text-sm font-semibold leading-relaxed overflow-y-auto rounded-xl resize-none"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
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
            {supplier ? "Save Changes" : "Add Supplier"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export const SupplierDialog: React.FC<SupplierDialogProps> = ({
  isOpen,
  onClose,
  supplier,
  onSave,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        {isOpen && (
          <SupplierDialogForm
            key={supplier ? supplier.id : "new"}
            supplier={supplier}
            onClose={onClose}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SupplierDialog;
