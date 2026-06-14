"use client";

import { useEffect, useState } from "react";
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
      } else if (form.short.trim().length > 50) {
         next.short = `${shortLabel} deve ter no máximo 50 caracteres`;
      }
      if (!form.long.trim()) {
         next.long = `${longLabel} é obrigatório`;
      } else if (form.long.trim().length > 150) {
         next.long = `${longLabel} deve ter no máximo 150 caracteres`;
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
      <Modal show={show} onClose={handleClose} size="md">
         <ModalHeader>{title}</ModalHeader>
         <form onSubmit={handleSubmit}>
            <ModalBody>
               <div className="space-y-4">
                  <div>
                     <Label htmlFor="quad-short">{shortLabel}</Label>
                     <TextInput
                        id="quad-short"
                        name="short"
                        type="text"
                        placeholder={shortPlaceholder}
                        value={form.short}
                        maxLength={6}
                        onChange={handleChange}
                        color={errors.short ? "failure" : undefined}
                        autoFocus
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
               <Button type="submit" color="red" disabled={isSaving}>
                  {isSaving ? (
                     <>
                        <Spinner color="failure" size="sm" className="mr-2" />
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
