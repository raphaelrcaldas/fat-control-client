"use client";

import { useState } from "react";
import {
   Button,
   Select,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   TextInput,
} from "flowbite-react";
import { HiMinus, HiPlus, HiX } from "react-icons/hi";
import { postoGradRecords } from "@/constants/militar/postos";
import { SITUACAO_CONFIG } from "@/constants/cegep/situacoes";
import {
   MAX_QTD_MILITARES,
   SituacaoSimulacao,
} from "services/routes/cegep/missoes";
import { CombinacaoRow } from "../hooks/useSimulacao";

// Comissionado ('c') fica de fora da calculadora — planejamento rápido usa só
// diária e gratificação de representação.
const SIT_OPTIONS: { value: SituacaoSimulacao; label: string }[] = (
   ["d", "g"] as const
).map((v) => ({ value: v, label: SITUACAO_CONFIG[v].label }));

interface CombinacoesCardProps {
   combinacoes: CombinacaoRow[];
   setCombinacoes: React.Dispatch<React.SetStateAction<CombinacaoRow[]>>;
   /** Índices cujo par (p_g, sit) se repete em outra linha, do hook. */
   duplicateIdx: Set<number>;
}

export function CombinacoesCard({
   combinacoes,
   setCombinacoes,
   duplicateIdx,
}: CombinacoesCardProps) {
   function addRow() {
      const usedKeys = new Set(combinacoes.map((c) => `${c.p_g}|${c.sit}`));
      const firstFree = postoGradRecords
         .flatMap((pg) => SIT_OPTIONS.map((s) => `${pg.short}|${s.value}`))
         .find((key) => !usedKeys.has(key));
      const [p_g, sit] = (firstFree ?? `${postoGradRecords[0].short}|d`).split(
         "|"
      ) as [string, SituacaoSimulacao];
      setCombinacoes((prev) => [
         ...prev,
         { _key: crypto.randomUUID(), p_g, sit, qtd: 1 },
      ]);
   }

   function updateRow(index: number, patch: Partial<CombinacaoRow>) {
      setCombinacoes((prev) =>
         prev.map((c, i) => (i === index ? { ...c, ...patch } : c))
      );
   }

   function removeRow(index: number) {
      setCombinacoes((prev) => prev.filter((_, i) => i !== index));
   }

   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
               Militares
            </p>
            <button
               type="button"
               onClick={addRow}
               className="group text-primary-600 hover:text-primary-700 flex items-center gap-1.5 text-sm font-semibold transition-all pointer-coarse:min-h-[44px]"
            >
               <HiPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
               adicionar
            </button>
         </div>

         {combinacoes.length > 0 && (
            <div className="overflow-x-auto">
               <Table>
                  <TableHead>
                     <TableRow>
                        <TableHeadCell className="px-2 py-1.5">
                           Posto/Grad
                        </TableHeadCell>
                        <TableHeadCell className="px-2 py-1.5">
                           Situação
                        </TableHeadCell>
                        <TableHeadCell className="px-2 py-1.5 text-center">
                           Qtd
                        </TableHeadCell>
                        <TableHeadCell className="px-2 py-1.5" />
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {combinacoes.map((c, idx) => {
                        const isDuplicate = duplicateIdx.has(idx);
                        return (
                           <TableRow key={c._key} className="bg-white">
                              <TableCell className="px-2 py-1.5">
                                 <Select
                                    sizing="sm"
                                    value={c.p_g}
                                    color={isDuplicate ? "failure" : "gray"}
                                    onChange={(e) =>
                                       updateRow(idx, { p_g: e.target.value })
                                    }
                                 >
                                    {postoGradRecords.map((pg) => (
                                       <option key={pg.short} value={pg.short}>
                                          {pg.mid}
                                       </option>
                                    ))}
                                 </Select>
                              </TableCell>
                              <TableCell className="px-2 py-1.5">
                                 <Select
                                    sizing="sm"
                                    value={c.sit}
                                    color={isDuplicate ? "failure" : "gray"}
                                    onChange={(e) =>
                                       updateRow(idx, {
                                          sit: e.target
                                             .value as SituacaoSimulacao,
                                       })
                                    }
                                 >
                                    {SIT_OPTIONS.map((s) => (
                                       <option key={s.value} value={s.value}>
                                          {s.label}
                                       </option>
                                    ))}
                                 </Select>
                              </TableCell>
                              <TableCell className="px-2 py-1.5">
                                 <QtdInput
                                    qtd={c.qtd}
                                    onChange={(qtd) => updateRow(idx, { qtd })}
                                 />
                              </TableCell>
                              <TableCell className="px-2 py-1.5 text-center">
                                 <button
                                    type="button"
                                    onClick={() => removeRow(idx)}
                                    className="rounded p-1 text-red-500 hover:bg-red-50"
                                    title="Remover militar"
                                    aria-label="Remover militar"
                                 >
                                    <HiX className="h-4 w-4" />
                                 </button>
                              </TableCell>
                           </TableRow>
                        );
                     })}
                  </TableBody>
               </Table>
            </div>
         )}

         {duplicateIdx.size > 0 && (
            <p className="mt-2 text-xs text-red-600">
               Há combinações de Posto/Grad + Situação repetidas — ajuste antes
               de calcular.
            </p>
         )}
      </div>
   );
}

/**
 * Input de quantidade da linha: digitação livre (estado local em string) com
 * commit clampado em [1, MAX_QTD_MILITARES] no blur/Enter — evita propagar
 * NaN ou valores fora do range enquanto o usuário ainda está digitando.
 */
function QtdInput({
   qtd,
   onChange,
}: {
   qtd: number;
   onChange: (qtd: number) => void;
}) {
   const [draft, setDraft] = useState<string | null>(null);

   function commit() {
      if (draft === null) return;
      const parsed = parseInt(draft, 10);
      const clamped = Number.isNaN(parsed)
         ? qtd
         : Math.min(MAX_QTD_MILITARES, Math.max(1, parsed));
      setDraft(null);
      if (clamped !== qtd) onChange(clamped);
   }

   return (
      <div className="flex items-center justify-center gap-1.5">
         <Button
            size="xs"
            color="light"
            disabled={qtd <= 1}
            onClick={() => onChange(Math.max(1, qtd - 1))}
            aria-label="Diminuir quantidade"
         >
            <HiMinus className="h-3 w-3" />
         </Button>
         <TextInput
            sizing="sm"
            type="text"
            inputMode="numeric"
            className="w-12 text-center [&_input]:px-1 [&_input]:text-center"
            value={draft ?? String(qtd)}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
               if (e.key === "Enter") {
                  commit();
                  e.currentTarget.blur();
               }
            }}
            aria-label="Quantidade"
         />
         <Button
            size="xs"
            color="light"
            disabled={qtd >= MAX_QTD_MILITARES}
            onClick={() => onChange(Math.min(MAX_QTD_MILITARES, qtd + 1))}
            aria-label="Aumentar quantidade"
         >
            <HiPlus className="h-3 w-3" />
         </Button>
      </div>
   );
}
