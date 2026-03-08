import clsx from "clsx";
import { HiPlus, HiX } from "react-icons/hi";
import { Label } from "flowbite-react";
import { minutesToTime, timeToMinutes } from "@/../utils/dateHandler";
import { SearchableSelect } from "@/components/SearchableSelect";
import type { OIItem } from "../types";

interface OrdensInstrucaoSectionProps {
   oiItems: OIItem[];
   addOiItem: () => void;
   removeOiItem: (uid: string) => void;
   updateOiItem: (uid: string, patch: Partial<OIItem>) => void;
   oiTotalTvoo: number;
   oiValid: boolean;
   tvoo: number;
   esfAerList: Array<{ id: number; descricao: string }>;
   tiposMissaoList: Array<{ id: number; cod: string; desc: string }>;
}

export function OrdensInstrucaoSection({
   oiItems,
   addOiItem,
   removeOiItem,
   updateOiItem,
   oiTotalTvoo,
   oiValid,
   tvoo,
   esfAerList,
   tiposMissaoList,
}: OrdensInstrucaoSectionProps) {
   return (
      <section>
         <div className="mb-2 flex items-center gap-3 border-b border-gray-200 pb-1.5">
            <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
               Ordens de Instrução
            </h3>
            {oiItems.length > 0 && (
               <span
                  className={clsx(
                     "rounded-full px-2 py-0.5 text-xs font-medium",
                     oiValid
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                  )}
               >
                  {minutesToTime(oiTotalTvoo)} / {minutesToTime(tvoo)}
                  {oiValid ? " ✓" : " ⚠"}
               </span>
            )}
            <button
               type="button"
               onClick={addOiItem}
               className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
               <HiPlus className="h-3.5 w-3.5" />
               Adicionar OI
            </button>
         </div>

         {oiItems.length === 0 ? (
            <p className="py-3 text-center text-sm text-gray-400">
               Nenhuma OI adicionada
            </p>
         ) : (
            <div className="space-y-2">
               {oiItems.map((oi) => (
                  <div
                     key={oi.uid}
                     className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-end gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2"
                  >
                     <div>
                        <Label className="mb-1 block text-xs font-medium">
                           Esforço Aéreo
                        </Label>
                        <SearchableSelect
                           options={esfAerList.map((e) => ({
                              value: String(e.id),
                              label: e.descricao,
                           }))}
                           value={oi.esf_aer_id ? String(oi.esf_aer_id) : ""}
                           onChange={(val) =>
                              updateOiItem(oi.uid, {
                                 esf_aer_id: val ? Number(val) : null,
                              })
                           }
                           placeholder="Selecionar..."
                           sizing="sm"
                        />
                     </div>
                     <div>
                        <Label className="mb-1 block text-xs font-medium">
                           Tipo Missão
                        </Label>
                        <select
                           value={oi.tipo_missao_id ?? ""}
                           onChange={(e) =>
                              updateOiItem(oi.uid, {
                                 tipo_missao_id: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                              })
                           }
                           className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                        >
                           <option value="">Selecionar...</option>
                           {tiposMissaoList.map((t) => (
                              <option key={t.id} value={t.id}>
                                 {t.cod} - {t.desc}
                              </option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <Label className="mb-1 block text-xs font-medium">
                           Reg
                        </Label>
                        <div className="flex gap-1">
                           {(
                              [
                                 { v: "d", l: "D" },
                                 { v: "n", l: "N" },
                                 { v: "v", l: "V" },
                              ] as const
                           ).map(({ v, l }) => (
                              <button
                                 key={v}
                                 type="button"
                                 onClick={() =>
                                    updateOiItem(oi.uid, { reg: v })
                                 }
                                 className={clsx(
                                    "h-9 w-9 rounded-lg border text-sm font-semibold transition-colors",
                                    oi.reg === v
                                       ? "border-red-500 bg-red-500 text-white"
                                       : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                                 )}
                              >
                                 {l}
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="w-28">
                        <Label className="mb-1 block text-xs font-medium">
                           T.Voo
                        </Label>
                        <input
                           type="time"
                           value={oi.tvooDisplay || "00:00"}
                           onChange={(e) => {
                              const val = e.target.value;
                              updateOiItem(oi.uid, {
                                 tvooDisplay: val,
                                 tvoo: val ? timeToMinutes(val) : 0,
                              });
                           }}
                           className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-center font-mono text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                        />
                     </div>
                     <button
                        type="button"
                        onClick={() => removeOiItem(oi.uid)}
                        className="mb-0.5 self-end rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                     >
                        <HiX className="h-4 w-4" />
                     </button>
                  </div>
               ))}

               {oiItems.length > 0 && !oiValid && tvoo > 0 && (
                  <p className="text-xs text-amber-600">
                     ⚠ A soma dos T.Voo das OIs ({minutesToTime(oiTotalTvoo)})
                     deve ser igual ao T.Voo da etapa ({minutesToTime(tvoo)})
                  </p>
               )}
            </div>
         )}
      </section>
   );
}
