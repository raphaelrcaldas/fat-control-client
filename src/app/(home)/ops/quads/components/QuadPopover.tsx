import clsx from "clsx";
import { Quad } from "services/routes/quads";
import { useQuadsContext } from "@/app/(home)/context/quads";
import { quadDisplayValue } from "../utils/quadDisplay";

export function QuadPopover({ quad }: { quad: Quad }) {
   const cellContent = quadDisplayValue(quad);

   const { visual } = useQuadsContext();

   return (
      <div
         className={clsx(
            `flex size-9 shrink-0 items-center justify-center rounded`,
            {
               "bg-red-500 hover:bg-red-700": quad.value,
               "bg-slate-500 hover:bg-slate-700": !quad.value,
               "sm:w-18": visual === "comp",
               "sm:w-9": visual === "reduz",
            }
         )}
      >
         <span
            className={clsx("hidden text-center font-mono text-sm text-white", {
               "sm:block": visual === "comp",
               "sm:hidden": visual === "reduz",
            })}
         >
            {cellContent}
         </span>
      </div>
   );
}
