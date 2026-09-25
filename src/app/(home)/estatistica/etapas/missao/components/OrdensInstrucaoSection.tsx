import { useId } from "react";
import clsx from "clsx";
import { HiPlus, HiX } from "react-icons/hi";
import { Button, Label } from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import { SearchableSelect } from "@/components/SearchableSelect";
import type { DraftOIItem } from "../context/types";
import type { EtapaOiGroup } from "../hooks/useEtapaEditor";
import { OiTempoInput } from "./OiTempoInput";

interface OrdensInstrucaoSectionProps {
   oi: EtapaOiGroup;
   tvoo: number;
   esfAerList: Array<{ id: number; descricao: string }>;
   tiposMissaoList: Array<{ id: number; cod: string; desc: string }>;
   /** Catalogos de esforco/tipo carregando: os selects viram skeleton. */
   loadingCatalogos: boolean;
   /** Houve tentativa de salvar recusada: aponta os campos que faltam. */
   showErrors: boolean;
}

const fieldLabelClass =
   "mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase";

const REGIMES = [
   { v: "d", l: "D", nome: "Diurno" },
   { v: "n", l: "N", nome: "Noturno" },
   { v: "v", l: "V", nome: "NVG" },
] as const;

/** O que falta preencher numa OI, na ordem dos campos. */
function faltando(oi: DraftOIItem): string[] {
   const f: string[] = [];
   if (!oi.esf_aer_id) f.push("Esforço Aéreo");
   if (!oi.tipo_missao_id) f.push("Tipo Missão");
   if (!(oi.tvoo > 0)) f.push("Tempo");
   return f;
}

export function OrdensInstrucaoSection({
   oi,
   tvoo,
   esfAerList,
   tiposMissaoList,
   loadingCatalogos,
   showErrors,
}: OrdensInstrucaoSectionProps) {
   const { oiItems, addOiItem, removeOiItem, updateOiItem, oiTotalTvoo } = oi;

   const pendencias = oiItems
      .map((item, i) => ({ num: i + 1, campos: faltando(item) }))
      .filter((p) => p.campos.length > 0);
   const somaDiverge = oiItems.length > 0 && oiTotalTvoo !== tvoo;
   const unica = oiItems.length === 1;

   // "Ajustar a última OI": ela fica com o que sobra do tempo da etapa
   const ultima = oiItems[oiItems.length - 1];
   const restante = ultima && tvoo - (oiTotalTvoo - (ultima.tvoo || 0));

   const selo =
      !somaDiverge && pendencias.length === 0
         ? { txt: "✓ Regular", ok: true }
         : { txt: somaDiverge ? "⚠ Divergente" : "⚠ Incompleta", ok: false };

   return (
      <section className="space-y-3">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               {oiItems.length > 0 && (
                  <span
                     className={clsx(
                        "rounded px-2.5 py-1 text-xs font-bold tracking-wide uppercase",
                        selo.ok
                           ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                           : "bg-amber-100 text-amber-700 ring-1 ring-amber-300"
                     )}
                  >
                     {minutesToTime(oiTotalTvoo)} / {minutesToTime(tvoo)}{" "}
                     {selo.txt}
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
            <div className="flex flex-col items-center gap-1 rounded border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
               <p className="text-sm font-medium text-gray-500">
                  Nenhuma Ordem de Instrução associada
               </p>
               <p className="text-xs text-gray-500">
                  Clique em &quot;Nova OI&quot; se houver registro de
                  treinamento para adicionar à estatística.
               </p>
            </div>
         ) : (
            <div className="space-y-3">
               {oiItems.map((item, i) => (
                  <OiRow
                     key={item.uid}
                     item={item}
                     num={i + 1}
                     unica={unica}
                     showErrors={showErrors}
                     esfAerList={esfAerList}
                     tiposMissaoList={tiposMissaoList}
                     loading={loadingCatalogos}
                     onChange={(patch) => updateOiItem(item.uid, patch)}
                     onRemove={() => removeOiItem(item.uid)}
                  />
               ))}

               {/* Soma divergente: sempre visível, é o que trava o salvar.
                   Campos faltando: só depois de um salvar recusado, para a
                   OI recém-adicionada não nascer gritando. */}
               {((somaDiverge && tvoo > 0) ||
                  (showErrors && pendencias.length > 0)) && (
                  <div
                     role="alert"
                     className="space-y-1 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                     {somaDiverge && tvoo > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                           <p>
                              A soma das OIs (
                              <strong>{minutesToTime(oiTotalTvoo)}</strong>) não
                              coincide com o tempo da etapa (
                              <strong>{minutesToTime(tvoo)}</strong>).
                           </p>
                           {!unica && ultima && restante > 0 && (
                              <Button
                                 type="button"
                                 size="xs"
                                 color="light"
                                 onClick={() =>
                                    updateOiItem(ultima.uid, {
                                       tvoo: restante,
                                    })
                                 }
                              >
                                 Ajustar a OI {oiItems.length} para{" "}
                                 {minutesToTime(restante)}
                              </Button>
                           )}
                        </div>
                     )}
                     {showErrors &&
                        pendencias.map((p) => (
                           <p key={p.num}>
                              OI {p.num}: falta {p.campos.join(", ")}.
                           </p>
                        ))}
                  </div>
               )}
            </div>
         )}
      </section>
   );
}

