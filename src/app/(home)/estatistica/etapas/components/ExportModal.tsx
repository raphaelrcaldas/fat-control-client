"use client";

import { useState, useCallback } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   Button,
   Label,
   Checkbox,
   Spinner,
} from "flowbite-react";
import { HiDownload } from "react-icons/hi";
import { useToast } from "@/app/context/toast";
import { exportEtapas } from "services/routes/estatistica/etapas";

interface ExportModalProps {
   show: boolean;
   onClose: () => void;
   selectedIds: Set<number>;
}

const OPTIONAL_COLUMNS = [
   { key: "pousos", label: "Pousos" },
   { key: "nivel", label: "Nível" },
   { key: "tow", label: "TOW" },
   { key: "pax", label: "PAX" },
   { key: "carga", label: "Carga" },
   { key: "comb", label: "Combustível" },
   { key: "lub", label: "Lubrificante" },
   { key: "esforco_aereo", label: "Esforço Aéreo (Cod OI, Esf. Aéreo, D/N/V)" },
   { key: "tripulantes", label: "Tripulantes (trigramas)" },
] as const;

type ColumnKey = (typeof OPTIONAL_COLUMNS)[number]["key"];

const DEFAULT_STATE: Record<ColumnKey, boolean> = {
   pousos: false,
   nivel: false,
   tow: false,
   pax: false,
   carga: false,
   comb: false,
   lub: false,
   esforco_aereo: false,
   tripulantes: false,
};

export function ExportModal({ show, onClose, selectedIds }: ExportModalProps) {
   const { push } = useToast();
   const [columns, setColumns] = useState<Record<ColumnKey, boolean>>({
      ...DEFAULT_STATE,
   });
   const [isExporting, setIsExporting] = useState(false);

   const toggleColumn = useCallback((key: ColumnKey) => {
      setColumns((prev) => ({ ...prev, [key]: !prev[key] }));
   }, []);

   const allChecked = OPTIONAL_COLUMNS.every((c) => columns[c.key]);
   const noneChecked = OPTIONAL_COLUMNS.every((c) => !columns[c.key]);

   const toggleAll = useCallback(() => {
      const newVal = !allChecked;
      setColumns(
         Object.fromEntries(
            OPTIONAL_COLUMNS.map((c) => [c.key, newVal])
         ) as Record<ColumnKey, boolean>
      );
   }, [allChecked]);

   async function handleExport() {
      setIsExporting(true);
      try {
         const blob = await exportEtapas({
            ids: [...selectedIds],
            ...columns,
         });

         const url = URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         const now = new Date();
         const dd = String(now.getDate()).padStart(2, "0");
         const mm = String(now.getMonth() + 1).padStart(2, "0");
         const yyyy = now.getFullYear();
         a.download = `etapas_1_1_GT_${dd}${mm}${yyyy}.xlsx`;
         a.click();
         URL.revokeObjectURL(url);

         push({
            title: "Sucesso!",
            message: `${selectedIds.size} etapas exportadas com sucesso`,
            type: "success",
         });
         onClose();
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao exportar etapas",
            type: "error",
         });
      } finally {
         setIsExporting(false);
      }
   }

   return (
      <Modal show={show} size="md" onClose={onClose} dismissible>
         <ModalHeader>Exportar Etapas</ModalHeader>
         <ModalBody>
            <div className="space-y-5">
               {/* Resumo */}
               <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                     {selectedIds.size}
                  </span>{" "}
                  {selectedIds.size === 1
                     ? "etapa selecionada"
                     : "etapas selecionadas"}
               </p>

               {/* Colunas obrigatórias */}
               <div>
                  <Label className="mb-2 block text-sm font-semibold">
                     Colunas obrigatórias
                  </Label>
                  <p className="text-sm text-gray-500">
                     Data, Origem, Destino, DEP, ARR, TV, Aeronave
                  </p>
               </div>

               {/* Colunas opcionais */}
               <div>
                  <div className="mb-2 flex items-center justify-between">
                     <Label className="text-sm font-semibold">
                        Colunas opcionais
                     </Label>
                     <button
                        type="button"
                        onClick={toggleAll}
                        className="text-xs text-blue-600 hover:text-blue-800"
                     >
                        {allChecked ? "Limpar" : "Selecionar todos"}
                     </button>
                  </div>
                  <div className="space-y-2">
                     {OPTIONAL_COLUMNS.map((col) => (
                        <div key={col.key} className="flex items-center gap-2">
                           <Checkbox
                              id={`export-${col.key}`}
                              className="size-5"
                              checked={columns[col.key]}
                              color="red"
                              onChange={() => toggleColumn(col.key)}
                           />
                           <Label
                              htmlFor={`export-${col.key}`}
                              className="text-sm text-gray-700"
                           >
                              {col.label}
                           </Label>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Botões */}
               <div className="flex justify-center gap-3 border-t border-gray-200 pt-4">
                  <Button color="gray" onClick={onClose} disabled={isExporting}>
                     Cancelar
                  </Button>
                  <Button
                     color="red"
                     onClick={handleExport}
                     disabled={isExporting}
                  >
                     {isExporting ? (
                        <div className="flex items-center gap-2">
                           <Spinner size="sm" color="failure" />
                           <span>Exportando...</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           <HiDownload className="h-4 w-4" />
                           <span>Exportar</span>
                        </div>
                     )}
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
