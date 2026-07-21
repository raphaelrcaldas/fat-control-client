"use client";

import {
   Checkbox,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   TextInput,
   Tooltip,
} from "flowbite-react";
import { HiInformationCircle, HiLink, HiPlus, HiX } from "react-icons/hi";
import { Pernoite } from "services/routes/cegep/missoes";
import { CidadeInlineSearch } from "./CidadeInlineSearch";
import { PernoiteRow } from "../hooks/useSimulacao";

interface PernoitesCardProps {
   pnts: PernoiteRow[];
   setPnts: React.Dispatch<React.SetStateAction<PernoiteRow[]>>;
   /** Índices com conflito de data (fim<início ou sobreposição), do hook. */
   invalidIdx: Set<number>;
}

// Pernoites são uma cadeia sequencial: o início de cada perna é o fim da
// anterior (derivado, não editável) — só o 1º tem início livre. Isso mantém
// a ordem automaticamente e evita sobreposição por construção.
function encadear(list: PernoiteRow[]): PernoiteRow[] {
   return list.map((p, i) =>
      i === 0 ? p : { ...p, data_ini: list[i - 1].data_fim }
   );
}

// Falta cidade ou alguma das datas para o pernoite entrar no cálculo.
function pernoiteIncompleto(p: Pernoite): boolean {
   return p.cidade_id === 0 || !p.data_ini || !p.data_fim;
}

