import { useEffect, useRef } from "react";
import {
   Popover,
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import clsx from "clsx";
import { minutesToTime } from "@/../utils/dateHandler";
import type { EsfAerResumoItem } from "services/routes/estatistica/esfAer";
import { MONTH_LABELS } from "../constants";
import {
   formatMinutes,
   getDescricaoStyles,
   type FocoDivergencia,
} from "../utils";
import { DivergenciaPopoverContent } from "./DivergenciaPopoverContent";

interface EsfAerTableProps {
   items: EsfAerResumoItem[];
   totalAlocado: number;
   totalVoado: number;
   totalSaldo: number;
   totalMesesVoados: number[];
   foco: FocoDivergencia | null;
   /**
    * Chamado ao fechar o popover. `devolverFoco` é true só no fechamento por
    * teclado (Esc); no clique fora o foco fica onde o usuário clicou.
    */
   onFecharFoco: (devolverFoco: boolean) => void;
   /** Destaca em âmbar claro toda célula de mês que diverge da SAGEM. */
   destacarDivergencias?: boolean;
}

export function EsfAerTable({
   items,
   totalAlocado,
   totalVoado,
   totalSaldo,
   totalMesesVoados,
   foco,
   onFecharFoco,
   destacarDivergencias = false,
}: EsfAerTableProps) {
   // Ref no wrapper externo, nunca no filho do Popover: o Popover clona o filho
   // com o ref da âncora e um ref nosso o sobrescreveria (ver
   // docs/ai/notes/frontend-armadilhas.md).
   const wrapperRef = useRef<HTMLDivElement>(null);

   // `foco` é um objeto novo a cada pedido de localização, então clicar de novo
   // na mesma linha do painel rola outra vez.
   useEffect(() => {
      if (!foco) return;
      const celula = wrapperRef.current?.querySelector(
         `[data-divergencia="${foco.esfaerId}-${foco.mes}"]`
      );
      const reduzMovimento = window.matchMedia(
         "(prefers-reduced-motion: reduce)"
      ).matches;
      celula?.scrollIntoView({
         behavior: reduzMovimento ? "auto" : "smooth",
         block: "center",
         inline: "center",
      });
   }, [foco]);

   return (
      <div
         ref={wrapperRef}
         className="w-full overflow-x-auto rounded border border-slate-200 bg-white font-mono"
      >
         <Table
            striped
            theme={{
               root: { base: "text-sm text-center" },
               body: { cell: { base: "p-2" } },
               head: {
                  cell: {
                     base: "p-2 bg-slate-100 border-b border-slate-300 text-sm",
                  },
               },
            }}
         >
            <TableHead>
               <TableRow>
                  <TableHeadCell>Esforço Aéreo</TableHeadCell>
                  <TableHeadCell>ALOCADO</TableHeadCell>
                  <TableHeadCell>VOADO</TableHeadCell>
                  <TableHeadCell className="border-r border-slate-300">
                     SALDO
                  </TableHeadCell>
                  {MONTH_LABELS.map((m) => (
                     <TableHeadCell key={m}>{m}</TableHeadCell>
                  ))}
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-200">
                     <TableCell className={getDescricaoStyles(item.descricao)}>
                        {item.descricao}
                     </TableCell>
                     <TableCell className="font-semibold text-slate-600">
                        {minutesToTime(item.alocado)}
                     </TableCell>
                     <TableCell
                        className={clsx({
                           "text-slate-300": item.voado === 0,
                        })}
                     >
                        {minutesToTime(item.voado)}
                     </TableCell>
                     <TableCell
                        className={clsx(
                           "border-r border-slate-300 font-semibold text-slate-800",
                           {
                              "text-green-600": item.saldo > 0,
                              "text-red-600": item.saldo < 0,
                              "text-slate-600": item.saldo === 0,
                           }
                        )}
                     >
                        {formatMinutes(item.saldo)}
                     </TableCell>
                     {item.meses_voados.map((val, i) => {
                        const focada =
                           foco?.esfaerId === item.id && foco.mes === i;
                        const diverge =
                           destacarDivergencias && val !== item.meses_sagem[i];
                        return (
                           <TableCell
                              key={MONTH_LABELS[i]}
                              data-divergencia={`${item.id}-${i}`}
                              className={clsx(
                                 "text-slate-300",
                                 { "font-bold text-slate-500": val > 0 },
                                 // Fundo na célula (o twMerge do TableCell vence
                                 // striped e hover da linha). A focada, mais forte,
                                 // vem depois e prevalece.
                                 diverge && "bg-amber-100",
                                 focada &&
                                    "bg-amber-200 font-bold text-slate-700 ring-2 ring-amber-500 ring-inset"
                              )}
                           >
                              {focada ? (
                                 <Popover
                                    open
                                    aria-label={`Divergência de ${item.descricao} em ${MONTH_LABELS[i]}`}
                                    onOpenChange={(
                                       aberto,
                                       _evento?: Event,
                                       motivo?: string
                                    ) => {
                                       if (aberto === false)
                                          onFecharFoco(motivo === "escape-key");
                                    }}
                                    trigger="click"
                                    placement="auto"
                                    content={
                                       <DivergenciaPopoverContent
                                          descricao={item.descricao}
                                          mes={i}
                                          sagem={item.meses_sagem[i]}
                                          voado={val}
                                       />
                                    }
                                 >
                                    <span className="cursor-pointer">
                                       {minutesToTime(val)}
                                    </span>
                                 </Popover>
                              ) : (
                                 minutesToTime(val)
                              )}
                           </TableCell>
                        );
                     })}
                  </TableRow>
               ))}

               {/* Footer / Total row */}
               <TableRow className="font-semibold text-slate-800">
                  <TableCell className="bg-slate-300">TOTAL</TableCell>
                  <TableCell className="bg-slate-300">
                     {minutesToTime(totalAlocado)}
                  </TableCell>
                  <TableCell className="bg-slate-300">
                     {minutesToTime(totalVoado)}
                  </TableCell>
                  <TableCell className="border-r border-slate-300 bg-slate-300">
                     {formatMinutes(totalSaldo)}
                  </TableCell>
                  {totalMesesVoados.map((val, i) => (
                     <TableCell key={MONTH_LABELS[i]} className="bg-slate-300">
                        {minutesToTime(val)}
                     </TableCell>
                  ))}
               </TableRow>
            </TableBody>
         </Table>
      </div>
   );
}
