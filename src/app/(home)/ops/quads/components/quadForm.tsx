"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   Textarea,
   TextInput,
   Spinner,
} from "flowbite-react";
import {
   HiCalendar,
   HiCube,
   HiPencilAlt,
   HiX,
   HiOutlineClipboardList,
} from "react-icons/hi";
import clsx from "clsx";
import { useToast } from "@/app/context/toast";
import { Quad } from "services/routes/quads";
import { CrewMember } from "services/routes/trips";
import { useQuadsContext } from "@/app/(home)/context/quads";
import { useCreateQuad, useUpdateQuad } from "@/hooks/queries";

interface QuadFormProps {
   trip: CrewMember;
   quad?: Quad;
   show: boolean;
   setShow: (show: boolean) => void;
}

export default function QuadForm({ trip, quad, show, setShow }: QuadFormProps) {
   const defaultValues = useMemo(
      () => ({
         value: quad?.value ?? "",
         description: quad?.description ?? "",
      }),
      [quad]
   );

   const [startDate, setStartDate] = useState<string>(
      defaultValues.value || ""
   );
   const [endDate, setEndDate] = useState<string>("");
   const [obs, setObs] = useState<string | null>(
      defaultValues.description || ""
   );
   const [lastro, setLastro] = useState<number>(0);
   const [inputType, setInputType] = useState<"data" | "lastro">("data");

   const { push } = useToast();
   const { quadType } = useQuadsContext();

   const createQuadMutation = useCreateQuad();
   const updateQuadMutation = useUpdateQuad();

   const loading = createQuadMutation.isPending || updateQuadMutation.isPending;

   useEffect(() => {
      if (show) {
         setStartDate(defaultValues.value || "");
         setEndDate("");
         setObs(defaultValues.description || "");
         setLastro(0);
         setInputType("data");
      }
   }, [show, defaultValues]);

   const cleanAndClose = () => {
      setStartDate(defaultValues.value || "");
      setEndDate("");
      setObs(defaultValues.description);
      setLastro(0);
      setShow(false);
   };

   const generateDateRange = (start: string, end: string): string[] => {
      const dates: string[] = [];
      const current = new Date(start + "T00:00:00");
      const last = new Date(end + "T00:00:00");

      while (current <= last) {
         const y = current.getFullYear();
         const m = String(current.getMonth() + 1).padStart(2, "0");
         const d = String(current.getDate()).padStart(2, "0");
         dates.push(`${y}-${m}-${d}`);
         current.setDate(current.getDate() + 1);
      }

      return dates;
   };

   const handleLastroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      setLastro(Number.isNaN(value) ? 0 : value < 0 ? 0 : value);
   };

   const handleSubmit = async () => {
      if (inputType === "lastro" && lastro === 0) {
         push({ message: "Insira a quantidade de lastros", type: "warning" });
         return;
      }

      if (inputType === "data" && !startDate) {
         push({ message: "Selecione a data inicial", type: "warning" });
         return;
      }

      if (inputType === "data" && !quad && endDate && endDate < startDate) {
         push({
            message: "A data final deve ser igual ou posterior à data inicial",
            type: "warning",
         });
         return;
      }

      try {
         let result;

         if (quad) {
            const payload: Quad = {
               id: quad.id,
               trip_id: trip.id,
               value: inputType === "data" ? startDate || null : null,
               description: obs || null,
               type_id: quadType,
            };
            result = await updateQuadMutation.mutateAsync(payload);
         } else if (inputType === "lastro") {
            const payload: Quad = {
               trip_id: trip.id,
               value: null,
               description: obs || null,
               type_id: quadType,
            };
            result = await createQuadMutation.mutateAsync(
               Array(lastro).fill(payload)
            );
         } else {
            const dates =
               endDate && endDate >= startDate
                  ? generateDateRange(startDate, endDate)
                  : [startDate];

            const quads: Quad[] = dates.map((d) => ({
               trip_id: trip.id,
               value: d,
               description: obs || null,
               type_id: quadType,
            }));

            result = await createQuadMutation.mutateAsync(quads);
         }

         if (result.ok) {
            push({
               message: result.message || "Salvo com sucesso",
               type: "success",
            });
            cleanAndClose();
         } else {
            push({
               message: result.message || "Erro ao inserir",
               type: "error",
            });
         }
      } catch (err) {
         console.error(err);
         push({ message: (err as Error).message || "Erro", type: "error" });
      }
   };

   const isFormValid = () => {
      if (inputType === "data") {
         if (!startDate) return false;
         if (!quad && endDate && endDate < startDate) return false;
         return true;
      }
      return lastro > 0;
   };

   const dateCount =
      !quad && startDate && endDate && endDate >= startDate
         ? generateDateRange(startDate, endDate).length
         : 0;

   return (
      <Modal
         show={show}
         onClose={cleanAndClose}
         size="md"
         popup
         dismissible
         theme={{
            root: {
               base: "fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full",
               show: {
                  on: "flex bg-slate-900/60 backdrop-blur-sm",
                  off: "hidden",
               },
            },
            content: {
               base: "relative h-full w-full p-4 md:h-auto",
               inner: "relative flex max-h-[90dvh] flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-xl dark:border-slate-700/60 dark:bg-slate-900",
            },
         }}
      >
         {/* Cabeçalho moderno com gradiente sutil */}
         <div className="relative overflow-hidden border-b border-slate-200/70 bg-linear-to-br from-red-600 via-red-500 to-rose-500 px-5 py-4 dark:border-slate-700/60">
            <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-white/25 bg-white/15 backdrop-blur-sm">
                     <HiOutlineClipboardList className="size-5 text-white" />
                  </div>
                  <div>
                     <h3 className="text-base leading-tight font-semibold text-white">
                        {quad ? "Atualizar Quadrinho" : "Adicionar Quadrinho"}
                     </h3>
                     <p className="font-semibold text-white/90 uppercase">
                        {`${trip?.user?.p_g} ${trip?.user?.nome_guerra}` ||
                           "Tripulante"}
                     </p>
                  </div>
               </div>
               <button
                  type="button"
                  onClick={cleanAndClose}
                  aria-label="Fechar"
                  className="flex size-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/15 focus:ring-2 focus:ring-white/40 focus:outline-none"
               >
                  <HiX className="size-4" />
               </button>
            </div>
         </div>

         <ModalBody className="p-0!">
            <div className="space-y-5 px-5 py-5">
               {!quad && (
                  <div className="space-y-2">
                     <Label
                        htmlFor="inputType"
                        className="text-xs font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-300"
                     >
                        Tipo de Entrada
                     </Label>
                     <div
                        role="tablist"
                        aria-label="Tipo de Entrada"
                        className="relative grid grid-cols-2 rounded-xl border border-slate-200/70 bg-slate-100/70 p-1 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60"
                     >
                        {(
                           [
                              { id: "data", label: "Data", icon: HiCalendar },
                              { id: "lastro", label: "Lastro", icon: HiCube },
                           ] as const
                        ).map(({ id, label, icon: Icon }) => {
                           const active = inputType === id;
                           return (
                              <button
                                 key={id}
                                 type="button"
                                 role="tab"
                                 aria-selected={active}
                                 onClick={() => setInputType(id)}
                                 className={clsx(
                                    "relative z-10 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                                    active
                                       ? "bg-white text-red-600 shadow-sm dark:bg-slate-900 dark:text-red-400"
                                       : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                 )}
                              >
                                 <Icon className="size-4" />
                                 {label}
                              </button>
                           );
                        })}
                     </div>
                  </div>
               )}

               <div className="min-h-36 space-y-3">
                  {inputType === "data" ? (
                     <>
                        <div className="space-y-1.5">
                           <Label
                              htmlFor="startDate"
                              className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-300"
                           >
                              <HiCalendar className="size-3.5" />
                              {quad ? "Data" : "Data Inicial"}
                           </Label>
                           <TextInput
                              id="startDate"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              type="date"
                              autoComplete="off"
                              autoFocus
                              sizing="md"
                           />
                        </div>

                        {!quad && (
                           <div className="space-y-1.5">
                              <Label
                                 htmlFor="endDate"
                                 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-300"
                              >
                                 <HiCalendar className="size-3.5" />
                                 Data Final
                              </Label>
                              <TextInput
                                 id="endDate"
                                 value={endDate}
                                 onChange={(e) => setEndDate(e.target.value)}
                                 type="date"
                                 autoComplete="off"
                                 min={startDate || undefined}
                                 sizing="md"
                              />
                              {dateCount > 0 && (
                                 <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50/80 px-3 py-2 backdrop-blur-sm dark:border-red-900/40 dark:bg-red-950/40">
                                    <span className="inline-flex size-5 items-center justify-center rounded-md bg-red-500 text-[11px] font-bold text-white">
                                       {dateCount}
                                    </span>
                                    <span className="text-xs font-medium text-red-700 dark:text-red-300">
                                       quadrinho{dateCount > 1 ? "s" : ""} será
                                       {dateCount > 1 ? "ão" : ""} inserido
                                       {dateCount > 1 ? "s" : ""}
                                    </span>
                                 </div>
                              )}
                           </div>
                        )}
                     </>
                  ) : (
                     <div className="space-y-1.5">
                        <Label
                           htmlFor="lastro"
                           className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-300"
                        >
                           <HiCube className="size-3.5" />
                           Quantidade
                        </Label>
                        <TextInput
                           id="lastro"
                           value={lastro}
                           onChange={handleLastroChange}
                           type="number"
                           autoComplete="off"
                           autoFocus
                           min="0"
                           placeholder="Digite a quantidade"
                           sizing="md"
                        />
                     </div>
                  )}
               </div>

               <div className="space-y-1.5">
                  <Label
                     htmlFor="obs"
                     className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-300"
                  >
                     <HiPencilAlt className="size-3.5" />
                     Observações
                  </Label>
                  <Textarea
                     id="obs"
                     className="resize-none placeholder:text-slate-400"
                     value={!obs ? "" : obs}
                     onChange={(e) => setObs(e.target.value)}
                     placeholder="Adicione uma observação (opcional)"
                     rows={3}
                  />
               </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-slate-200/70 bg-white/80 px-5 py-4 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/80">
               <Button
                  color="gray"
                  onClick={cleanAndClose}
                  disabled={loading}
                  className="flex-1"
               >
                  Cancelar
               </Button>
               <Button
                  color="red"
                  onClick={handleSubmit}
                  disabled={loading || !isFormValid()}
                  className="flex-1 bg-linear-to-r from-red-600 to-rose-500 enabled:hover:from-red-700 enabled:hover:to-rose-600"
               >
                  {loading ? (
                     <div className="flex items-center gap-2">
                        <Spinner size="sm" color="" />
                        <span>Salvando...</span>
                     </div>
                  ) : quad ? (
                     "Atualizar"
                  ) : (
                     "Adicionar"
                  )}
               </Button>
            </div>
         </ModalBody>
      </Modal>
   );
}
