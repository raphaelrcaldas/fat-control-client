import clsx from "clsx";
import { Quad } from "services/routes/quads";
import { useQuadsContext } from "@/app/(home)/context/quads";
import { quadDisplayValue } from "../utils/quadDisplay";
import { CELULA_QUADRINHO, LARGURA_POR_VISUAL } from "./dimensoesCelula";

export function QuadPopover({ quad }: { quad: Quad }) {
   const cellContent = quadDisplayValue(quad);

   const { visual } = useQuadsContext();

   return (
      <div
         className={clsx(
            "flex shrink-0 items-center justify-center rounded",
            CELULA_QUADRINHO,
            LARGURA_POR_VISUAL[visual],
            quad.value
               ? "bg-primary-600 hover:bg-primary-700"
               : "bg-slate-500 hover:bg-slate-700"
         )}
      >
         <span
            className={clsx(
               "hidden text-center text-sm font-bold text-white tabular-nums",
               {
                  "sm:block": visual === "comp",
                  "sm:hidden": visual === "reduz",
               }
            )}
         >
            {cellContent}
         </span>
      </div>
   );
}
