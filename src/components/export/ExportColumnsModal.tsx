"use client";

import { useCallback, useEffect, useState } from "react";
import {
   Button,
   Checkbox,
   Label,
   Modal,
   ModalBody,
   ModalHeader,
   Spinner,
   TextInput,
} from "flowbite-react";
import { HiDownload, HiOutlineTable } from "react-icons/hi";
import {
   DndContext,
   DragOverlay,
   KeyboardSensor,
   PointerSensor,
   TouchSensor,
   closestCenter,
   useSensor,
   useSensors,
   type DragEndEvent,
   type DragStartEvent,
} from "@dnd-kit/core";
import {
   SortableContext,
   arrayMove,
   horizontalListSortingStrategy,
   sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useToast } from "@/app/context/toast";
import { todayDateStamp } from "@/../utils/dateHandler";
import type { ExportColumn } from "./exportTypes";
import { exportToXlsx } from "./exportToXlsx";
import { useColumnPrefs } from "./useColumnPrefs";
import { ColumnsPreviewTable, PreviewSampleNote } from "./ColumnsPreviewTable";
import { ColumnPicker } from "./ColumnPicker";
import { ColumnChipOverlay, SortableColumnChip } from "./SortableColumnChip";

const PREVIEW_ROWS = 3;

interface ExportColumnsModalProps<T> {
   show: boolean;
   onClose: () => void;
   /** Linhas do carrinho, ja na ordem em que devem sair na planilha. */
   rows: T[];
   columns: ExportColumn<T>[];
   /** Chave da preferencia de colunas no localStorage; unica por tela. */
   storageKey: string;
   /** Base do nome do arquivo, sem data nem extensao. */
   fileBaseName: string;
   sheetName: string;
   /**
    * Busca o dado que a listagem nao carrega e devolve as linhas enriquecidas.
    *
    * Roda UMA vez, no clique de exportar, e so quando alguma coluna
    * `hydrated` foi escolhida — marcar gente no carrinho nao dispara
    * requisicao nenhuma. De quebra o dado sai fresco: o carrinho guarda o
    * retrato do instante em que a linha foi clicada, que pode ter varias
    * paginas de idade.
    */
   hydrate?: (rows: T[]) => Promise<T[]>;
}

