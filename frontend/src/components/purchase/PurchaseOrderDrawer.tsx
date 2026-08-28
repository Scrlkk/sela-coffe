import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormSearchablePicker,
  type SearchableOption,
} from "@/components/shared/FormSearchablePicker";
import {
  Plus,
  Trash2,
  Receipt,
  Truck,
  Package,
  X,
  ShoppingCart,
} from "lucide-react";
import { getStoredSuppliers } from "@/services/supplier";
import { getStoredIngredients } from "@/services/ingredient";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuth } from "@/contexts/AuthContext";
import type {
  PurchaseOrderItem,
  PurchaseOrderItemLine,
} from "@/services/purchase";

interface PurchaseOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    poData: Omit<
      PurchaseOrderItem,
      "id" | "po_number" | "createdAt" | "updatedAt"
    >,
  ) => void;
}

interface PurchaseOrderFormProps {
  onClose: () => void;
  onSave: (
    poData: Omit<
      PurchaseOrderItem,
      "id" | "po_number" | "createdAt" | "updatedAt"
    >,
  ) => void;
}

interface AddedItemLine {
  ingredient_id: string;
  ingredient_name: string;
  category_name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const suppliers = getStoredSuppliers(false);
  const rawIngredients = getStoredIngredients(false);

  const [supplierId, setSupplierId] = useState("");
  const [orderDate, setOrderDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<AddedItemLine[]>([]);

  const [entryIngredientId, setEntryIngredientId] = useState("");
  const [entryQty, setEntryQty] = useState<number>(1);
  const [entryCost, setEntryCost] = useState<number>(0);

  const selectedEntryIng = rawIngredients.find(
    (i) => i.id === entryIngredientId,
  );

  const handleSelectEntryIngredient = (ingId: string) => {
    setEntryIngredientId(ingId);
    const found = rawIngredients.find((i) => i.id === ingId);
    if (found) {
      setEntryCost(found.costPrice || 0);
      setEntryQty(1);
    }
  };

  const handleAddItemToReceipt = () => {
    if (!selectedEntryIng || entryQty <= 0) return;

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.ingredient_id === selectedEntryIng.id,
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + entryQty,
          unit_cost: entryCost || updated[existingIdx].unit_cost,
        };
        return updated;
      }

