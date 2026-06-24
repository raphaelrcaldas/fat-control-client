import { useMemo, useRef } from "react";
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
import { minutesToTime, nowDateTimeBR } from "@/../utils/dateHandler";
import type { EsfAerImportResponse } from "services/routes/estatistica/esfAer";
import { formatSignedMinutes, getDescricaoStyles } from "../../utils";
import { useDomScreenshot } from "../../hooks/useDomScreenshot";

interface ImportResultModalProps {
   result: EsfAerImportResponse | null;
   onClose: () => void;
}

export function ImportResultModal({ result, onClose }: ImportResultModalProps) {
   const resultRef = useRef<HTMLDivElement>(null);
   const { capture, isCapturing } = useDomScreenshot();

   // Carimbo "verificado em", congelado por resultado importado.
   const dateStr = useMemo(() => (result ? nowDateTimeBR() : ""), [result]);

   const handleDownload = () => {
      if (!result) return;
      const today = new Date().toISOString().slice(0, 10);
      capture(
         resultRef.current,
         `esfaer-importacao-${result.ano_ref}-${today}.png`
      );
   };

   return (
      <Modal show={!!result} size="3xl" onClose={onClose} dismissible>
         <ModalHeader>Resultado da Importação</ModalHeader>
         <ModalBody>
            {result && (
               <div>
                  <div ref={resultRef} className="bg-white p-2">
                     <h3 className="mb-2 text-center text-lg font-semibold">
                        Ano Referência: {result.ano_ref}
                     </h3>
                     <h3 className="mb-4 text-center text-sm text-gray-500">
                        Verificado em {dateStr}
                     </h3>
                     <Table
                        theme={{
                           root: {
                              wrapper:
                                 "relative overflow-x-auto rounded border border-slate-200 shadow-sm",
                           },
                        }}
                     >
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
                           {result.rows.map((row, i) => {
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
                                       {formatSignedMinutes(diff)}
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
                                 {minutesToTime(result.total_antes)}
                              </TableCell>
                              <TableCell className="bg-gray-100 px-3 py-3">
                                 {minutesToTime(result.total_depois)}
                              </TableCell>
                              <TableCell
                                 className={clsx("bg-gray-100 px-3 py-3", {
                                    "text-green-700":
                                       result.total_depois -
                                          result.total_antes >
                                       0,
                                    "text-red-600":
                                       result.total_depois -
                                          result.total_antes <
                                       0,
                                 })}
                              >
                                 {formatSignedMinutes(
                                    result.total_depois - result.total_antes
                                 )}
                              </TableCell>
                           </TableRow>
                        </TableBody>
                     </Table>
                  </div>
                  <div className="mt-4 flex justify-center">
                     <Button
                        color="red"
                        onClick={handleDownload}
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
   );
}
