"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { domToPng } from "modern-screenshot";
import {
   Modal,
   ModalBody,
   ModalHeader,
   Button,
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Spinner,
} from "flowbite-react";
import clsx from "clsx";
import { minutesToTime } from "@/../utils/dateHandler";
import { useUpdateEsfAer } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import {
   parseEsfAerData,
   formatMinutes,
   getDescricaoStyles,
   type EsfAerImportRow,
   type EsfAerParseError,
} from "../utils";
import { MONTH_LABELS } from "../constants";
import type {
   EsfAerUpdateItem,
   EsfAerImportResponse,
} from "services/routes/estatistica/esfAer";

interface ImportModalProps {
   show: boolean;
   setShow: (v: boolean) => void;
   anoRef: number;
}

function toUpdateItems(rows: EsfAerImportRow[]): EsfAerUpdateItem[] {
   return rows.map((r) => ({
      tipo: r.tipo,
      modelo: r.modelo,
      grupo: r.grupo,
      programa: r.programa,
      subprograma: r.subprograma,
      aplicacao: r.aplicacao,
      horas_alocadas: r.horasAlocadas,
      meses_sagem: r.meses,
   }));
}

function formatDiff(value: number): string {
   if (value === 0) return minutesToTime(0);
   const sign = value > 0 ? "+" : "-";
   return `${sign}${minutesToTime(Math.abs(value))}`;
}

