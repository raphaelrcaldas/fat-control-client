import clsx from "clsx";

const barColors: Record<string, string> = {
   blue: "bg-blue-500",
   amber: "bg-amber-500",
   red: "bg-red-500",
   emerald: "bg-emerald-500",
};

const iconColors: Record<string, string> = {
   blue: "text-blue-500",
   amber: "text-amber-500",
   red: "text-red-500",
   emerald: "text-emerald-500",
};

export function SectionTitle({
   icon,
   title,
   color = "blue",
}: {
   icon: React.ReactNode;
   title: string;
   color?: string;
}) {
   return (
      <div className="flex items-center gap-2">
         <div
            className={clsx(
               "h-4 w-1 rounded-full",
               barColors[color] ?? barColors.blue
            )}
         />
         <span
            className={clsx("h-4 w-4", iconColors[color] ?? iconColors.blue)}
         >
            {icon}
         </span>
         <h3 className="text-xs font-bold tracking-wider text-gray-700 uppercase">
            {title}
         </h3>
      </div>
   );
}