interface OiRowProps {
   item: DraftOIItem;
   num: number;
   unica: boolean;
   showErrors: boolean;
   esfAerList: Array<{ id: number; descricao: string }>;
   tiposMissaoList: Array<{ id: number; cod: string; desc: string }>;
   loading: boolean;
   onChange: (patch: Partial<DraftOIItem>) => void;
   onRemove: () => void;
}

function OiRow({
   item,
   num,
   unica,
   showErrors,
   esfAerList,
   tiposMissaoList,
   loading,
   onChange,
   onRemove,
}: OiRowProps) {
   const id = useId();

   return (
      <div className="relative grid grid-cols-2 items-end gap-3 border border-gray-200 bg-white p-3 pr-10 shadow-sm sm:grid-cols-[1fr_1fr_auto_80px_auto] sm:pr-4">
         {/* Esforço Aéreo */}
         <div className="col-span-2 flex flex-col text-left sm:col-span-1">
            <Label htmlFor={`${id}-esf`} className={fieldLabelClass}>
               Esforço Aéreo
            </Label>
            <SearchableSelect
               id={`${id}-esf`}
               options={esfAerList.map((e) => ({
                  value: String(e.id),
                  label: e.descricao,
               }))}
               value={item.esf_aer_id ? String(item.esf_aer_id) : ""}
               onChange={(val) =>
                  onChange({ esf_aer_id: val ? Number(val) : null })
               }
               placeholder="Buscar Esforço..."
               sizing="sm"
               invalid={showErrors && !item.esf_aer_id}
               loading={loading}
            />
         </div>
         {/* Tipo Missão */}
         <div className="col-span-2 flex flex-col text-left sm:col-span-1">
            <Label htmlFor={`${id}-tipo`} className={fieldLabelClass}>
               Tipo Missão
            </Label>
            <SearchableSelect
               id={`${id}-tipo`}
               options={tiposMissaoList.map((t) => ({
                  value: String(t.id),
                  label: `${t.cod} - ${t.desc}`,
               }))}
               value={item.tipo_missao_id ? String(item.tipo_missao_id) : ""}
               onChange={(val) =>
                  onChange({ tipo_missao_id: val ? Number(val) : null })
               }
               placeholder="Buscar Sigla..."
               sizing="sm"
               invalid={showErrors && !item.tipo_missao_id}
               loading={loading}
            />
         </div>
         {/* Regime */}
         <div className="flex flex-col text-left">
            <Label
               id={`${id}-reg`}
               className={clsx(fieldLabelClass, "whitespace-nowrap")}
            >
               Regime
            </Label>
            <div
               role="group"
               aria-labelledby={`${id}-reg`}
               className="flex h-8.5 overflow-hidden rounded border border-gray-300"
            >
               {REGIMES.map(({ v, l, nome }) => (
                  <button
                     key={v}
                     type="button"
                     aria-pressed={item.reg === v}
                     aria-label={nome}
                     title={nome}
                     onClick={() => onChange({ reg: v })}
                     className={clsx(
                        "flex flex-1 items-center justify-center px-3 text-xs font-bold focus:outline-none",
                        item.reg === v
                           ? "bg-primary-800 text-white"
                           : "text-primary-600 hover:bg-primary-100 bg-white",
                        v !== "d" && "border-l border-gray-300"
                     )}
                  >
                     {l}
                  </button>
               ))}
            </div>
         </div>
         {/* Tempo */}
         <div className="flex flex-col text-left">
            <Label
               htmlFor={`${id}-tempo`}
               className={clsx(fieldLabelClass, "whitespace-nowrap")}
            >
               {unica ? "Tempo (etapa)" : "Tempo"}
            </Label>
            <OiTempoInput
               id={`${id}-tempo`}
               value={item.tvoo}
               onChange={(tvoo) => onChange({ tvoo })}
               readOnly={unica}
               invalid={showErrors && !(item.tvoo > 0)}
            />
         </div>
         {/* Excluir — absoluto no canto em mobile, coluna própria em sm+ */}
         <div className="absolute top-2 right-1.5 sm:static sm:flex sm:h-full sm:items-center sm:justify-center sm:pb-1">
            <button
               type="button"
               onClick={onRemove}
               className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600"
               title="Remover OI"
               aria-label={`Remover Ordem de Instrução ${num}`}
            >
               <HiX className="h-5 w-5" />
            </button>
         </div>
      </div>
   );
}
