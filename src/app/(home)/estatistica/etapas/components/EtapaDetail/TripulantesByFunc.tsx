import clsx from "clsx";
import { FaUsers } from "react-icons/fa";
import {
   FUNC_BORDO_ORDER,
   FUNC_COLORS,
   FUNC_ORDER,
   FUNCOES_CONFIG,
   type FuncType,
} from "@/constants/tripulantes/funcoes";
import type { TripEtapaItem } from "services/routes/estatistica/etapas";

export function TripulantesByFunc({
   tripulantes,
}: {
   tripulantes: TripEtapaItem[];
}) {
   const grouped = new Map<string, TripEtapaItem[]>();
   for (const t of tripulantes) {
      const list = grouped.get(t.func) ?? [];
      list.push(t);
      grouped.set(t.func, list);
   }

   for (const [, members] of grouped) {
      members.sort((a, b) => {
         const oa = FUNC_BORDO_ORDER[a.func_bordo] ?? 50;
         const ob = FUNC_BORDO_ORDER[b.func_bordo] ?? 50;
         return oa - ob;
      });
   }

   const orderedFuncs = [
      ...FUNC_ORDER,
      ...Array.from(grouped.keys()).filter(
         (f) => !FUNC_ORDER.includes(f as FuncType)
      ),
   ].filter((f) => grouped.has(f));

   if (orderedFuncs.length === 0) {
      return (
         <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
            <FaUsers className="mx-auto mb-2 h-6 w-6 text-gray-300" />
            <p className="text-sm text-gray-400">
               Nenhum tripulante registrado
            </p>
         </div>
      );
   }

   return (
      <div className="flex flex-col gap-3">
         {orderedFuncs.map((func) => {
            const config = FUNCOES_CONFIG[func as FuncType];
            const members = grouped.get(func)!;
            const themeColor = config?.theme.color ?? "gray";
            const colors = FUNC_COLORS[themeColor] ?? FUNC_COLORS.gray;

            return (
               <div
                  key={func}
                  className={clsx(
                     "overflow-hidden rounded-xl border",
                     colors.border
                  )}
               >
                  <div className={clsx("h-1", colors.bar)} />
                  <div className={clsx("p-3", colors.bg)}>
                     <div className="mb-2.5 flex items-center justify-between">
                        <span
                           className={clsx(
                              "text-xs font-bold tracking-wide uppercase",
                              colors.text
                           )}
                        >
                           {config?.label ?? func}
                        </span>
                        <span
                           className={clsx(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              colors.badge
                           )}
                        >
                           {members.length}
                        </span>
                     </div>
                     <div className="space-y-1">
                        {members.map((m) => (
                           <div
                              key={`${m.trig}-${m.func_bordo}`}
                              className="flex items-center gap-2 rounded-lg bg-white/80 px-2.5 py-2 shadow-sm"
                           >
                              <div
                                 className={clsx(
                                    "flex items-center justify-center rounded px-2 py-1 font-mono text-xs font-bold uppercase",
                                    colors.badge
                                 )}
                              >
                                 {m.trig}
                              </div>
                              <div className="min-w-0 flex-1">
                                 <p className="text-xs font-semibold text-gray-800 uppercase">
                                    {m.p_g} {m.nome_guerra}
                                 </p>
                              </div>
                              <span
                                 className={clsx(
                                    "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase",
                                    colors.badge
                                 )}
                              >
                                 {m.func_bordo || m.func}
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
   );
}
