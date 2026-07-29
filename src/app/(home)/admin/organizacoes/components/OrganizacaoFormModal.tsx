"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { FaBuilding, FaCheck, FaHashtag, FaIdCard } from "react-icons/fa6";
import type { Organizacao } from "services/routes/organizacoes";
import { useToast } from "@/app/context/toast";
import {
   applyOrganizacaoFieldErrors,
   formatOrganizacaoSaveError,
} from "../organizacaoErrors";
import {
   makeDefaultOrganizacaoValues,
   organizacaoFormSchema,
   type OrganizacaoFormData,
} from "../schemas/organizacaoSchema";

interface OrganizacaoFormModalProps {
   show: boolean;
   editingOrg: Organizacao | null;
   isSaving: boolean;
   onClose: () => void;
   /** Executa a mutation. Deve lançar em caso de falha — o erro de campo é
    *  devolvido aos inputs aqui. */
   onSubmit: (data: OrganizacaoFormData) => Promise<void>;
}

export function OrganizacaoFormModal({
   show,
   editingOrg,
   isSaving,
   onClose,
   onSubmit,
}: OrganizacaoFormModalProps) {
   const { push } = useToast();

   const {
      register,
      handleSubmit,
      reset,
      setError,
      formState: { errors },
   } = useForm<OrganizacaoFormData>({
      resolver: zodResolver(organizacaoFormSchema),
      defaultValues: makeDefaultOrganizacaoValues(),
   });

   useEffect(() => {
      if (show) reset(makeDefaultOrganizacaoValues(editingOrg));
   }, [show, editingOrg, reset]);

   const handleFormSubmit = async (data: OrganizacaoFormData) => {
      try {
         await onSubmit(data);
      } catch (err: unknown) {
         // 422 do Pydantic volta como dict campo → mensagem: devolve cada erro
         // ao seu input e resume no toast.
         applyOrganizacaoFieldErrors(err, setError);
         push({
            type: "error",
            message: formatOrganizacaoSaveError(
               err,
               "Erro ao salvar organização"
            ),
         });
      }
   };

   const handleClose = () => {
      if (!isSaving) onClose();
   };

   return (
      <Modal show={show} onClose={handleClose} size="lg" dismissible>
         <ModalHeader className="border-b border-slate-200">
            <div className="flex items-center gap-3">
               <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 ring-1 ring-slate-200 ring-inset">
                  <FaBuilding className="size-5" />
               </div>
               <div>
                  <span className="block text-lg font-bold text-slate-900">
                     {editingOrg ? "Editar Organização" : "Nova Organização"}
                  </span>
                  <span className="block text-sm font-normal text-gray-500">
                     {editingOrg
                        ? "Atualize os dados da organização no diretório."
                        : "Cadastre uma organização no diretório."}
                  </span>
               </div>
            </div>
         </ModalHeader>
         <form onSubmit={handleSubmit(handleFormSubmit)}>
            <ModalBody>
               <div className="space-y-6">
                  <section className="space-y-3">
                     <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <FaHashtag className="size-3.5 text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-700">
                           Siglas
                        </h4>
                     </div>
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1">
                           <Label htmlFor="org-sigla">Sigla (código)</Label>
                           <TextInput
                              id="org-sigla"
                              type="text"
                              placeholder="Ex: 11gt"
                              {...register("sigla")}
                              color={errors.sigla ? "failure" : undefined}
                              autoFocus={!editingOrg}
                              disabled={!!editingOrg}
                              aria-invalid={!!errors.sigla}
                           />
                           {errors.sigla ? (
                              <p className="text-sm text-red-600" role="alert">
                                 {errors.sigla.message}
                              </p>
                           ) : (
                              <p className="text-xs text-gray-500">
                                 {editingOrg
                                    ? "Identificador fixo após a criação."
                                    : "Minúsculas, sem espaço ou acento — vira URL e nome do arquivo de brasão."}
                              </p>
                           )}
                        </div>

                        <div className="space-y-1">
                           <Label htmlFor="org-sigla-2">
                              Sigla 2 (opcional)
                           </Label>
                           <TextInput
                              id="org-sigla-2"
                              type="text"
                              placeholder="Ex: 1gt1"
                              {...register("sigla_2")}
                              color={errors.sigla_2 ? "failure" : undefined}
                              aria-invalid={!!errors.sigla_2}
                           />
                           {errors.sigla_2 && (
                              <p className="text-sm text-red-600" role="alert">
                                 {errors.sigla_2.message}
                              </p>
                           )}
                        </div>

                        <div className="space-y-1">
                           <Label htmlFor="org-sigla-3">
                              Sigla 3 (opcional)
                           </Label>
                           <TextInput
                              id="org-sigla-3"
                              type="text"
                              placeholder="Ex: 1º/1º GT"
                              {...register("sigla_3")}
                              color={errors.sigla_3 ? "failure" : undefined}
                              aria-invalid={!!errors.sigla_3}
                           />
                           {errors.sigla_3 && (
                              <p className="text-sm text-red-600" role="alert">
                                 {errors.sigla_3.message}
                              </p>
                           )}
                        </div>
                     </div>
                  </section>

                  <section className="space-y-3">
                     <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <FaIdCard className="size-3.5 text-gray-400" />
                        <h4 className="text-sm font-semibold text-gray-700">
                           Identificação
                        </h4>
                     </div>

                     <div className="space-y-1">
                        <Label htmlFor="org-nome">Nome</Label>
                        <TextInput
                           id="org-nome"
                           type="text"
                           placeholder="Nome completo da organização"
                           {...register("nome")}
                           color={errors.nome ? "failure" : undefined}
                           aria-invalid={!!errors.nome}
                        />
                        {errors.nome && (
                           <p className="text-sm text-red-600" role="alert">
                              {errors.nome.message}
                           </p>
                        )}
                     </div>

                     <div className="space-y-1">
                        <Label htmlFor="org-alias">Codinome (opcional)</Label>
                        <TextInput
                           id="org-alias"
                           type="text"
                           placeholder="Ex: Esquadrão Pelicano"
                           {...register("alias")}
                           color={errors.alias ? "failure" : undefined}
                           aria-invalid={!!errors.alias}
                        />
                        {errors.alias && (
                           <p className="text-sm text-red-600" role="alert">
                              {errors.alias.message}
                           </p>
                        )}
                     </div>
                  </section>
               </div>
            </ModalBody>
            <ModalFooter className="border-t border-slate-200">
               <Button type="submit" color="dark" disabled={isSaving}>
                  {isSaving ? (
                     <>
                        <Spinner color="gray" size="sm" className="mr-2" />
                        Salvando...
                     </>
                  ) : (
                     <>
                        <FaCheck className="mr-2 size-4" />
                        {editingOrg ? "Atualizar" : "Criar"}
                     </>
                  )}
               </Button>
               <Button color="gray" onClick={handleClose} disabled={isSaving}>
                  Cancelar
               </Button>
            </ModalFooter>
         </form>
      </Modal>
   );
}
