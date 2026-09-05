"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
   Button,
   Modal,
   ModalBody,
   ModalHeader,
   Spinner,
   TextInput,
} from "flowbite-react";
import {
   HiDownload,
   HiOutlineDocumentDownload,
   HiOutlineDocumentText,
   HiOutlineSwitchHorizontal,
   HiOutlineTable,
   HiOutlineViewBoards,
} from "react-icons/hi";
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
import { ColumnsPreviewTable } from "./ColumnsPreviewTable";
import { ColumnPicker } from "./ColumnPicker";
import { ExportSection } from "./ExportSection";
import { usePortalTarget } from "./usePortalTarget";
import { ColumnChipOverlay, SortableColumnChip } from "./SortableColumnChip";

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
   const portalTarget = usePortalTarget();

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

   const totalOpcionais = optionalColumns.length;
   const opcionaisMarcadas = optionalColumns.filter((c) =>
      checked.has(c.key)
   ).length;
   const todasMarcadas =
      totalOpcionais > 0 && opcionaisMarcadas === totalOpcionais;

   return (
      <Modal show={show} size="7xl" onClose={onClose} dismissible>
         <ModalHeader>
            {/* Spans, nao divs: o ModalHeader do Flowbite renderiza isto
                dentro de um <h3>, que so aceita conteudo de frase. */}
            <span className="flex items-center gap-3">
               <span className="bg-primary-50 text-primary-600 ring-primary-100 grid size-9 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                  <HiOutlineDocumentDownload aria-hidden className="h-5 w-5" />
               </span>
               <span className="flex flex-col">
                  <span className="text-base leading-tight font-bold text-slate-900">
                     Exportar planilha
                  </span>
                  <span className="text-xs font-normal text-slate-500">
                     {rows.length}{" "}
                     {rows.length === 1 ? "registro" : "registros"} no carrinho
                  </span>
               </span>
            </span>
         </ModalHeader>
         <ModalBody>
            <div className="space-y-4">
               <ExportSection
                  index={0}
                  icon={HiOutlineSwitchHorizontal}
                  title="Ordem das colunas"
                  hint="Arraste para remanejar — é nesta ordem que elas saem na planilha. As de cadeado entram sempre, mas a posição delas também pode mudar."
               >
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
                        {/* O `pb-3` e a folga que a barra de rolagem ocupa.
                            Onde ela e SOBREPOSTA (Firefox, macOS) ela e
                            pintada por cima do conteudo, e sem essa folga ela
                            cobria a base dos chips. `scroll-rail` so lhe da a
                            cor. */}
                        <ul className="scroll-rail flex flex-nowrap gap-1.5 overflow-x-auto pb-3">
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
                     {/* Portalizado para o <body>, e nao renderizado aqui:
                         o `DragOverlay` e `position: fixed`, e a secao que o
                         envolve tem `animate-enter` — uma animacao de
                         `transform` com fill `both` segue ATIVA depois de
                         terminar, e um ancestral com transform vira bloco
                         conteiner do fixed. Sem o portal a copia arrastada
                         aparecia deslocada, longe do ponteiro. Mesma armadilha
                         do `translate` residual do PageTransition, ver
                         `usePortalTarget`. */}
                     {portalTarget &&
                        createPortal(
                           <DragOverlay>
                              {draggingColumn && (
                                 <ColumnChipOverlay
                                    label={draggingColumn.label}
                                    locked={draggingColumn.required}
                                 />
                              )}
                           </DragOverlay>,
                           portalTarget
                        )}
                  </DndContext>
               </ExportSection>

               <ExportSection
                  index={1}
                  icon={HiOutlineViewBoards}
                  title="Colunas adicionais"
                  badge={`${opcionaisMarcadas} de ${totalOpcionais}`}
                  action={
                     <button
                        type="button"
                        onClick={() =>
                           setMany(
                              optionalColumns.map((c) => c.key),
                              !todasMarcadas
                           )
                        }
                        className="text-primary-600 hover:text-primary-700 shrink-0 rounded px-1 text-xs font-semibold hover:underline"
                     >
                        {todasMarcadas ? "Desmarcar todas" : "Marcar todas"}
                     </button>
                  }
               >
                  <ColumnPicker
                     columns={optionalColumns}
                     checked={checked}
                     onToggle={toggle}
                     onSetMany={setMany}
                  />
               </ExportSection>

               <ExportSection
                  index={2}
                  icon={HiOutlineTable}
                  title="Prévia"
                  badge={`${activeColumns.length} ${
                     activeColumns.length === 1 ? "coluna" : "colunas"
                  }`}
               >
                  <ColumnsPreviewTable columns={activeColumns} />
               </ExportSection>

               <ExportSection
                  index={3}
                  icon={HiOutlineDocumentText}
                  title="Nome do arquivo"
                  titleFor="export-file-name"
               >
                  <TextInput
                     id="export-file-name"
                     value={fileName}
                     onChange={(e) => setFileName(e.target.value)}
                     addon=".xlsx"
                  />
               </ExportSection>

               <div
                  className="animate-enter flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4"
                  style={{ "--i": 4 } as React.CSSProperties}
               >
                  <p className="text-xs text-slate-500">
                     <span className="font-semibold text-slate-700 tabular-nums">
                        {rows.length}
                     </span>{" "}
                     {rows.length === 1 ? "registro" : "registros"}
                     {" × "}
                     <span className="font-semibold text-slate-700 tabular-nums">
                        {activeColumns.length}
                     </span>{" "}
                     {activeColumns.length === 1 ? "coluna" : "colunas"}
                  </p>
                  <div className="flex gap-3">
                     <Button
                        color="gray"
                        onClick={onClose}
                        disabled={isExporting}
                     >
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
            </div>
         </ModalBody>
      </Modal>
   );
}
