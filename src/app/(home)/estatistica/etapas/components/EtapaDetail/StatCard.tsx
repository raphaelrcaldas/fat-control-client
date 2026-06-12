import clsx from "clsx";

interface StatCardProps {
   icon: React.ReactNode;
   label: string;
   value: React.ReactNode;
   accent?: string;
}

export const ACCENT_STYLES: Record<string, { card: string; iconBg: string }> = {
   gray: {
      card: "border-gray-200 bg-gray-50/50",
      iconBg: "bg-gray-100 text-gray-600",
   },
   blue: {
      card: "border-blue-200 bg-blue-50/50",
      iconBg: "bg-blue-100 text-blue-600",
   },
   amber: {
      card: "border-amber-200 bg-amber-50/50",
      iconBg: "bg-amber-100 text-amber-600",
   },
   emerald: {
      card: "border-emerald-200 bg-emerald-50/50",
      iconBg: "bg-emerald-100 text-emerald-600",
   },
   red: {
      card: "border-red-200 bg-red-50/50",
      iconBg: "bg-red-100 text-red-600",
   },
   cyan: {
      card: "border-cyan-200 bg-cyan-50/50",
      iconBg: "bg-cyan-100 text-cyan-600",
   },
   purple: {
      card: "border-purple-200 bg-purple-50/50",
      iconBg: "bg-purple-100 text-purple-600",
   },
};

export function StatCard({
   icon,
   label,
   value,
   accent = "gray",
}: StatCardProps) {
   const styles = ACCENT_STYLES[accent] ?? ACCENT_STYLES.gray;
   return (
      <div
         className={clsx(
            "flex items-center gap-2.5 rounded border px-1.5 py-1 shadow-sm",
            styles.card
         )}
      >
         <div
            className={clsx(
               "flex h-8 w-8 shrink-0 items-center justify-center rounded",
               styles.iconBg
            )}
         >
            {icon}
         </div>
         <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">
               {label}
            </p>
            <p className="truncate font-mono text-sm font-bold text-gray-900">
               {value ?? <span className="text-gray-300">&mdash;</span>}
            </p>
         </div>
      </div>
   );
}
