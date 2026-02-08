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

   const [date, setDate] = useState<string | null>(defaultValues.value || "");
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
         setDate(defaultValues.value || "");
         setObs(defaultValues.description || "");
         setLastro(0);
         setInputType("data");
      }
   }, [show, defaultValues]);

   const cleanAndClose = () => {
      setDate(defaultValues.value);
      setObs(defaultValues.description);
      setLastro(0);
      setShow(false);
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

      if (inputType === "data" && !date) {
         push({ message: "Selecione uma data", type: "warning" });
         return;
      }

      const payload: Quad = {
         id: quad?.id,
         trip_id: trip.id,
         value: inputType === "data" ? date || null : null,
         description: obs || null,
         type_id: quadType,
      };

      try {
         let result;

         if (quad) {
            result = await updateQuadMutation.mutateAsync(payload);
         } else {
            const quadsToHandle =
               lastro > 0 ? Array(lastro).fill(payload) : [payload];
            result = await createQuadMutation.mutateAsync(quadsToHandle);
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
         return !!date;
      }
      return lastro > 0;
   };

   return (
      <Modal show={show} onClose={cleanAndClose} size="md" popup>
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
                        <Label htmlFor="date" className="text-sm font-medium">
                           Data
                        </Label>
                        <TextInput
                           id="date"
                           value={date ?? ""}
                           onChange={(e) => setDate(e.target.value)}
                           type="date"
                           autoComplete="off"
                           autoFocus
                        />
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
                  color="blue"
                  onClick={handleSubmit}
                  disabled={loading || !isFormValid()}
                  className="flex-1"
               >
                  {loading ? (
                     <div className="flex items-center gap-2">
                        <Spinner size="sm" color="failure" />
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