export function PernoitesCard({
   pnts,
   setPnts,
   invalidIdx,
}: PernoitesCardProps) {
   const temIncompleto = pnts.some(pernoiteIncompleto);
   function addRow() {
      setPnts((prev) => {
         const anterior = prev[prev.length - 1];
         return [
            ...prev,
            {
               _key: crypto.randomUUID(),
               // Início herda o fim do pernoite anterior (não controlável).
               data_ini: anterior?.data_fim ?? "",
               data_fim: "",
               cidade_id: 0,
               cidade: undefined,
               meia_diaria: false,
               acrec_desloc: false,
               obs: "",
            },
         ];
      });
   }

   function updateRow(index: number, patch: Partial<Pernoite>) {
      setPnts((prev) =>
         encadear(prev.map((p, i) => (i === index ? { ...p, ...patch } : p)))
      );
   }

   function removeRow(index: number) {
      setPnts((prev) => encadear(prev.filter((_, i) => i !== index)));
   }

   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
               Pernoites
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

         {/* Desktop/tablet largo: tabela densa (só a partir de md). */}
         {pnts.length > 0 && (
            <div className="hidden overflow-x-auto md:block">
               <Table>
                  <TableHead>
                     <TableRow>
                        <TableHeadCell className="px-2 py-1.5">
                           <span className="flex items-center gap-1">
                              Início
                              <Tooltip content="Só o 1º início é livre — os demais herdam o fim do pernoite anterior">
                                 <HiInformationCircle className="h-3.5 w-3.5 text-slate-400" />
                              </Tooltip>
                           </span>
                        </TableHeadCell>
                        <TableHeadCell className="px-2 py-1.5">
                           Fim
                        </TableHeadCell>
                        <TableHeadCell className="px-2 py-1.5">
                           Cidade
                        </TableHeadCell>
                        <TableHeadCell className="px-2 py-1.5 text-center">
                           ½ diária
                        </TableHeadCell>
                        <TableHeadCell
                           className="px-2 py-1.5 text-center"
                           title="Acréscimo de deslocamento"
                        >
                           Acrésc.
                        </TableHeadCell>
                        <TableHeadCell className="px-2 py-1.5">
                           <span className="sr-only">Ações</span>
                        </TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {pnts.map((pnt, idx) => {
                        const isInvalid = invalidIdx.has(idx);
                        return (
                           <TableRow key={pnt._key} className="bg-white">
                              <TableCell className="px-2 py-1.5">
                                 <DataIniInput
                                    idx={idx}
                                    value={pnt.data_ini}
                                    isInvalid={isInvalid}
                                    onChange={(data_ini) =>
                                       updateRow(idx, { data_ini })
                                    }
                                 />
                              </TableCell>
                              <TableCell className="px-2 py-1.5">
                                 <DataFimInput
                                    value={pnt.data_fim}
                                    minDate={pnt.data_ini}
                                    isInvalid={isInvalid}
                                    onChange={(data_fim) =>
                                       updateRow(idx, { data_fim })
                                    }
                                 />
                              </TableCell>
                              <TableCell className="px-2 py-1.5">
                                 <CidadeInlineSearch
                                    value={pnt.cidade}
                                    onSelect={(c) =>
                                       updateRow(idx, {
                                          cidade_id: c.codigo,
                                          cidade: c,
                                       })
                                    }
                                    className="min-w-48"
                                 />
                              </TableCell>
                              <TableCell className="px-2 py-1.5 text-center">
                                 <div className="flex justify-center">
                                    <ToggleCheckbox
                                       color="yellow"
                                       checked={pnt.meia_diaria}
                                       onChange={(meia_diaria) =>
                                          updateRow(idx, { meia_diaria })
                                       }
                                       ariaLabel="Meia diária"
                                    />
                                 </div>
                              </TableCell>
                              <TableCell className="px-2 py-1.5 text-center">
                                 <div className="flex justify-center">
                                    <ToggleCheckbox
                                       color="green"
                                       checked={pnt.acrec_desloc}
                                       onChange={(acrec_desloc) =>
                                          updateRow(idx, { acrec_desloc })
                                       }
                                       ariaLabel="Acréscimo deslocamento"
                                    />
                                 </div>
                              </TableCell>
                              <TableCell className="px-2 py-1.5 text-center">
                                 <RemoveButton onClick={() => removeRow(idx)} />
                              </TableCell>
                           </TableRow>
                        );
                     })}
                  </TableBody>
               </Table>
            </div>
         )}

         {/* Mobile: cada pernoite vira um mini-card empilhado, sem scroll
             horizontal escondido. */}
         {pnts.length > 0 && (
            <ul className="space-y-3 md:hidden">
               {pnts.map((pnt, idx) => {
                  const isInvalid = invalidIdx.has(idx);
                  return (
                     <li
                        key={pnt._key}
                        className="rounded border border-slate-200 bg-slate-50/60 p-3"
                     >
                        <div className="mb-2 flex items-center justify-between">
                           <span className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">
                              Pernoite {idx + 1}
                           </span>
                           <RemoveButton onClick={() => removeRow(idx)} />
                        </div>

                        <div className="space-y-2">
                           <div>
                              <span className="mb-1 block text-xs font-medium text-slate-600">
                                 Cidade
                              </span>
                              <CidadeInlineSearch
                                 value={pnt.cidade}
                                 onSelect={(c) =>
                                    updateRow(idx, {
                                       cidade_id: c.codigo,
                                       cidade: c,
                                    })
                                 }
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                              <div>
                                 <span className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
                                    Início
                                    {idx > 0 && (
                                       <HiLink className="h-3 w-3 text-slate-400" />
                                    )}
                                 </span>
                                 <DataIniInput
                                    idx={idx}
                                    value={pnt.data_ini}
                                    isInvalid={isInvalid}
                                    onChange={(data_ini) =>
                                       updateRow(idx, { data_ini })
                                    }
                                 />
                              </div>
                              <div>
                                 <span className="mb-1 block text-xs font-medium text-slate-600">
                                    Fim
                                 </span>
                                 <DataFimInput
                                    value={pnt.data_fim}
                                    minDate={pnt.data_ini}
                                    isInvalid={isInvalid}
                                    onChange={(data_fim) =>
                                       updateRow(idx, { data_fim })
                                    }
                                 />
                              </div>
                           </div>

                           <ToggleRow
                              label="½ diária"
                              color="yellow"
                              checked={pnt.meia_diaria}
                              onChange={(meia_diaria) =>
                                 updateRow(idx, { meia_diaria })
                              }
                           />
                           <ToggleRow
                              label="Acréscimo de deslocamento"
                              color="green"
                              checked={pnt.acrec_desloc}
                              onChange={(acrec_desloc) =>
                                 updateRow(idx, { acrec_desloc })
                              }
                           />
                        </div>
                     </li>
                  );
               })}
            </ul>
         )}

         {invalidIdx.size > 0 && (
            <p className="mt-2 text-xs text-red-600">
               Há pernoites com data de fim anterior ao início ou sobrepostos —
               ajuste antes de calcular.
            </p>
         )}

         {temIncompleto && invalidIdx.size === 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
               <HiInformationCircle className="h-4 w-4 shrink-0" />
               Preencha a cidade e as duas datas de cada pernoite para calcular.
            </p>
         )}

         {pnts.length === 0 && (
            <p className="text-xs text-slate-500">
               Adicione ao menos um pernoite para calcular.
            </p>
         )}
      </div>
   );
}

