import { isoDateToString } from "utils/dateHandler";
import clsx from "clsx";
import { Quad } from "services/routes/quads";
import { useQuadsContext } from "@/app/(home)/context/quads";

export function QuadPopover({ quad }: { quad: Quad }) {
   const cellContent = quad.value ? isoDateToString(quad.value) : "LASTRO";

   const { visual } = useQuadsContext();

   return (
      <button
         type='button'
         className={clsx(`flex-shrink-0 rounded h-9 w-9`, {
            "bg-blue-600 hover:bg-blue-800": quad.value,
            "bg-slate-500 hover:bg-slate-700": !quad.value,
            "sm:w-[65px]": visual === "comp",
            "sm:w-9": visual === "reduz",
         })}
      >
         <span
            className={clsx(
               "hidden text-sm text-white font-medium text-center",
               {
                  "sm:grid": visual === "comp",
                  "sm:hidden": visual === "reduz",
               }
            )}
         >
            {cellContent}
         </span>
      </button>
   );
}