      return [
        ...prev,
        {
          ingredient_id: selectedEntryIng.id,
          ingredient_name: selectedEntryIng.name,
          category_name: selectedEntryIng.category,
          quantity: entryQty,
          unit: selectedEntryIng.unit,
          unit_cost: entryCost,
        },
      ];
    });

    setEntryIngredientId("");
    setEntryQty(1);
    setEntryCost(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || items.length === 0 || totalAmount <= 0) return;

    const chosenSupplier = suppliers.find((s) => s.id === supplierId);
    if (!chosenSupplier) return;

    const formattedLines: PurchaseOrderItemLine[] = items.map((item) => ({
      ingredient_id: item.ingredient_id,
      ingredient_name: item.ingredient_name,
      category_name: item.category_name,
      quantity: item.quantity,
      unit: item.unit,
      unit_cost: item.unit_cost,
      subtotal: item.quantity * item.unit_cost,
    }));

    onSave({
      supplier_id: chosenSupplier.id,
      supplier_name: chosenSupplier.name,
      order_date: new Date(orderDate).toISOString(),
      expected_date: expectedDate
        ? new Date(expectedDate).toISOString()
        : undefined,
      status: "PENDING",
      items: formattedLines,
      total_amount: totalAmount,
      notes: notes.trim() || undefined,
      created_by: user?.name || "Admin Sela",
      isDeleted: false,
    });
  };

  const supplierOptions: SearchableOption[] = suppliers.map((s) => ({
    id: s.id,
    label: s.name,
    sublabel: s.contactPerson
      ? `${s.contactPerson}${s.phone ? ` • ${s.phone}` : ""}`
      : s.phone || undefined,
    badge: "Supplier",
  }));

  const ingredientOptions: SearchableOption[] = rawIngredients.map((i) => ({
    id: i.id,
    label: i.name,
    sublabel: `${i.category} • Stock: ${formatNumber(i.currentStock)} ${i.unit}`,
    badge: i.unit,
  }));

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col flex-1 min-h-0 overflow-hidden bg-card"
    >
      <DrawerHeader className="px-4 sm:px-5 py-3.5 border-b border-border/60 bg-card shrink-0 text-left">
        <div className="flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5 min-w-0 text-left">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0 text-left">
              <DrawerTitle className="text-base font-bold text-foreground text-left">
                Create Purchase Order
              </DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground line-clamp-1 text-left">
                Order and procure raw coffee ingredients & supplies
              </DrawerDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-7.5 h-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-5 py-3.5 space-y-3.5 bg-card">
        {" "}
        <div className="bg-background/50 border border-border/70 rounded-2xl p-3.5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-primary" />
              <span>Vendor & Schedule</span>
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-foreground">
                Supplier / Vendor <span className="text-destructive">*</span>
              </Label>
              <FormSearchablePicker
                value={supplierId}
                options={supplierOptions}
                onChange={setSupplierId}
                placeholder="Choose vendor / supplier..."
                searchPlaceholder="Type supplier name or phone..."
                icon={Truck}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-foreground">
                  Order Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  required
                  className="h-9.5 rounded-xl bg-card border-input text-foreground text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-foreground">
                  Expected Delivery
                </Label>
                <Input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="h-9.5 rounded-xl bg-card border-input text-foreground text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-foreground">
                Notes / Reference (Optional)
              </Label>
              <Input
                placeholder="e.g. Urgent batch for weekend peak, regular delivery"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-9.5 rounded-xl bg-card border-input text-foreground text-xs font-medium"
              />
            </div>
          </div>
        </div>
        <div className="bg-background/50 border border-border/70 rounded-2xl p-3.5 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-primary" />
              <span>Ordered Materials</span>
            </span>
            <span className="text-xs font-mono font-bold text-primary">
              {items.length} in list
            </span>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 space-y-2.5 shadow-2xs">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-muted-foreground">
                Select Raw Material
              </Label>
              <FormSearchablePicker
                value={entryIngredientId}
                options={ingredientOptions}
                onChange={handleSelectEntryIngredient}
                placeholder="Search and select material..."
                searchPlaceholder="Type material name or category..."
                icon={Package}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-muted-foreground">
                  Quantity
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    disabled={!selectedEntryIng}
                    value={entryQty}
                    onChange={(e) =>
                      setEntryQty(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="h-9.5 text-xs font-mono font-bold rounded-xl pl-3.5 pr-11 bg-background border-input text-left shadow-2xs disabled:opacity-50"
                    placeholder="Qty"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-semibold uppercase pointer-events-none select-none">
                    {selectedEntryIng?.unit || "unit"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-muted-foreground">
                  Cost / Unit
                </Label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-[10.5px] text-muted-foreground font-medium pointer-events-none select-none">
                    Rp
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="500"
                    disabled={!selectedEntryIng}
                    value={entryCost}
                    onChange={(e) =>
                      setEntryCost(Math.max(0, Number(e.target.value) || 0))
                    }
                    className="h-9.5 pl-8 text-xs font-mono font-bold rounded-xl bg-background border-input text-right shadow-2xs disabled:opacity-50"
                    placeholder="Cost"
                  />
                </div>
              </div>
            </div>

            <Button
              type="button"
              disabled={!selectedEntryIng || entryQty <= 0}
              onClick={handleAddItemToReceipt}
              className="w-full h-9.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm gap-1.5 shadow-xs cursor-pointer hover:bg-primary/90 transition-all disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              <span>Add Material to Order</span>
            </Button>
          </div>

          <div className="pt-1">
            {items.length === 0 ? (
              <div className="py-6 px-4 rounded-2xl bg-card border border-dashed border-border/80 text-center space-y-1">
                <ShoppingCart className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                <p className="text-xs font-medium text-muted-foreground">
                  No materials added yet
                </p>
                <p className="text-[11px] text-muted-foreground/60">
                  Select a material and click Add Material to Order above
                </p>
              </div>
            ) : (
              <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border/70 divide-y divide-dashed divide-border/60">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-3 first:pt-1 last:pb-1 space-y-1 group"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-bold text-foreground text-xs sm:text-sm truncate">
                        {item.ingredient_name}
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-foreground shrink-0 text-right">
                        {formatRupiah(item.quantity * item.unit_cost)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] sm:text-xs text-muted-foreground font-mono">
                        {formatNumber(item.quantity)} {item.unit} × @
                        {formatRupiah(item.unit_cost)}
                      </span>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(idx)}
                        className="w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                Total Order Valuation
              </span>
              <span className="text-[10.5px] text-muted-foreground">
                {items.length} material{items.length !== 1 ? "s" : ""} in order
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-base sm:text-lg font-black text-primary block">
                {formatRupiah(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <DrawerFooter className="px-4 sm:px-5 py-3 border-t border-border/80 bg-card shrink-0 grid grid-cols-2 gap-2.5 w-full">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="w-full h-9.5 sm:h-10 rounded-xl border-border/80 text-foreground font-semibold text-xs sm:text-sm cursor-pointer hover:bg-secondary/60"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!supplierId || items.length === 0 || totalAmount <= 0}
          className="w-full h-9.5 sm:h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Create PO</span>
        </Button>
      </DrawerFooter>
    </form>
  );
};

export const PurchaseOrderDrawer: React.FC<PurchaseOrderDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [formKey, setFormKey] = useState(0);
  const [prevOpen, setPrevOpen] = useState(isOpen);

  if (isOpen && !prevOpen) {
    setPrevOpen(true);
    setFormKey((k) => k + 1);
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false);
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      swipeDirection={isDesktop ? "right" : "down"}
      showSwipeHandle
    >
      <DrawerContent
        className={
          isDesktop
            ? "w-full sm:w-130 lg:w-145 max-w-[100vw] h-full inset-y-0 right-0 rounded-l-3xl border-l border-border/80 bg-card flex flex-col shadow-2xl"
            : "w-full max-w-xl mx-auto rounded-t-3xl border-t border-border/80 bg-card max-h-[90vh] flex flex-col shadow-2xl bottom-0"
        }
      >
        <PurchaseOrderForm
          key={formKey}
          onClose={onClose}
          onSave={(po) => {
            onSave(po);
            onClose();
          }}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default PurchaseOrderDrawer;