export function ExportColumnsModal<T>({
   show,
   onClose,
   rows,
   columns,
   storageKey,
   fileBaseName,
   sheetName,
   hydrate,
}: ExportColumnsModalProps<T>) {
   const { push } = useToast();

   const {
      optionalColumns,
      activeColumns,
      checked,
      toggle,
      setMany,
      setOrder,
      persist,
   } = useColumnPrefs(columns, storageKey, show);

   const [fileName, setFileName] = useState("");
   const [isExporting, setIsExporting] = useState(false);
   /** Coluna erguida no momento; alimenta a copia do `DragOverlay`. */
   const [draggingKey, setDraggingKey] = useState<string | null>(null);

   useEffect(() => {
      if (show) setFileName(`${fileBaseName}_${todayDateStamp()}`);
   }, [show, fileBaseName]);

   // Mesma configuracao de sensores do editor de missao: no dedo o
   // TouchSensor precisa de `delay` (long press) e nao de distancia, senao a
   // rolagem vence a disputa pelo gesto e dispara `pointercancel`.
   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
      useSensor(TouchSensor, {
         activationConstraint: { delay: 200, tolerance: 8 },
      }),
      // `sortableKeyboardCoordinates` e o que faz a seta pular para o item
      // vizinho; sem ele o KeyboardSensor anda em pixels e o `over` volta
      // sendo o proprio item arrastado.
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates,
      })
   );

   const handleDragStart = useCallback((event: DragStartEvent) => {
      setDraggingKey(String(event.active.id));
   }, []);

   const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
         const { active, over } = event;
         setDraggingKey(null);
         if (!over || active.id === over.id) return;
         const ids = activeColumns.map((c) => c.key);
         const from = ids.indexOf(String(active.id));
         const to = ids.indexOf(String(over.id));
         if (from < 0 || to < 0) return;
         setOrder(arrayMove(ids, from, to));
      },
      [activeColumns]
   );

   const draggingColumn = draggingKey
      ? activeColumns.find((c) => c.key === draggingKey)
      : undefined;

   const previewRows = rows.slice(0, PREVIEW_ROWS);

   async function handleExport() {
      setIsExporting(true);
      try {
         const safeName = fileName.trim() || fileBaseName;

         const precisaHidratar = activeColumns.some((c) => c.hydrated);
         const linhas = precisaHidratar && hydrate ? await hydrate(rows) : rows;

         await exportToXlsx({
            rows: linhas,
            columns: activeColumns,
            fileName: `${safeName.replace(/\.xlsx$/i, "")}.xlsx`,
            sheetName,
         });
         persist();
         push({
            title: "Planilha gerada",
            message: `${rows.length} ${
               rows.length === 1 ? "registro exportado" : "registros exportados"
            }.`,
            type: "success",
         });
         onClose();
      } catch (err: unknown) {
         push({
            title: "Erro ao exportar",
            message:
               err instanceof Error
                  ? err.message
                  : "Não foi possível gerar a planilha.",
            type: "error",
         });
      } finally {
         setIsExporting(false);
      }
   }

   return (
      <Modal show={show} size="7xl" onClose={onClose} dismissible>
         <ModalHeader>Exportar planilha</ModalHeader>
         <ModalBody>
            <div className="space-y-4">
               <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">
                     {rows.length}
                  </span>{" "}
                  {rows.length === 1 ? "registro" : "registros"} no carrinho.
               </p>

               <div>
                  <Label className="mb-1 block text-sm font-semibold">
                     Ordem das colunas
                  </Label>
                  <p className="mb-2 text-xs text-slate-500">
                     Arraste para remanejar — é nesta ordem que elas saem na
                     planilha. As de cadeado entram sempre, mas a posição delas
                     também pode mudar.
                  </p>
                  <DndContext
                     sensors={sensors}
                     collisionDetection={closestCenter}
                     onDragStart={handleDragStart}
                     onDragEnd={handleDragEnd}
                     onDragCancel={() => setDraggingKey(null)}
                  >
                     {/* `horizontalList`, nao `rect`: a estrategia de grade
                         encaixa cada chip na VAGA do vizinho, e como os chips
                         tem larguras bem diferentes ela so consegue isso
                         deformando-os (scaleX). A de lista desloca todo mundo
                         pela largura do chip arrastado — encaixa exato, sem
                         escala e sem sobreposicao. Em troca ela exige uma
                         linha so: dai `flex-nowrap` + rolagem lateral. */}
                     <SortableContext
                        items={activeColumns.map((c) => c.key)}
                        strategy={horizontalListSortingStrategy}
                     >
                        <ul className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1">
                           {activeColumns.map((column) => (
                              <SortableColumnChip
                                 key={column.key}
                                 id={column.key}
                                 label={column.label}
                                 locked={column.required}
                              />
                           ))}
                        </ul>
                     </SortableContext>
                     <DragOverlay>
                        {draggingColumn && (
                           <ColumnChipOverlay
                              label={draggingColumn.label}
                              locked={draggingColumn.required}
                           />
                        )}
                     </DragOverlay>
                  </DndContext>
               </div>

               <ColumnPicker
                  columns={optionalColumns}
                  checked={checked}
                  onToggle={toggle}
                  onSetMany={setMany}
               />

               <div>
                  <div className="mb-2 flex items-center gap-1.5">
                     <HiOutlineTable className="h-4 w-4 text-slate-400" />
                     <Label className="text-sm font-semibold">
                        Prévia ({activeColumns.length}{" "}
                        {activeColumns.length === 1 ? "coluna" : "colunas"})
                     </Label>
                  </div>
                  <ColumnsPreviewTable
                     rows={previewRows}
                     columns={activeColumns}
                  />
                  <PreviewSampleNote
                     visible={activeColumns.some((c) => c.hydrated)}
                  />
                  {rows.length > PREVIEW_ROWS && (
                     <p className="mt-1 text-xs text-slate-500">
                        Mostrando {PREVIEW_ROWS} de {rows.length} registros.
                     </p>
                  )}
               </div>

               <div>
                  <Label
                     htmlFor="export-file-name"
                     className="mb-1 block text-sm font-semibold"
                  >
                     Nome do arquivo
                  </Label>
                  <TextInput
                     id="export-file-name"
                     value={fileName}
                     onChange={(e) => setFileName(e.target.value)}
                     addon=".xlsx"
                  />
               </div>

               <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                  <Button color="gray" onClick={onClose} disabled={isExporting}>
                     Cancelar
                  </Button>
                  <Button
                     color="primary"
                     onClick={handleExport}
                     disabled={isExporting || rows.length === 0}
                  >
                     {isExporting ? (
                        <span className="flex items-center gap-2">
                           <Spinner size="sm" color="primary" />
                           Gerando...
                        </span>
                     ) : (
                        <span className="flex items-center gap-2">
                           <HiDownload className="h-4 w-4" />
                           Exportar planilha
                        </span>
                     )}
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
