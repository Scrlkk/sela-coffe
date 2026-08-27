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
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import {
  Plus,
  Trash2,
  FileSpreadsheet,
  Truck,
  Package,
  Calendar,
  X,
  FileText,
  DollarSign,
} from "lucide-react";
import { getStoredSuppliers } from "@/services/supplier";
import { getStoredIngredients } from "@/services/ingredient";
import { formatRupiah } from "@/utils/formatCurrency";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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

interface DraftLineItem {
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
  // ponytail: straightforward mock data retrieval
  const suppliers = getStoredSuppliers(false);
  const rawIngredients = getStoredIngredients(false);

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [orderDate, setOrderDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<DraftLineItem[]>(() => {
    if (rawIngredients.length === 0) return [];
    const first = rawIngredients[0];
    return [
      {
        ingredient_id: first.id,
        ingredient_name: first.name,
        category_name: first.category,
        quantity: 10,
        unit: first.unit,
        unit_cost: first.costPrice || 10000,
      },
    ];
  });

  const handleAddItem = () => {
    if (rawIngredients.length === 0) return;
    const existingIds = new Set(items.map((i) => i.ingredient_id));
    const nextIng =
      rawIngredients.find((i) => !existingIds.has(i.id)) || rawIngredients[0];

    setItems((prev) => [
      ...prev,
      {
        ingredient_id: nextIng.id,
        ingredient_name: nextIng.name,
        category_name: nextIng.category,
        quantity: 1,
        unit: nextIng.unit,
        unit_cost: nextIng.costPrice || 10000,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (
    index: number,
    field: "ingredient_id" | "quantity" | "unit_cost",
    value: string | number,
  ) => {
    setItems((prev) => {
      const next = [...prev];
      const target = { ...next[index] };

      if (field === "ingredient_id") {
        const found = rawIngredients.find((i) => i.id === value);
        if (found) {
          target.ingredient_id = found.id;
          target.ingredient_name = found.name;
          target.category_name = found.category;
          target.unit = found.unit;
          target.unit_cost = found.costPrice || target.unit_cost;
        }
      } else if (field === "quantity") {
        target.quantity = Math.max(1, Number(value) || 1);
      } else if (field === "unit_cost") {
        target.unit_cost = Math.max(0, Number(value) || 0);
      }

      next[index] = target;
      return next;
    });
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || items.length === 0) return;

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
      isDeleted: false,
    });
  };

  const supplierOptions = suppliers.map((s) => ({
    id: s.id,
    label: s.name,
  }));

  const ingredientOptions = rawIngredients.map((i) => ({
    id: i.id,
    label: `${i.name} (${i.unit})`,
  }));

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col flex-1 min-h-0 overflow-hidden bg-background"
    >
      {/* Header */}
      <DrawerHeader className="px-5 sm:px-7 py-3.5 sm:py-4 border-b border-border/80 bg-card/60 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <DrawerTitle className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
                Create Purchase Order
              </DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground truncate">
                Procure raw materials & restock inventory
              </DrawerDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DrawerHeader>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 sm:px-7 py-4 space-y-4">
        {/* Vendor & Schedule Section */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-4.5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              <span>Vendor & Schedule</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                Supplier / Vendor <span className="text-destructive">*</span>
              </Label>
              <FormDropdownPicker
                value={supplierId}
                options={supplierOptions}
                onChange={setSupplierId}
                placeholder="Select supplier..."
                icon={Truck}
                className="h-9.5 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Order Date</span>{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
                className="h-9.5 rounded-xl border-border/80 text-xs font-medium text-foreground bg-background shadow-2xs focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Expected Delivery</span>
              </Label>
              <Input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="h-9.5 rounded-xl border-border/80 text-xs font-medium text-foreground bg-background shadow-2xs focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Order Notes / Ref</span>
              </Label>
              <Input
                placeholder="e.g. Urgent batch for weekend peak"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-9.5 rounded-xl border-border/80 text-xs text-foreground bg-background shadow-2xs placeholder:text-muted-foreground/70 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Ordered Materials Section */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-4.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span>Ordered Materials ({items.length})</span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="h-7.5 px-3 rounded-xl text-xs font-bold gap-1.5 cursor-pointer bg-background hover:bg-secondary/70 border-border/80 shadow-2xs text-primary hover:text-primary"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Material</span>
            </Button>
          </div>

          <div className="space-y-2.5">
            {/* Column Headers (Desktop) */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-2.5 px-3 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/30 rounded-xl">
              <div className="col-span-5">Material / Ingredient</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-right">Unit Cost (Rp)</div>
              <div className="col-span-2 text-right pr-2">Subtotal</div>
            </div>

            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3 sm:p-2.5 rounded-xl bg-background/70 border border-border/70 hover:border-primary/40 transition-colors flex flex-col sm:grid sm:grid-cols-12 gap-2.5 sm:items-center shadow-2xs"
              >
                {/* Material Dropdown */}
                <div className="sm:col-span-5 min-w-0">
                  <FormDropdownPicker
                    value={item.ingredient_id}
                    options={ingredientOptions}
                    onChange={(val) =>
                      handleItemChange(idx, "ingredient_id", val)
                    }
                    placeholder="Choose ingredient..."
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                {/* Quantity Input */}
                <div className="sm:col-span-3 flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(idx, "quantity", e.target.value)
                      }
                      className="h-9 text-xs font-mono font-bold rounded-xl pr-12 bg-background border-border/80 text-center"
                      placeholder="Qty"
                    />
                    <span className="absolute right-2.5 top-2.5 text-[11px] text-muted-foreground font-semibold uppercase">
                      {item.unit}
                    </span>
                  </div>
                </div>

                {/* Unit Cost */}
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="500"
                    value={item.unit_cost}
                    onChange={(e) =>
                      handleItemChange(idx, "unit_cost", e.target.value)
                    }
                    className="h-9 text-xs font-mono font-bold rounded-xl bg-background border-border/80 text-right"
                    placeholder="Cost"
                  />
                </div>

                {/* Subtotal & Delete */}
                <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t border-border/40 sm:border-0">
                  <div className="sm:hidden text-xs text-muted-foreground font-medium">
                    Subtotal:
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {formatRupiah(item.quantity * item.unit_cost)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={items.length <= 1}
                    onClick={() => handleRemoveItem(idx)}
                    className="w-7.5 h-7.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer disabled:opacity-20"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Valuation Summary Card */}
        <div className="p-4 rounded-2xl bg-card border border-primary/20 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total Order Valuation
              </span>
              <span className="text-xs text-muted-foreground">
                {items.length} materials configured
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-lg sm:text-xl font-black text-primary block tracking-tight">
              {formatRupiah(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <DrawerFooter className="px-5 sm:px-7 py-3.5 sm:py-4 border-t border-border/80 bg-card/90 backdrop-blur-md shrink-0 flex flex-row items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="h-9.5 px-5 rounded-xl border-border/80 text-xs font-semibold cursor-pointer bg-background hover:bg-secondary/60"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!supplierId || items.length === 0 || totalAmount <= 0}
          className="h-9.5 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs gap-2 shadow-sm hover:opacity-90 cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Create Purchase Order</span>
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
            ? "w-full sm:w-155 lg:w-180 max-w-[100vw] h-full inset-y-0 right-0 rounded-l-3xl border-l border-border/80 bg-background flex flex-col shadow-2xl"
            : "w-full max-w-2xl mx-auto rounded-t-3xl border-t border-border/80 bg-background max-h-[90vh] flex flex-col shadow-2xl bottom-0"
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