// Início do pernoite: só o 1º é livre; os demais herdam o fim do anterior
// (bloqueado, com ícone de elo). Compartilhado entre tabela e mini-card.
function DataIniInput({
   idx,
   value,
   isInvalid,
   onChange,
}: {
   idx: number;
   value: string;
   isInvalid: boolean;
   onChange: (value: string) => void;
}) {
   return (
      <TextInput
         sizing="sm"
         type="date"
         value={value}
         disabled={idx > 0}
         icon={idx > 0 ? HiLink : undefined}
         title={
            idx > 0 ? "Início herdado do fim do pernoite anterior" : undefined
         }
         color={isInvalid ? "failure" : "gray"}
         aria-label={idx === 0 ? "Início do pernoite" : undefined}
         onChange={(e) => onChange(e.target.value)}
      />
   );
}

// Fim do pernoite — barreira: nunca antes do início.
function DataFimInput({
   value,
   minDate,
   isInvalid,
   onChange,
}: {
   value: string;
   minDate: string;
   isInvalid: boolean;
   onChange: (value: string) => void;
}) {
   return (
      <TextInput
         sizing="sm"
         type="date"
         value={value}
         min={minDate || undefined}
         color={isInvalid ? "failure" : "gray"}
         aria-label="Fim do pernoite"
         onChange={(e) => onChange(e.target.value)}
      />
   );
}

// Checkbox nu (usado na tabela densa): alvo de toque de 44px só no dedo.
function ToggleCheckbox({
   color,
   checked,
   onChange,
   ariaLabel,
}: {
   color: "yellow" | "green";
   checked: boolean;
   onChange: (checked: boolean) => void;
   ariaLabel: string;
}) {
   return (
      <label className="inline-flex cursor-pointer items-center justify-center pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]">
         <Checkbox
            color={color}
            className="pointer-coarse:size-6"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            aria-label={ariaLabel}
         />
      </label>
   );
}

// Toggle rotulado do mini-card: a linha inteira é o alvo de toque.
function ToggleRow({
   label,
   color,
   checked,
   onChange,
}: {
   label: string;
   color: "yellow" | "green";
   checked: boolean;
   onChange: (checked: boolean) => void;
}) {
   return (
      <label className="flex cursor-pointer items-center justify-between gap-2 pointer-coarse:min-h-[44px]">
         <span className="text-sm text-slate-700">{label}</span>
         <Checkbox
            color={color}
            className="pointer-coarse:size-6"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
         />
      </label>
   );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
   return (
      <button
         type="button"
         onClick={onClick}
         className="flex items-center justify-center rounded p-1 text-red-500 hover:bg-red-50 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
         title="Remover pernoite"
         aria-label="Remover pernoite"
      >
         <HiX className="h-4 w-4" />
      </button>
   );
}
