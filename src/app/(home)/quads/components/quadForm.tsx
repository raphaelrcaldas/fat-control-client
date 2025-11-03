"use client";
import React, { useMemo, useState } from "react";
import {
   Label,
   Modal,
   Textarea,
   TextInput,
   Select,
   Button,
   Spinner,
} from "flowbite-react";
import { addQuad, updateQuad, deleteQuad } from "services/routes/quads";
import { useToast } from "@/app/context/toast";
import { Quad } from "services/routes/quads";
import { CrewMember } from "services/routes/trips";
import { useQuadsContext } from "../../context/quads";

interface QuadFormProps {
   trip: CrewMember;
   quad?: Quad;
   show: boolean;
   setShow: (show: boolean) => void;
   onSuccess?: () => void;
}

export default function QuadForm({
   trip,
   quad,
   show,
   setShow,
   onSuccess,
}: QuadFormProps) {
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
   const [loading, setLoading] = useState<boolean>(false);

   const { push } = useToast();
   const { quadType } = useQuadsContext();

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
      if (lastro === 0 && date === "") {
         push({ message: "Insira lastros ou uma data", type: "warning" });
      }

      setLoading(true);
      let payload: Quad = {
         id: quad?.id, // adiciona apenas se existir
         trip_id: trip.id,
         value: inputType === "data" ? date || null : null,
         description: obs || null,
         type_id: quadType,
      };

      let response: Response;
      try {
         if (quad) {
            response = await updateQuad(payload);
         } else {
            const quadsToHandle =
               lastro > 0 ? Array(lastro).fill(payload) : [payload];
            response = await addQuad(quadsToHandle);
         }
      } catch (err) {
         console.error(err);
         push({ message: (err as Error).message || "Erro", type: "error" });
      } finally {
         setLoading(false);
      }

      const data = await response.json();
      if (response.ok) {
         push({ message: data.detail, type: "success" });
         onSuccess?.();
         cleanAndClose();
      } else {
         push({
            message: data.detail || "Erro ao inserir",
            type: "error",
         });
      }
   };

   return (
      <>
         {show && (
            <Modal show={show} onClose={cleanAndClose} size='sm' popup>
               <Modal.Header>
                  {quad ? "Atualizar Quadrinho" : "Adicionar Quadrinho"}
               </Modal.Header>
               <Modal.Body>
                  <div className='grid justify-center gap-4 text-center mt-4'>
                     <div className='grid justify-center gap-1'>
                        <Label value='Tipo de Entrada' />
                        <Select
                           className='w-fit'
                           value={inputType}
                           onChange={(e) => setInputType(e.target.value)}
                        >
                           <option value='data'>Data</option>
                           <option value='lastro'>Lastro</option>
                        </Select>
                     </div>

                     <div className='grid justify-center gap-1'>
                        {inputType === "data" ? (
                           <>
                              <Label value='Data' />
                              <TextInput
                                 value={date ?? ""}
                                 onChange={(e) => setDate(e.target.value)}
                                 className='text-sm text-gray-900'
                                 type='date'
                                 autoComplete='off'
                              />
                           </>
                        ) : (
                           <>
                              <Label value='Quantidade' />
                              <TextInput
                                 value={lastro}
                                 onChange={handleLastroChange}
                                 className='w-20 text-sm text-gray-900'
                                 type='number'
                                 autoComplete='off'
                              />
                           </>
                        )}
                     </div>

                     <div className='grid gap-1'>
                        <Label value='Observações' />
                        <Textarea
                           className='text-base'
                           value={!obs ? "" : obs}
                           onChange={(e) => setObs(e.target.value)}
                           placeholder='Observações'
                        />
                     </div>
                  </div>

                  <div className='grid justify-center mt-6'>
                     <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? (
                           <Spinner
                              color='failure'
                              aria-label='Loading spinner'
                           />
                        ) : quad ? (
                           "Atualizar"
                        ) : (
                           "Adicionar"
                        )}
                     </Button>
                  </div>
               </Modal.Body>
            </Modal>
         )}
      </>
   );
}
