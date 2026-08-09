import { useState } from "react";
import { toast } from "sonner";
import { CashSessionStats } from "@/components/cash-session/CashSessionStats";
import { OpenRegisterCard } from "@/components/cash-session/OpenRegisterCard";
import { ActiveRegisterCard } from "@/components/cash-session/ActiveRegisterCard";
import {
  CashSessionHistory,
  type SessionHistoryItem,
} from "@/components/cash-session/CashSessionHistory";
import { type FilterPeriod } from "@/constants/dashboard";
import { formatRupiah } from "@/utils/formatCurrency";

export default function CashSessionPage() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openingFloat, setOpeningFloat] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<string>("08:00 AM");
  const [period, setPeriod] = useState<FilterPeriod>("This Week");

  const cashSalesToday = 342000;
  const cardSalesToday = 1505000;
  const qrSalesToday = 0;
  const totalOrdersToday = 18;

  const [history, setHistory] = useState<SessionHistoryItem[]>([
    {
      id: "SES-0841",
      openedBy: "Kasir (kasir)",
      openedAt: "08 Aug 2026, 08:00 AM",
      closedAt: "08 Aug 2026, 10:00 PM",
      openingFloat: 200000,
      cashSales: 450000,
      expectedCash: 650000,
      actualCash: 650000,
      variance: 0,
      status: "completed",
    },
    {
      id: "SES-0840",
      openedBy: "Admin (admin)",
      openedAt: "07 Aug 2026, 08:00 AM",
      closedAt: "07 Aug 2026, 09:30 PM",
      openingFloat: 200000,
      cashSales: 520000,
      expectedCash: 720000,
      actualCash: 720000,
      variance: 0,
      status: "completed",
    },
    {
      id: "SES-0839",
      openedBy: "Kasir (kasir)",
      openedAt: "06 Aug 2026, 08:00 AM",
      closedAt: "06 Aug 2026, 10:15 PM",
      openingFloat: 200000,
      cashSales: 410000,
      expectedCash: 610000,
      actualCash: 610000,
      variance: 0,
      status: "completed",
    },
    {
      id: "SES-0838",
      openedBy: "Kasir (kasir)",
      openedAt: "05 Aug 2026, 08:00 AM",
      closedAt: "05 Aug 2026, 09:45 PM",
      openingFloat: 200000,
      cashSales: 480000,
      expectedCash: 680000,
      actualCash: 680000,
      variance: 0,
      status: "completed",
    },
  ]);

  const handleOpenRegister = (floatAmount: number) => {
    const nowStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const todayDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newSessionId = `SES-08${Math.floor(42 + Math.random() * 50)}`;

    setOpeningFloat(floatAmount);
    setStartedAt(nowStr);
    setIsOpen(true);

    const newRecord: SessionHistoryItem = {
      id: newSessionId,
      openedBy: "Kasir (kasir)",
      openedAt: `${todayDate}, ${nowStr}`,
      closedAt: null,
      openingFloat: floatAmount,
      cashSales: cashSalesToday,
      expectedCash: floatAmount + cashSalesToday,
      actualCash: null,
      variance: null,
      status: "active",
    };

    setHistory((prev) => [newRecord, ...prev]);
    toast.success(`Register opened with ${formatRupiah(floatAmount)} float`);
  };

  const handleCloseRegister = () => {
    const nowStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const todayDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    setHistory((prev) =>
      prev.map((item) =>
        item.status === "active"
          ? {
              ...item,
              closedAt: `${todayDate}, ${nowStr}`,
              status: "completed",
            }
          : item,
      ),
    );

    setIsOpen(false);
    setOpeningFloat(null);
    toast.info("Cash register session closed");
  };

  return (
    <div className="w-full flex flex-col space-y-4 xl:h-full xl:min-h-0">
      {/* Top 4 Stat Cards Grid */}
      <CashSessionStats
        isOpen={isOpen}
        openingFloat={openingFloat}
        cashSalesToday={cashSalesToday}
        totalOrdersToday={totalOrdersToday}
      />

      {/* Main Grid: Natural scroll on mobile/tablet, 100% viewport stretch on desktop XL */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch xl:flex-1 xl:min-h-0">
        {/* Register Action Card (4/12 width on XL) */}
        <div className="xl:col-span-4 w-full xl:h-full xl:min-h-0">
          {!isOpen ? (
            <OpenRegisterCard
              onOpenRegister={handleOpenRegister}
              defaultFloat={200000}
            />
          ) : (
            <ActiveRegisterCard
              startedAt={startedAt}
              openingFloat={openingFloat ?? 200000}
              cashSales={cashSalesToday}
              cardSales={cardSalesToday}
              qrSales={qrSalesToday}
              onCloseRegister={handleCloseRegister}
            />
          )}
        </div>

        {/* Recent Cash Sessions History Table & Filter (8/12 width on XL) */}
        <div className="xl:col-span-8 w-full xl:h-full xl:min-h-0">
          <CashSessionHistory
            history={history}
            period={period}
            onPeriodChange={setPeriod}
          />
        </div>
      </div>
    </div>
  );
}
