"use client";

import { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import clsx from "clsx";
import {
   Button,
   Modal,
   ModalBody,
   ModalHeader,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   Spinner,
} from "flowbite-react";
import { TbDownload } from "react-icons/tb";
import {
   formatDiaSemana,
   minutesToTime,
   nowDateTimeBR,
   todayIso,
} from "@/../utils/dateHandler";
import { formatSignedMinutes } from "../../utils";
import { buildExtrato, type ExtratoLinha } from "../utils";
import { useDomScreenshot } from "../../hooks/useDomScreenshot";
import type { HistPrograma } from "services/routes/estatistica/esfAer";

interface ExtratoModalProps {
   show: boolean;
   onClose: () => void;
   anoRef: number;
   /** Programas que estão no gráfico (marcados no rail, ou só o isolado). */
   programas: HistPrograma[];
   /** Cores por programa — as mesmas do gráfico e do rail. */
   programColors: Map<number, string>;
}

/** Cor da variação: verde aumento, vermelho redução, cinza zero (AA a 12px). */
function variacaoColor(v: number): string {
   if (v === 0) return "text-slate-500";
   return v > 0 ? "text-green-700" : "text-red-700";
}

/** Célula numérica: monoespaçada, alinhada à direita. */
const NUM = "text-right font-mono tabular-nums whitespace-nowrap";

/**
 * Extrato das alterações de alocação dos programas selecionados, em padrão
 * relatório: uma tabela (Programa · Anterior · Novo · Variação) em blocos por
 * dia, cada um aberto pela data (ver `buildExtrato`).
 *
 * A primeira linha de um programa que já valia em 1º/jan é a BASE: sem
 * anterior e sem variação, porque não houve mudança a relatar.
 */
export function ExtratoModal({
   show,
   onClose,
   anoRef,
   programas,
   programColors,
}: ExtratoModalProps) {
   const linhas = useMemo(() => buildExtrato(programas), [programas]);
   const lancamentos = linhas.filter((l) => l.tipo !== "base").length;

   // Blocos por dia — `linhas` já vem em ordem de data, então basta cortar
   // quando a data muda.
   const dias = useMemo(() => {
      const blocos: { data: string; linhas: ExtratoLinha[] }[] = [];
      for (const l of linhas) {
         const ultimo = blocos[blocos.length - 1];
         if (ultimo?.data === l.data) ultimo.linhas.push(l);
         else blocos.push({ data: l.data, linhas: [l] });
      }
      return blocos;
   }, [linhas]);

   /**
    * Download como PNG. A área capturada é o relatório (cabeçalho + tabela);
    * o botão fica fora dela. Durante a captura, `emitidoEm` liga o cabeçalho
    * do relatório (título e carimbo, que na tela já estão no ModalHeader) e
    * solta o `max-h` da tabela — senão a imagem sairia cortada no recorte do
    * scroll. `flushSync` garante o DOM atualizado antes de clonar.
    */
   const reportRef = useRef<HTMLDivElement>(null);
   const { capture, isCapturing } = useDomScreenshot();
   const [emitidoEm, setEmitidoEm] = useState<string | null>(null);
   const exportando = emitidoEm !== null;

   const handleDownload = async () => {
      flushSync(() => setEmitidoEm(nowDateTimeBR()));
      try {
         await capture(
            reportRef.current,
            `esfaer-extrato-${anoRef}-${todayIso()}.png`
         );
      } finally {
         setEmitidoEm(null);
      }
   };

   const resumo = (
      <>
         <strong className="font-semibold text-slate-700 tabular-nums">
            {programas.length}
         </strong>{" "}
         {programas.length === 1 ? "programa" : "programas"} ·{" "}
         <strong className="font-semibold text-slate-700 tabular-nums">
            {lancamentos}
         </strong>{" "}
         {lancamentos === 1 ? "lançamento" : "lançamentos"}
      </>
   );

   return (
      <Modal show={show} size="4xl" onClose={onClose} dismissible>
         <ModalHeader>Extrato de alocações · {anoRef}</ModalHeader>
         <ModalBody className="space-y-3">
            <div className="flex items-center justify-between gap-3">
               <p className="text-sm text-slate-500">{resumo}</p>
               <Button
                  color="light"
                  size="xs"
                  onClick={handleDownload}
                  disabled={isCapturing || linhas.length === 0}
                  aria-busy={isCapturing}
               >
                  {isCapturing ? (
                     <Spinner
                        size="sm"
                        color="primary"
                        className="mr-1.5 h-3.5 w-3.5"
                     />
                  ) : (
                     <TbDownload className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {isCapturing ? "Gerando imagem..." : "Baixar imagem"}
               </Button>
            </div>

            {/* Área capturada no download. Na tela é só a tabela; ao
                exportar ganha margem e o cabeçalho do relatório. */}
            <div
               ref={reportRef}
               className={clsx(exportando && "space-y-3 bg-white p-4")}
            >
               {exportando && (
                  <div className="flex items-end justify-between gap-4">
                     <div>
                        <p className="text-base font-bold text-slate-900">
                           Extrato de alocações · {anoRef}
                        </p>
                        <p className="text-sm text-slate-500">{resumo}</p>
                     </div>
                     <p className="shrink-0 text-xs whitespace-nowrap text-slate-500">
                        Emitido em {emitidoEm}
                     </p>
                  </div>
               )}

               {/* O scroll é deste contêiner, não do wrapper da Table (que é só
                `relative`): é ele que o cabeçalho `sticky` acompanha. Sem teto
                durante a exportação — a imagem leva a tabela inteira. */}
               <div
                  className={clsx(
                     "rounded border border-slate-200",
                     // Na imagem, 2px de folga: o clone arredonda as posições
                     // fracionárias da tabela e cortava a borda inferior.
                     exportando ? "pb-[2px]" : "max-h-[60vh] overflow-auto"
                  )}
               >
                  <Table>
                     <TableHead className="sticky top-0 z-10 shadow-[inset_0_-1px_0_var(--color-slate-200)]">
                        <TableRow>
                           <TableHeadCell>Programa</TableHeadCell>
                           <TableHeadCell className="text-right">
                              Anterior
                           </TableHeadCell>
                           <TableHeadCell className="text-right">
                              Novo
                           </TableHeadCell>
                           <TableHeadCell className="text-right">
                              Variação
                           </TableHeadCell>
                        </TableRow>
                     </TableHead>
                     {/* Um `TableBody` por dia: o bloco abre com a data e a borda
                      forte no topo separa um dia do outro — dentro do dia, só
                      a divisória fina entre lançamentos. */}
                     {dias.map((dia, i) => (
                        <TableBody
                           key={dia.data}
                           className={clsx(
                              "divide-y divide-slate-100",
                              i > 0 && "border-t-2 border-slate-400"
                           )}
                        >
                           <TableRow className="bg-slate-50">
                              <TableCell
                                 colSpan={4}
                                 className="py-1.5 text-xs font-semibold text-slate-700"
                              >
                                 {formatDiaSemana(dia.data)}
                              </TableCell>
                           </TableRow>
                           {dia.linhas.map((l) => (
                              <TableRow key={l.key}>
                                 <TableCell className="w-full max-w-0">
                                    <span className="flex min-w-0 items-center gap-2">
                                       <span
                                          aria-hidden
                                          className="h-2 w-2 shrink-0 rounded-full"
                                          style={{
                                             backgroundColor: programColors.get(
                                                l.esfaer_id
                                             ),
                                          }}
                                       />
                                       <span
                                          className="truncate font-medium text-slate-900"
                                          title={`${l.grupo} · ${l.nome}`}
                                       >
                                          {/* Grupo na própria string do programa
                                              (não em coluna): "COMPREP · SESQAE". */}
                                          <span className="text-slate-500">
                                             {l.grupo} ·{" "}
                                          </span>
                                          {l.nome}
                                       </span>
                                       {l.tipo !== "alteracao" && (
                                          <span className="shrink-0 text-xs whitespace-nowrap text-slate-500">
                                             {l.tipo === "base"
                                                ? "valor inicial"
                                                : "criação"}
                                          </span>
                                       )}
                                    </span>
                                 </TableCell>
                                 <TableCell
                                    className={clsx(NUM, "text-slate-600")}
                                 >
                                    {l.anterior === null
                                       ? "—"
                                       : minutesToTime(l.anterior)}
                                 </TableCell>
                                 <TableCell
                                    className={clsx(
                                       NUM,
                                       "font-semibold text-slate-900"
                                    )}
                                 >
                                    {minutesToTime(l.novo)}
                                 </TableCell>
                                 <TableCell
                                    className={clsx(
                                       NUM,
                                       l.variacao === null
                                          ? "text-slate-500"
                                          : variacaoColor(l.variacao)
                                    )}
                                 >
                                    {l.variacao === null
                                       ? "—"
                                       : formatSignedMinutes(l.variacao)}
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     ))}
                  </Table>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
