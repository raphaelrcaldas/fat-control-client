"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalHeader,
   Select,
   Textarea,
   TextInput,
   Spinner,
} from "flowbite-react";
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
   const [inputType, setInputType] = useState<string>("data");

   const { push } = useToast();
   const { quadType } = useQuadsContext();

   // React Query mutations
   const createQuadMutation = useCreateQuad();
   const updateQuadMutation = useUpdateQuad();

   const loading = createQuadMutation.isPending || updateQuadMutation.isPending;

   // Reseta o formulário quando abre um novo quad
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

   return (
      <Modal show={show} onClose={cleanAndClose} size="md" popup dismissible>
         <ModalHeader>
            {quad ? "Atualizar Quadrinho" : "Adicionar Quadrinho"}
         </ModalHeader>
         <ModalBody>
            <div className="mt-4 space-y-5">
               {!quad && (
                  <div className="space-y-2">
                     <Label htmlFor="inputType" className="text-sm font-medium">
                        Tipo de Entrada
                     </Label>
                     <Select
                        id="inputType"
                        value={inputType}
                        onChange={(e) => setInputType(e.target.value)}
                        className="w-full"
                     >
                        <option value="data">Data</option>
                        <option value="lastro">Lastro</option>
                     </Select>
                  </div>
               )}

               <div className="space-y-2">
                  {inputType === "data" ? (
                     <>
                        <Label
                           htmlFor="startDate"
                           className="text-sm font-medium"
                        >
                           {quad ? "Data" : "Data Inicial"}
                        </Label>
                        <TextInput
                           id="startDate"
                           value={startDate}
                           onChange={(e) => setStartDate(e.target.value)}
                           type="date"
                           autoComplete="off"
                           autoFocus
                        />
                        {!quad && (
                           <>
                              <Label
                                 htmlFor="endDate"
                                 className="text-sm font-medium"
                              >
                                 Data Final
                              </Label>
                              <TextInput
                                 id="endDate"
                                 value={endDate}
                                 onChange={(e) => setEndDate(e.target.value)}
                                 type="date"
                                 autoComplete="off"
                                 min={startDate || undefined}
                              />
                              {startDate && endDate && endDate >= startDate && (
                                 <p className="text-xs text-gray-500">
                                    {
                                       generateDateRange(startDate, endDate)
                                          .length
                                    }{" "}
                                    quadrinho(s) será(ão) inserido(s)
                                 </p>
                              )}
                           </>
                        )}
                     </>
                  ) : (
                     <>
                        <Label htmlFor="lastro" className="text-sm font-medium">
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
                        />
                     </>
                  )}
               </div>

               <div className="space-y-2">
                  <Label htmlFor="obs" className="text-sm font-medium">
                     Observações
                  </Label>
                  <Textarea
                     id="obs"
                     className="placeholder:text-gray-500"
                     value={!obs ? "" : obs}
                     onChange={(e) => setObs(e.target.value)}
                     placeholder="Digite observações (opcional)"
                     rows={3}
                  />
               </div>
            </div>

            <div className="mt-6 flex gap-3">
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
                  className="flex-1"
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
