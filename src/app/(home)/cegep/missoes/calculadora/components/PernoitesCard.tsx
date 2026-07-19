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
} from "flowbite-react";
import { HiInformationCircle, HiPlus, HiX } from "react-icons/hi";
import { Pernoite } from "services/routes/cegep/missoes";
import { CidadeInlineSearch } from "./CidadeInlineSearch";

interface PernoitesCardProps {
   pnts: Pernoite[];
   setPnts: React.Dispatch<React.SetStateAction<Pernoite[]>>;
   /** Índices com conflito de data (fim<início ou sobreposição), do hook. */
   invalidIdx: Set<number>;
}

// Pernoites são uma cadeia sequencial: o início de cada perna é o fim da
// anterior (derivado, não editável) — só o 1º tem início livre. Isso mantém
// a ordem automaticamente e evita sobreposição por construção.
function encadear(list: Pernoite[]): Pernoite[] {
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

         {pnts.length > 0 && (
            <div className="overflow-x-auto">
               <Table>
                  <TableHead>
                     <TableRow>
                        <TableHeadCell className="px-2 py-1.5">
                           Início
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
                        <TableHeadCell className="px-2 py-1.5 text-center">
                           +R$95
                        </TableHeadCell>
                        <TableHeadCell className="px-2 py-1.5" />
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {pnts.map((pnt, idx) => {
                        const isInvalid = invalidIdx.has(idx);
                        return (
                           <TableRow key={idx} className="bg-white">
                              <TableCell className="px-2 py-1.5">
                                 <TextInput
                                    sizing="sm"
                                    type="date"
                                    value={pnt.data_ini}
                                    // Só o 1º pernoite tem início livre; os
                                    // demais herdam o fim do anterior.
                                    disabled={idx > 0}
                                    title={
                                       idx > 0
                                          ? "Início herdado do fim do pernoite anterior"
                                          : undefined
                                    }
                                    color={isInvalid ? "failure" : "gray"}
                                    onChange={(e) =>
                                       updateRow(idx, {
                                          data_ini: e.target.value,
                                       })
                                    }
                                 />
                              </TableCell>
                              <TableCell className="px-2 py-1.5">
                                 <TextInput
                                    sizing="sm"
                                    type="date"
                                    value={pnt.data_fim}
                                    // Barreira: fim nunca antes do início.
                                    min={pnt.data_ini || undefined}
                                    color={isInvalid ? "failure" : "gray"}
                                    onChange={(e) =>
                                       updateRow(idx, {
                                          data_fim: e.target.value,
                                       })
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
                                    <Checkbox
                                       color="yellow"
                                       className="pointer-coarse:size-5"
                                       checked={pnt.meia_diaria}
                                       onChange={(e) =>
                                          updateRow(idx, {
                                             meia_diaria: e.target.checked,
                                          })
                                       }
                                       aria-label="Meia diária"
                                    />
                                 </div>
                              </TableCell>
                              <TableCell className="px-2 py-1.5 text-center">
                                 <div className="flex justify-center">
                                    <Checkbox
                                       color="green"
                                       className="pointer-coarse:size-5"
                                       checked={pnt.acrec_desloc}
                                       onChange={(e) =>
                                          updateRow(idx, {
                                             acrec_desloc: e.target.checked,
                                          })
                                       }
                                       aria-label="Acréscimo deslocamento"
                                    />
                                 </div>
                              </TableCell>
                              <TableCell className="px-2 py-1.5 text-center">
                                 <button
                                    type="button"
                                    onClick={() => removeRow(idx)}
                                    className="rounded p-1 text-red-500 hover:bg-red-50"
                                    title="Remover pernoite"
                                    aria-label="Remover pernoite"
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

         {invalidIdx.size > 0 && (
            <p className="mt-2 text-xs text-red-600">
               Há pernoites com data de fim anterior ao início ou sobrepostos —
               ajuste antes de calcular.
            </p>
         )}

         {temIncompleto && invalidIdx.size === 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
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
