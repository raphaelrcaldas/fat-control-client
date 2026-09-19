"use client";

import { useEffect, useState } from "react";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Select,
   Spinner,
} from "flowbite-react";
import clsx from "clsx";
import { HiOutlineLocationMarker, HiSearch, HiTrash } from "react-icons/hi";

import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { SearchLocal } from "@/components/location/SearchLocal";
import { PermBased, usePermBased } from "@/app/(home)/hooks/usePermBased";
import { GRUPO_A, GRUPO_B, type LocEsp } from "services/routes/cegep/gle";

import {
   createEmptyForm,
   formFromLocEsp,
   FUSOS,
   toPayload,
   validateForm,
   type LocEspFormState,
} from "../helpers/locEspForm";
import { IcaoInput } from "./IcaoInput";

interface LocEspFormModalProps {
   show: boolean;
   /** `null` = criação. */
   localidade: LocEsp | null;
   isSaving: boolean;
   isDeleting: boolean;
   onClose: () => void;
   onSave: (payload: ReturnType<typeof toPayload>) => Promise<void>;
   onDelete: (id: number) => Promise<void>;
}

export function LocEspFormModal({
   show,
   localidade,
   isSaving,
   isDeleting,
   onClose,
   onSave,
   onDelete,
}: LocEspFormModalProps) {
   const [form, setForm] = useState<LocEspFormState>(createEmptyForm);
   const [errors, setErrors] = useState<Record<string, string>>({});
   const [showBuscaCidade, setShowBuscaCidade] = useState(false);
   const [showConfirmDelete, setShowConfirmDelete] = useState(false);

   const isEdicao = localidade !== null;
   const { hasPerm } = usePermBased();
   const podeSalvar = hasPerm("cegep.gle", isEdicao ? "update" : "create");

   // Reidrata ao abrir: o modal é montado uma vez e reaproveitado entre
   // itens, então sem isto o segundo clique mostraria o primeiro registro.
   useEffect(() => {
      if (!show) return;
      setForm(localidade ? formFromLocEsp(localidade) : createEmptyForm());
      setErrors({});
   }, [show, localidade]);

   function patch(dados: Partial<LocEspFormState>) {
      setForm((atual) => ({ ...atual, ...dados }));
   }

   async function handleSubmit() {
      const problemas = validateForm(form);
      setErrors(problemas);
      if (Object.keys(problemas).length > 0) return;
      await onSave(toPayload(form));
   }

   return (
      <>
         <Modal show={show} onClose={onClose} size="lg">
            <ModalHeader>
               {isEdicao ? "Editar localidade" : "Nova localidade especial"}
            </ModalHeader>

            <ModalBody>
               <div className="space-y-4">
                  {/* Município */}
                  <div>
                     <Label htmlFor="cidade" className="mb-1 block">
                        Município
                     </Label>
                     {/* Botão, não input readOnly: o campo não recebe
                         digitação — abre a busca. Um input somente-leitura
                         ainda recebe foco de digitação e o Flowbite o pinta
                         como campo em erro. */}
                     <div className="flex gap-2">
                        <button
                           id="cidade"
                           type="button"
                           onClick={() => setShowBuscaCidade(true)}
                           className={clsx(
                              "flex min-h-[42px] flex-1 items-center gap-2 rounded border bg-white p-2.5 text-left text-sm transition-colors",
                              "focus:border-primary-500 focus:ring-primary-500 focus:ring-1 focus:outline-none",
                              errors.cidade_id
                                 ? "border-red-500 text-red-900"
                                 : "border-gray-300 hover:border-slate-400"
                           )}
                           aria-invalid={errors.cidade_id ? true : undefined}
                        >
                           <HiOutlineLocationMarker className="h-4 w-4 shrink-0 text-slate-400" />
                           <span
                              className={clsx(
                                 "truncate",
                                 form.cidade_label
                                    ? "text-slate-900"
                                    : "text-slate-500"
                              )}
                           >
                              {form.cidade_label ||
                                 "Nenhum município selecionado"}
                           </span>
                        </button>
                        <Button
                           type="button"
                           color="light"
                           onClick={() => setShowBuscaCidade(true)}
                           aria-label="Buscar município"
                        >
                           <HiSearch className="h-4 w-4 sm:mr-2" />
                           <span className="hidden sm:inline">Buscar</span>
                        </Button>
                     </div>
                     {errors.cidade_id && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                           {errors.cidade_id}
                        </p>
                     )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                     {/* Grupo */}
                     <div>
                        <Label htmlFor="grupo" className="mb-1 block">
                           Grupo
                        </Label>
                        <Select
                           id="grupo"
                           value={form.grupo}
                           onChange={(e) =>
                              patch({ grupo: Number(e.target.value) })
                           }
                           color={errors.grupo ? "failure" : undefined}
                        >
                           <option value={GRUPO_A}>A</option>
                           <option value={GRUPO_B}>B</option>
                        </Select>
                        {errors.grupo && (
                           <p
                              className="mt-1 text-sm text-red-600"
                              role="alert"
                           >
                              {errors.grupo}
                           </p>
                        )}
                     </div>

                     {/* Fuso */}
                     <div>
                        <Label htmlFor="fuso" className="mb-1 block">
                           Fuso horário
                        </Label>
                        <Select
                           id="fuso"
                           value={form.fuso}
                           onChange={(e) =>
                              patch({ fuso: Number(e.target.value) })
                           }
                           color={errors.fuso ? "failure" : undefined}
                        >
                           {FUSOS.map((f) => (
                              <option key={f} value={f}>
                                 UTC−{Math.abs(f)}
                              </option>
                           ))}
                        </Select>
                        {errors.fuso && (
                           <p
                              className="mt-1 text-sm text-red-600"
                              role="alert"
                           >
                              {errors.fuso}
                           </p>
                        )}
                     </div>
                  </div>

                  {/* ICAOs */}
                  <div>
                     <Label htmlFor="icao" className="mb-1 block">
                        Aeródromos (ICAO)
                     </Label>
                     <IcaoInput
                        value={form.icaos}
                        onChange={(icaos) => {
                           patch({ icaos });
                           if (errors.icaos) {
                              setErrors((e) => {
                                 const { icaos: _, ...resto } = e;
                                 return resto;
                              });
                           }
                        }}
                        error={errors.icaos}
                        disabled={isSaving}
                     />
                  </div>
               </div>
               {!podeSalvar && (
                  <p className="mt-4 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                     Você não tem permissão para{" "}
                     {isEdicao ? "editar" : "cadastrar"} localidades. Os dados
                     acima estão disponíveis apenas para consulta.
                  </p>
               )}
            </ModalBody>

            <ModalFooter className="justify-between">
               {isEdicao ? (
                  <PermBased resource="cegep.gle" requiredPerm="delete">
                     <Button
                        color="light"
                        onClick={() => setShowConfirmDelete(true)}
                        disabled={isSaving || isDeleting}
                        className="text-red-600"
                     >
                        <HiTrash className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Excluir</span>
                     </Button>
                  </PermBased>
               ) : (
                  <span />
               )}

               <div className="flex gap-2">
                  <Button color="light" onClick={onClose} disabled={isSaving}>
                     {podeSalvar ? "Cancelar" : "Fechar"}
                  </Button>
                  {/* Gate pelo modo: quem tem `create` e não `update` (ou o
                      inverso) não deve ver um Salvar que o backend vai
                      recusar com 403. Escondido, não desabilitado — e o
                      aviso abaixo diz por quê, em vez de deixar o usuário
                      preencher tudo para perder o trabalho. */}
                  <PermBased
                     resource="cegep.gle"
                     requiredPerm={isEdicao ? "update" : "create"}
                  >
                     <Button
                        color="primary"
                        onClick={handleSubmit}
                        disabled={isSaving}
                     >
                        {isSaving && (
                           <Spinner
                              size="sm"
                              color="primary"
                              className="mr-2"
                           />
                        )}
                        {isEdicao ? "Salvar" : "Cadastrar"}
                     </Button>
                  </PermBased>
               </div>
            </ModalFooter>
         </Modal>

         <SearchLocal
            show={showBuscaCidade}
            setShow={setShowBuscaCidade}
            setLocal={(local) => {
               patch({
                  cidade_id: local.codigo,
                  cidade_label: `${local.nome} - ${local.uf}`,
               });
               setErrors((e) => {
                  const { cidade_id: _, ...resto } = e;
                  return resto;
               });
            }}
         />

         <ConfirmModal
            show={showConfirmDelete}
            onClose={() => setShowConfirmDelete(false)}
            onConfirm={async () => {
               if (!localidade) return;
               await onDelete(localidade.id);
               setShowConfirmDelete(false);
            }}
            title="Remover localidade especial"
            description={
               <>
                  Remover <strong>{localidade?.cidade.nome}</strong> da lista de
                  localidades especiais? Os aeródromos vinculados (
                  {localidade?.icaos.join(", ") || "nenhum"}) saem junto, e as
                  etapas que passaram por lá deixam de ser identificadas na
                  pesquisa.
               </>
            }
            confirmButtonText="Remover"
            isLoading={isDeleting}
         />
      </>
   );
}
