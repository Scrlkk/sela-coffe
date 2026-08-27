import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group font-sans"
      toastOptions={{
        style: {
          background: "var(--card)",
          color: "var(--card-foreground)",
          border: "1px solid var(--border)",
          borderRadius: "0.875rem",
          boxShadow: "0 10px 25px -5px rgba(67, 32, 11, 0.18)",
          maxWidth: "380px",
          width: "max-content",
        },
        classNames: {
          toast:
            "font-sans text-xs font-semibold p-3 px-3.5 gap-2.5 max-w-[380px] break-words whitespace-normal leading-relaxed flex items-center",
          title: "text-xs font-semibold break-words leading-tight",
          description:
            "text-[11px] font-medium text-muted-foreground break-words leading-normal mt-0.5",
          actionButton:
            "bg-primary text-primary-foreground font-bold rounded-lg px-2.5 py-1 text-[11px] shrink-0 shadow-2xs",
          cancelButton:
            "bg-secondary text-secondary-foreground font-bold rounded-lg px-2.5 py-1 text-[11px] shrink-0",
          success:
            "[&_[data-icon]]:text-emerald-500 [&_[data-icon]]:dark:text-emerald-400 border-emerald-500/30",
          error:
            "[&_[data-icon]]:text-red-500 [&_[data-icon]]:dark:text-red-400 border-red-500/30",
          warning:
            "[&_[data-icon]]:text-amber-500 [&_[data-icon]]:dark:text-amber-400 border-amber-500/30",
          info: "[&_[data-icon]]:text-sky-500 [&_[data-icon]]:dark:text-sky-400 border-sky-500/30",
        },
      }}
      {...props}
    />
  );
};

export default Toaster;
