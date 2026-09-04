"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { HiDownload, HiExclamation, HiOutlineTable } from "react-icons/hi";
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
import clsx from "clsx";
import { useToast } from "@/app/context/toast";
import { todayDateStamp } from "@/../utils/dateHandler";
import type { ExportColumn } from "./exportTypes";
import { exportToXlsx } from "./exportToXlsx";
import { ColumnChipOverlay, SortableColumnChip } from "./SortableColumnChip";

const PREVIEW_ROWS = 3;

interface StoredPrefs {
   cols: string[];
   order: string[];
}

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
}

export function ExportColumnsModal<T>({
   show,
   onClose,
   rows,
   columns,
   storageKey,
   fileBaseName,
   sheetName,
}: ExportColumnsModalProps<T>) {
   const { push } = useToast();

   const optionalColumns = useMemo(
      () => columns.filter((c) => !c.required),
      [columns]
   );

   const [checked, setChecked] = useState<Set<string>>(() => new Set());
   /** Ordem escolhida das colunas na planilha; chave que falta aqui vai
    *  para o fim, na ordem do catalogo. */
   const [order, setOrder] = useState<string[]>([]);
   const [fileName, setFileName] = useState("");
   const [isExporting, setIsExporting] = useState(false);
   /** Coluna erguida no momento; alimenta a copia do `DragOverlay`. */
   const [draggingKey, setDraggingKey] = useState<string | null>(null);

   // O catalogo entra por ref, e nao pelas deps do efeito abaixo. Tela que
   // monta as colunas por factory (`/ops/trip` precisa do rotulo da funcao,
   // que vem de hook) devolve um array NOVO a cada render do pai: nas deps,
   // qualquer refetch do react-query reabriria o efeito no meio da
   // interacao, desmarcando a coluna e apagando o nome do arquivo que o
   // usuario estava digitando.
   const catalogRef = useRef({ columns, optionalColumns });
   catalogRef.current = { columns, optionalColumns };

   // Preferencia so e lida no cliente: localStorage no primeiro render
   // divergiria do HTML do servidor. Pode falhar (aba anonima, site data
   // bloqueado), e ai simplesmente comeca no padrao.
   useEffect(() => {
      if (!show) return;
      setFileName(`${fileBaseName}_${todayDateStamp()}`);

      const catalog = catalogRef.current;
      try {
         const saved = localStorage.getItem(storageKey);
         if (saved) {
            const parsed = JSON.parse(saved) as StoredPrefs;
            const validCols = (parsed.cols ?? []).filter((k) =>
               catalog.optionalColumns.some((c) => c.key === k)
            );
            setChecked(new Set(validCols));
            setOrder(
               (parsed.order ?? []).filter((k) =>
                  catalog.columns.some((c) => c.key === k)
               )
            );
            return;
         }
      } catch {
         // sem preferencia utilizavel — segue com o padrao
      }
      setChecked(new Set());
      setOrder([]);
   }, [show, storageKey, fileBaseName]);

   const toggle = useCallback((key: string) => {
      setChecked((prev) => {
         const next = new Set(prev);
         if (next.has(key)) next.delete(key);
         else next.add(key);
         return next;
      });
   }, []);

   /**
    * Colunas efetivas: fixas + marcadas, na ordem que o usuario remanejou.
    */
   const activeColumns = useMemo(() => {
      const active = columns.filter((c) => c.required || checked.has(c.key));

      // `sort` e estavel, entao coluna ainda nao remanejada cai no fim
      // preservando a ordem do catalogo.
      const pos = new Map(order.map((key, i) => [key, i]));
      const last = Number.MAX_SAFE_INTEGER;
      return [...active].sort(
         (a, b) => (pos.get(a.key) ?? last) - (pos.get(b.key) ?? last)
      );
   }, [columns, checked, order]);

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

   const hasSensitive = activeColumns.some((c) => c.sensitive);
   const previewRows = rows.slice(0, PREVIEW_ROWS);

   async function handleExport() {
      setIsExporting(true);
      try {
         const safeName = fileName.trim() || fileBaseName;
         await exportToXlsx({
            rows,
            columns: activeColumns,
            fileName: `${safeName.replace(/\.xlsx$/i, "")}.xlsx`,
            sheetName,
         });
         try {
            const prefs: StoredPrefs = {
               cols: [...checked],
               order: activeColumns.map((c) => c.key),
            };
            localStorage.setItem(storageKey, JSON.stringify(prefs));
         } catch {
            // preferencia e conveniencia; nao atrapalha o download
         }
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

               <div>
                  <Label className="mb-2 block text-sm font-semibold">
                     Colunas adicionais
                  </Label>
                  <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                     {optionalColumns.map((column) => (
                        <div
                           key={column.key}
                           className="flex items-center gap-2"
                        >
                           <Checkbox
                              id={`col-${column.key}`}
                              className="size-[20px] pointer-coarse:size-[44px]"
                              color="primary"
                              checked={checked.has(column.key)}
                              onChange={() => toggle(column.key)}
                           />
                           <Label
                              htmlFor={`col-${column.key}`}
                              className="text-sm text-slate-700"
                           >
                              {column.label}
                           </Label>
                        </div>
                     ))}
                  </div>
               </div>

               {hasSensitive && (
                  <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2">
                     <HiExclamation className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                     <p className="text-xs text-amber-800">
                        Este arquivo conterá dados pessoais. Uma vez exportado,
                        ele sai do sistema e deixa de ser rastreável.
                     </p>
                  </div>
               )}

               <div>
                  <div className="mb-2 flex items-center gap-1.5">
                     <HiOutlineTable className="h-4 w-4 text-slate-400" />
                     <Label className="text-sm font-semibold">
                        Prévia ({activeColumns.length}{" "}
                        {activeColumns.length === 1 ? "coluna" : "colunas"})
                     </Label>
                  </div>
                  {/* Tabela larga rola no proprio container: o body da pagina
                      nunca deve rolar na horizontal. */}
                  <div className="overflow-x-auto rounded border border-slate-200">
                     <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600">
                           <tr>
                              {activeColumns.map((c) => (
                                 <th
                                    key={c.key}
                                    className="px-2 py-1.5 font-semibold whitespace-nowrap"
                                 >
                                    {c.label}
                                 </th>
                              ))}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {previewRows.map((row, i) => (
                              <tr key={i} className={clsx(i % 2 && "bg-white")}>
                                 {activeColumns.map((c) => {
                                    const raw = c.get(row);
                                    const value =
                                       raw === null ||
                                       raw === undefined ||
                                       raw === ""
                                          ? "—"
                                          : String(raw);
                                    return (
                                       <td
                                          key={c.key}
                                          className={clsx(
                                             "px-2 py-1 whitespace-nowrap text-slate-700",
                                             c.uppercase && "uppercase"
                                          )}
                                       >
                                          {value}
                                       </td>
                                    );
                                 })}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
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
