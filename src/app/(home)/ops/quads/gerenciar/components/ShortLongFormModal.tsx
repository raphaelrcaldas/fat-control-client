"use client";

import { useEffect, useRef, useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
   TextInput,
   Spinner,
} from "flowbite-react";

export interface ShortLongData {
   short: string;
   long: string;
}

interface ShortLongFormModalProps {
   show: boolean;
   title: string;
   shortLabel: string;
   longLabel: string;
   shortPlaceholder?: string;
   longPlaceholder?: string;
   initial: ShortLongData | null;
   isSaving: boolean;
   onClose: () => void;
   onSubmit: (data: ShortLongData) => void;
}

interface FormErrors {
   short?: string;
   long?: string;
}

export function ShortLongFormModal({
   show,
   title,
   shortLabel,
   longLabel,
   shortPlaceholder,
   longPlaceholder,
   initial,
   isSaving,
   onClose,
   onSubmit,
}: ShortLongFormModalProps) {
   const [form, setForm] = useState<ShortLongData>({ short: "", long: "" });
   const [errors, setErrors] = useState<FormErrors>({});
   // `initialFocus` em vez de `autoFocus`: o nativo quebra a devolução do foco
   // ao fechar, que cai no <body>.
   const shortRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      if (show) {
         setForm({ short: initial?.short || "", long: initial?.long || "" });
         setErrors({});
      }
   }, [show, initial]);

   const validate = (): boolean => {
      const next: FormErrors = {};
      if (!form.short.trim()) {
         next.short = `${shortLabel} é obrigatório`;
      }
      if (!form.long.trim()) {
         next.long = `${longLabel} é obrigatório`;
      }
      setErrors(next);
      return Object.keys(next).length === 0;
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      onSubmit({ short: form.short.trim(), long: form.long.trim() });
   };

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (errors[name as keyof FormErrors]) {
         setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
   };

   const handleClose = () => {
      if (!isSaving) onClose();
   };

   return (
      <Modal
         show={show}
         onClose={handleClose}
         size="md"
         dismissible={!isSaving}
         initialFocus={shortRef}
      >
         <ModalHeader>{title}</ModalHeader>
         <form onSubmit={handleSubmit}>
            <ModalBody>
               <div className="space-y-4">
                  <div>
                     <Label htmlFor="quad-short">{shortLabel}</Label>
                     <TextInput
                        ref={shortRef}
                        id="quad-short"
                        name="short"
                        type="text"
                        placeholder={shortPlaceholder}
                        value={form.short}
                        // Limites do schema do backend. Não encurte: há
                        // siglas de até 9 caracteres em uso.
                        maxLength={50}
                        onChange={handleChange}
                        color={errors.short ? "failure" : undefined}
                        aria-invalid={!!errors.short}
                     />
                     {errors.short && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                           {errors.short}
                        </p>
                     )}
                  </div>
                  <div>
                     <Label htmlFor="quad-long">{longLabel}</Label>
                     <TextInput
                        id="quad-long"
                        name="long"
                        type="text"
                        placeholder={longPlaceholder}
                        value={form.long}
                        maxLength={150}
                        onChange={handleChange}
                        color={errors.long ? "failure" : undefined}
                        aria-invalid={!!errors.long}
                     />
                     {errors.long && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                           {errors.long}
                        </p>
                     )}
                  </div>
               </div>
            </ModalBody>
            <ModalFooter>
               <Button type="submit" color="primary" disabled={isSaving}>
                  {isSaving ? (
                     <>
                        <Spinner size="sm" className="mr-2" />
                        Salvando...
                     </>
                  ) : initial ? (
                     "Atualizar"
                  ) : (
                     "Criar"
                  )}
               </Button>
               <Button color="gray" onClick={onClose} disabled={isSaving}>
                  Cancelar
               </Button>
            </ModalFooter>
         </form>
      </Modal>
   );
}