export function ImportModal({ show, setShow, anoRef }: ImportModalProps) {
   const [rawText, setRawText] = useState("");
   const [parsedRows, setParsedRows] = useState<EsfAerImportRow[]>([]);
   const [errors, setErrors] = useState<EsfAerParseError[]>([]);
   const [showConfirm, setShowConfirm] = useState(false);
   const [importResult, setImportResult] =
      useState<EsfAerImportResponse | null>(null);
   const gutterRef = useRef<HTMLDivElement>(null);
   const textareaRef = useRef<HTMLTextAreaElement>(null);
   const resultRef = useRef<HTMLDivElement>(null);
   const [isCapturing, setIsCapturing] = useState(false);

   const mutation = useUpdateEsfAer();
   const { push } = useToast();

   const lineCount = Math.max(rawText.split("\n").length, 1);

   const syncScroll = useCallback(() => {
      if (gutterRef.current && textareaRef.current) {
         gutterRef.current.scrollTop = textareaRef.current.scrollTop;
      }
   }, []);

   const resetState = () => {
      setRawText("");
      setParsedRows([]);
      setErrors([]);
      setShowConfirm(false);
      setImportResult(null);
   };

   const handleClose = () => {
      setShow(false);
      resetState();
   };

   const handleParse = () => {
      const result = parseEsfAerData(rawText);
      setParsedRows(result.rows);
      setErrors(result.errors);
   };

   const hasChanges = (res: EsfAerImportResponse) =>
      res.rows.some((r) => r.antes !== r.depois);

   const handleConfirmSend = async () => {
      try {
         const result = await mutation.mutateAsync({
            ano_ref: anoRef,
            items: toUpdateItems(parsedRows),
         });
         setImportResult(result);
         setShowConfirm(false);
         setShow(false);
         setRawText("");
         setParsedRows([]);
         setErrors([]);
         if (hasChanges(result)) {
            push({
               message: `Importação concluída para ${anoRef}`,
               type: "success",
            });
         }
      } catch (err: any) {
         push({
            message: err?.message || "Erro ao importar dados",
            type: "error",
         });
         setShowConfirm(false);
      }
   };

   const dateStr = useMemo(() => {
      if (!importResult) return "";
      const now = new Date();
      return `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
   }, [importResult]);

   const handleDownloadImage = async () => {
      if (!resultRef.current || !importResult) return;
      setIsCapturing(true);
      try {
         const dataUrl = await domToPng(resultRef.current, {
            backgroundColor: "#ffffff",
            scale: 2,
         });
         const link = document.createElement("a");
         const today = new Date().toISOString().slice(0, 10);
         link.download = `esfaer-importacao-${importResult.ano_ref}-${today}.png`;
         link.href = dataUrl;
         link.click();
      } catch {
         push({ message: "Erro ao gerar imagem", type: "error" });
      } finally {
         setIsCapturing(false);
      }
   };

   return (
      <>
         <Modal show={show} size="7xl" onClose={handleClose} dismissible>
            <ModalHeader>
               Importar Esforço Aéreo —{" "}
               <span className="rounded bg-red-100 px-2 py-0.5 font-bold text-red-800">
                  {anoRef}
               </span>
            </ModalHeader>
            <ModalBody>
               <div className="space-y-4">
                  <div className="flex overflow-hidden rounded-lg border border-gray-300">
                     <div
                        ref={gutterRef}
                        className="overflow-hidden bg-gray-100 py-2 text-right font-mono text-xs leading-relaxed text-gray-400 select-none"
                     >
                        {Array.from({ length: lineCount }, (_, i) => (
                           <div key={i} className="px-2">
                              {i + 1}
                           </div>
                        ))}
                     </div>
                     <textarea
                        ref={textareaRef}
                        placeholder="Cole aqui os dados copiados da tabela (separados por TAB)..."
                        rows={8}
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        onScroll={syncScroll}
                        className="flex-1 resize-none border-0 py-2 font-mono text-xs leading-relaxed focus:ring-0"
                     />
                  </div>

                  <div className="flex gap-2">
                     <Button
                        color="red"
                        onClick={handleParse}
                        disabled={!rawText.trim()}
                     >
                        Parsear Dados
                     </Button>
                     {parsedRows.length > 0 && errors.length === 0 && (
                        <Button
                           color="green"
                           onClick={() => setShowConfirm(true)}
                        >
                           Enviar
                        </Button>
                     )}
                     {parsedRows.length > 0 && (
                        <span className="self-center text-sm text-gray-500">
                           {parsedRows.length} linha(s) importada(s)
                        </span>
                     )}
                  </div>

                  {errors.length > 0 && (
                     <div className="rounded-lg border border-red-300 bg-red-50 p-3">
                        <p className="mb-2 text-sm font-semibold text-red-700">
                           {errors.length} linha(s) com erro - corrija os dados
                           e tente novamente:
                        </p>
                        <ul className="space-y-1">
                           {errors.map((err) => (
                              <li
                                 key={err.linha}
                                 className="text-xs text-red-600"
                              >
                                 <span className="font-medium">
                                    Linha {err.linha}:
                                 </span>{" "}
                                 {err.motivo}
                                 <span className="ml-1 text-red-400">
                                    ({err.conteudo}...)
                                 </span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  )}

                  {parsedRows.length > 0 && (
                     <div className="max-h-96 overflow-auto rounded-lg border border-gray-200">
                        <Table
                           striped
                           theme={{
                              root: { base: "text-xs text-center" },
                              body: { cell: { base: "px-2 py-1" } },
                              head: {
                                 cell: { base: "px-2 py-1 bg-gray-200" },
                              },
                           }}
                        >
                           <TableHead>
                              <TableRow>
                                 <TableHeadCell>TIPO</TableHeadCell>
                                 <TableHeadCell>MODELO</TableHeadCell>
                                 <TableHeadCell>GRUPO</TableHeadCell>
                                 <TableHeadCell>PROGRAMA</TableHeadCell>
                                 <TableHeadCell>SUBPROGRAMA</TableHeadCell>
                                 <TableHeadCell>APLICAÇÃO</TableHeadCell>
                                 {MONTH_LABELS.map((m) => (
                                    <TableHeadCell key={m}>{m}</TableHeadCell>
                                 ))}
                                 <TableHeadCell>ALOCADAS</TableHeadCell>
                                 <TableHeadCell>GASTAS</TableHeadCell>
                                 <TableHeadCell>SALDO</TableHeadCell>
                              </TableRow>
                           </TableHead>
                           <TableBody className="divide-y">
                              {parsedRows.map((row, idx) => (
                                 <TableRow key={idx}>
                                    <TableCell className="whitespace-nowrap">
                                       {row.tipo}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                       {row.modelo}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                       {row.grupo}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                       {row.programa}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                       {row.subprograma}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                       {row.aplicacao}
                                    </TableCell>
                                    {row.meses.map((val, i) => (
                                       <TableCell key={MONTH_LABELS[i]}>
                                          {minutesToTime(val)}
                                       </TableCell>
                                    ))}
                                    <TableCell className="font-semibold">
                                       {minutesToTime(row.horasAlocadas)}
                                    </TableCell>
                                    <TableCell>
                                       {minutesToTime(row.horasGastas)}
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                       {minutesToTime(row.saldoHoras)}
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  )}
               </div>
            </ModalBody>
         </Modal>

         {/* Modal de Confirmação */}
         <Modal
            show={showConfirm}
            size="md"
            onClose={() => setShowConfirm(false)}
            popup
         >
            <ModalHeader />
            <ModalBody>
               <div className="text-center">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">
                     Confirmar importação
                  </h3>
                  <p className="mb-1 text-sm text-gray-600">
                     Deseja importar{" "}
                     <span className="font-bold">{parsedRows.length}</span>{" "}
                     registro(s) para o ano{" "}
                     <span className="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-800">
                        {anoRef}
                     </span>
                     ?
                  </p>
                  <p className="mb-5 text-xs text-gray-400">
                     Esta ação pode sobrescrever dados existentes.
                  </p>
                  <div className="flex justify-center gap-3">
                     <Button
                        color="green"
                        onClick={handleConfirmSend}
                        disabled={mutation.isPending}
                     >
                        {mutation.isPending ? (
                           <>
                              <Spinner
                                 size="sm"
                                 color="failure"
                                 className="mr-2"
                              />
                              Enviando...
                           </>
                        ) : (
                           "Confirmar"
                        )}
                     </Button>
                     <Button
                        color="gray"
                        onClick={() => setShowConfirm(false)}
                        disabled={mutation.isPending}
                     >
                        Cancelar
                     </Button>
                  </div>
               </div>
            </ModalBody>
         </Modal>

         {/* Modal de Resultado - Sem alterações */}
         <Modal
            show={!!importResult && !hasChanges(importResult)}
            size="md"
            onClose={() => setImportResult(null)}
            popup
         >
            <ModalHeader />
            <ModalBody>
               <div className="text-center">
                  <div className="mx-auto my-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-100">
                     <svg
                        className="h-7 w-7 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2.5}
                           d="M5 13l4 4L19 7"
                        />
                     </svg>
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-gray-900">
                     Importação concluída
                  </h3>
                  <p className="mb-4 text-sm text-gray-500">
                     As horas alocadas para{" "}
                     <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
                        {importResult?.ano_ref}
                     </span>{" "}
                     já estão atualizadas — nenhuma alteração necessária.
                  </p>
                  <div className="mx-auto mb-5 flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-left">
                     <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                     >
                        <path
                           fillRule="evenodd"
                           d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                           clipRule="evenodd"
                        />
                     </svg>
                     <p className="text-xs leading-relaxed text-blue-700">
                        Apenas os meses voados (SAGEM) foram atualizados.
                     </p>
                  </div>
                  <Button
                     color="gray"
                     className="mx-auto"
                     onClick={() => setImportResult(null)}
                  >
                     Entendido
                  </Button>
               </div>
            </ModalBody>
         </Modal>

         {/* Modal de Resultado - Comparação */}
         <Modal
            show={!!importResult && hasChanges(importResult)}
            size="3xl"
            onClose={() => setImportResult(null)}
            dismissible
         >
            <ModalHeader>Resultado da Importação</ModalHeader>
            <ModalBody>
               {importResult && (
                  <div>
                     <div ref={resultRef} className="bg-white p-2">
                        <h3 className="mb-2 text-center text-lg font-semibold">
                           Ano Referência: {importResult.ano_ref}
                        </h3>
                        <h3 className="mb-4 text-center text-sm text-gray-500">
                           Verificado em {dateStr}
                        </h3>
                        <div className="overflow-x-auto rounded-lg shadow-md">
                           <Table>
                              <TableHead>
                                 <TableRow className="text-center">
                                    <TableHeadCell className="bg-gray-200 px-3 py-3">
                                       Esforço Aéreo
                                    </TableHeadCell>
                                    <TableHeadCell className="bg-gray-200 px-3 py-3">
                                       Antes
                                    </TableHeadCell>
                                    <TableHeadCell className="bg-gray-200 px-3 py-3">
                                       Depois
                                    </TableHeadCell>
                                    <TableHeadCell className="bg-gray-200 px-3 py-3">
                                       Variação
                                    </TableHeadCell>
                                 </TableRow>
                              </TableHead>
                              <TableBody className="divide-y">
                                 {importResult.rows.map((row, i) => {
                                    const antes = row.antes ?? 0;
                                    const depois = row.depois ?? 0;
                                    const diff = depois - antes;
                                    const isNew = row.antes === null;
                                    const isRemoved = row.depois === null;
                                    return (
                                       <TableRow
                                          key={i}
                                          className="bg-gray-50 text-center"
                                       >
                                          <TableCell
                                             className={getDescricaoStyles(
                                                row.descricao
                                             )}
                                          >
                                             {row.descricao}
                                          </TableCell>
                                          <TableCell className="px-3 py-2">
                                             {isNew ? (
                                                <span className="text-xs text-gray-400">
                                                   novo
                                                </span>
                                             ) : (
                                                minutesToTime(antes)
                                             )}
                                          </TableCell>
                                          <TableCell className="px-3 py-2">
                                             {isRemoved ? (
                                                <span className="text-xs text-gray-400">
                                                   removido
                                                </span>
                                             ) : (
                                                minutesToTime(depois)
                                             )}
                                          </TableCell>
                                          <TableCell
                                             className={clsx(
                                                "px-3 py-2 font-semibold",
                                                {
                                                   "text-green-700": diff > 0,
                                                   "text-red-600": diff < 0,
                                                }
                                             )}
                                          >
                                             {formatDiff(diff)}
                                          </TableCell>
                                       </TableRow>
                                    );
                                 })}
                                 {/* Total */}
                                 <TableRow className="text-center font-semibold text-gray-900">
                                    <TableCell className="bg-gray-100 px-3 py-3 text-left">
                                       Total Esquadrão
                                    </TableCell>
                                    <TableCell className="bg-gray-100 px-3 py-3">
                                       {minutesToTime(importResult.total_antes)}
                                    </TableCell>
                                    <TableCell className="bg-gray-100 px-3 py-3">
                                       {minutesToTime(
                                          importResult.total_depois
                                       )}
                                    </TableCell>
                                    <TableCell
                                       className={clsx(
                                          "bg-gray-100 px-3 py-3",
                                          {
                                             "text-green-700":
                                                importResult.total_depois -
                                                   importResult.total_antes >
                                                0,
                                             "text-red-600":
                                                importResult.total_depois -
                                                   importResult.total_antes <
                                                0,
                                          }
                                       )}
                                    >
                                       {formatDiff(
                                          importResult.total_depois -
                                             importResult.total_antes
                                       )}
                                    </TableCell>
                                 </TableRow>
                              </TableBody>
                           </Table>
                        </div>
                     </div>
                     <div className="mt-4 flex justify-center">
                        <Button
                           color="red"
                           onClick={handleDownloadImage}
                           disabled={isCapturing}
                        >
                           {isCapturing ? (
                              <>
                                 <Spinner
                                    size="sm"
                                    color="failure"
                                    className="mr-2"
                                 />
                                 Gerando imagem...
                              </>
                           ) : (
                              "Baixar como imagem"
                           )}
                        </Button>
                     </div>
                  </div>
               )}
            </ModalBody>
         </Modal>
      </>
   );
}
