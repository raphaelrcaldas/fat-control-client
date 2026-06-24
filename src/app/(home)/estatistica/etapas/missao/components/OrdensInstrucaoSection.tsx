import clsx from "clsx";
import { HiPlus, HiX } from "react-icons/hi";
import { Button, Label, TextInput } from "flowbite-react";
import { minutesToTime, timeToMinutes } from "@/../utils/dateHandler";
import { SearchableSelect } from "@/components/SearchableSelect";
import type { DraftOIItem } from "../context/types";

interface OrdensInstrucaoSectionProps {
   oiItems: DraftOIItem[];
   addOiItem: () => void;
   removeOiItem: (uid: string) => void;
   updateOiItem: (uid: string, patch: Partial<DraftOIItem>) => void;
   oiTotalTvoo: number;
   oiValid: boolean;
   tvoo: number;
   esfAerList: Array<{ id: number; descricao: string }>;
   tiposMissaoList: Array<{ id: number; cod: string; desc: string }>;
}

const fieldLabelClass =
   "mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase";

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
      <section className="space-y-3">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               {oiItems.length > 0 && (
                  <span
                     className={clsx(
                        "rounded px-2.5 py-1 text-xs font-bold tracking-wide uppercase",
                        oiValid
                           ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                           : "bg-amber-100 text-amber-700 ring-1 ring-amber-300"
                     )}
                  >
                     {minutesToTime(oiTotalTvoo)} / {minutesToTime(tvoo)}
                     {oiValid ? " ✓ REGULAR" : " ⚠ DIVERGENTE"}
                  </span>
               )}
            </div>
            <Button
               type="button"
               size="xs"
               color="light"
               onClick={addOiItem}
               className="font-semibold"
            >
               <HiPlus className="mr-1 h-4 w-4" />
               Nova OI
            </Button>
         </div>

         {oiItems.length === 0 ? (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
               <p className="text-sm font-medium text-gray-500">
                  Nenhuma Ordem de Instrução associada
               </p>
               <p className="mt-1 text-xs text-gray-400">
                  Clique em "Nova OI" se houver registro de treinamento para
                  adicionar à estatística.
               </p>
            </div>
         ) : (
            <div className="space-y-3">
               {oiItems.map((oi) => (
                  <div
                     key={oi.uid}
                     className="relative grid grid-cols-2 items-end gap-3 border border-gray-200 bg-white p-3 pr-10 shadow-sm sm:grid-cols-[1fr_1fr_auto_80px_auto] sm:pr-4"
                  >
                     {/* Esforço Aéreo */}
                     <div className="col-span-2 flex flex-col text-left sm:col-span-1">
                        <Label className={fieldLabelClass}>Esforço Aéreo</Label>
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
                           placeholder="Buscar Esforço..."
                           sizing="sm"
                        />
                     </div>
                     {/* Tipo Missão */}
                     <div className="col-span-2 flex flex-col text-left sm:col-span-1">
                        <Label className={fieldLabelClass}>Tipo Missão</Label>
                        <SearchableSelect
                           options={tiposMissaoList.map((t) => ({
                              value: String(t.id),
                              label: `${t.cod} - ${t.desc}`,
                           }))}
                           value={
                              oi.tipo_missao_id ? String(oi.tipo_missao_id) : ""
                           }
                           onChange={(val) =>
                              updateOiItem(oi.uid, {
                                 tipo_missao_id: val ? Number(val) : null,
                              })
                           }
                           placeholder="Buscar Sigla..."
                           sizing="sm"
                        />
                     </div>
                     {/* Reg */}
                     <div className="flex flex-col text-left">
                        <Label
                           className={clsx(
                              fieldLabelClass,
                              "whitespace-nowrap"
                           )}
                        >
                           Regime
                        </Label>
                        <div className="flex overflow-hidden rounded border border-gray-300">
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
                                    "flex-1 px-3 py-1.75 text-xs font-bold focus:outline-none",
                                    oi.reg === v
                                       ? "bg-red-800 text-white"
                                       : "bg-white text-red-500 hover:bg-red-100",
                                    v !== "d" && "border-l border-red-200"
                                 )}
                              >
                                 {l}
                              </button>
                           ))}
                        </div>
                     </div>
                     {/* T.Voo */}
                     <div className="flex flex-col text-left">
                        <Label className={fieldLabelClass}>Tempo</Label>
                        <TextInput
                           type="time"
                           value={oi.tvooDisplay || "00:00"}
                           onChange={(e) => {
                              const val = e.target.value;
                              updateOiItem(oi.uid, {
                                 tvooDisplay: val,
                                 tvoo: val ? timeToMinutes(val) : 0,
                              });
                           }}
                           sizing="sm"
                           className="text-center font-mono"
                        />
                     </div>
                     {/* Excluir — absoluto no canto em mobile, coluna própria em sm+ */}
                     <div className="absolute top-2 right-1.5 sm:static sm:flex sm:h-full sm:items-center sm:justify-center sm:pb-1">
                        <button
                           type="button"
                           onClick={() => removeOiItem(oi.uid)}
                           className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600"
                           title="Remover OI"
                           aria-label="Remover Ordem de Instrução"
                        >
                           <HiX className="h-5 w-5" />
                        </button>
                     </div>
                  </div>
               ))}

               {oiItems.length > 0 && !oiValid && tvoo > 0 && (
                  <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                     O somatório das OIs (
                     <strong>{minutesToTime(oiTotalTvoo)}</strong>) não coincide
                     com o tempo total da Etapa (
                     <strong>{minutesToTime(tvoo)}</strong>).
                  </div>
               )}
            </div>
         )}
      </section>
   );
}
