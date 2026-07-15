"use client";

import {
   Modal,
   ModalHeader,
   ModalBody,
   Label,
   TextInput,
   Select,
   Button,
   Spinner,
   HelperText,
} from "flowbite-react";
import clsx from "clsx";
import type { DiariaFormData } from "../types";
import type { DiariaFormErrors } from "../schemas/diariaFormSchema";
import { formatDiariaDate } from "../utils";
import { GRUPO_CIDADE_LABELS, GRUPO_PG_LABELS } from "../labels";

interface DiariaFormModalProps {
   show: boolean;
   isCreating: boolean;
   formData: DiariaFormData;
   hasChanges: boolean;
   isSubmitting: boolean;
   errors: DiariaFormErrors;
   uniqueGruposCidade: number[];
   uniqueGruposPg: number[];
   descricaoCidade: Record<number, string>;
   descricaoPg: Record<number, string>;
   onClose: () => void;
   onSubmit: (e: React.FormEvent) => Promise<void>;
   onFieldChange: (field: keyof DiariaFormData, value: string | number) => void;
}

export function DiariaFormModal({
   show,
   isCreating,
   formData,
   hasChanges,
   isSubmitting,
   errors,
   uniqueGruposCidade,
   uniqueGruposPg,
   descricaoCidade,
   descricaoPg,
   onClose,
   onSubmit,
   onFieldChange,
}: DiariaFormModalProps) {
   const isDisabled = isSubmitting;

   return (
      <Modal show={show} onClose={isDisabled ? undefined : onClose} size="xl">
         <ModalHeader>
            {isCreating ? "Nova Diaria" : "Editar Valor de Diaria"}
         </ModalHeader>
         <ModalBody>
            <form onSubmit={onSubmit} className="space-y-4">
               {isCreating && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <div>
                        <Label htmlFor="grupo_cid">Grupo Cidade</Label>
                        <Select
                           id="grupo_cid"
                           value={formData.grupo_cid}
                           onChange={(e) =>
                              onFieldChange("grupo_cid", Number(e.target.value))
                           }
                           disabled={isDisabled}
                           color={errors.grupo_cid ? "failure" : undefined}
                        >
                           {uniqueGruposCidade.map((g) => (
                              <option key={g} value={g}>
                                 {GRUPO_CIDADE_LABELS[g] || `Grupo ${g}`}
                              </option>
                           ))}
                        </Select>
                        {errors.grupo_cid ? (
                           <HelperText color="failure">
                              {errors.grupo_cid}
                           </HelperText>
                        ) : (
                           <HelperText color="gray">
                              {descricaoCidade[formData.grupo_cid] ||
                                 "Selecione um grupo"}
                           </HelperText>
                        )}
                     </div>
                     <div>
                        <Label htmlFor="grupo_pg">Grupo P/G</Label>
                        <Select
                           id="grupo_pg"
                           value={formData.grupo_pg}
                           onChange={(e) =>
                              onFieldChange("grupo_pg", Number(e.target.value))
                           }
                           disabled={isDisabled}
                           color={errors.grupo_pg ? "failure" : undefined}
                        >
                           {uniqueGruposPg.map((g) => (
                              <option key={g} value={g}>
                                 {GRUPO_PG_LABELS[g] || `Grupo ${g}`}
                              </option>
                           ))}
                        </Select>
                        {errors.grupo_pg ? (
                           <HelperText color="failure">
                              {errors.grupo_pg}
                           </HelperText>
                        ) : (
                           <HelperText color="gray">
                              {descricaoPg[formData.grupo_pg] ||
                                 "Selecione um grupo"}
                           </HelperText>
                        )}
                     </div>
                  </div>
               )}

               <div className="grid max-w-60 items-center">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <TextInput
                     id="valor"
                     type="text"
                     inputMode="decimal"
                     placeholder="0,00"
                     value={formData.valor}
                     onChange={(e) => {
                        // Permite apenas números, vírgula e ponto
                        const value = e.target.value.replace(/[^\d.,]/g, "");
                        onFieldChange("valor", value);
                     }}
                     disabled={isDisabled}
                     color={errors.valor ? "failure" : undefined}
                     className={clsx(
                        "font-mono",
                        errors.valor && "border-red-500"
                     )}
                  />
                  {errors.valor ? (
                     <HelperText color="failure">{errors.valor}</HelperText>
                  ) : (
                     <HelperText color="gray">
                        Digite o valor em reais (ex: 150,00)
                     </HelperText>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <Label htmlFor="data_inicio">Data Início</Label>
                     <TextInput
                        id="data_inicio"
                        type="date"
                        value={formData.data_inicio}
                        onChange={(e) =>
                           onFieldChange("data_inicio", e.target.value)
                        }
                        disabled={isDisabled}
                        color={errors.data_inicio ? "failure" : undefined}
                     />
                     {errors.data_inicio ? (
                        <HelperText color="failure">
                           {errors.data_inicio}
                        </HelperText>
                     ) : formData.data_inicio ? (
                        <HelperText color="gray">
                           {formatDiariaDate(formData.data_inicio)}
                        </HelperText>
                     ) : null}
                  </div>

                  <div>
                     <Label htmlFor="data_fim">Data Fim (opcional)</Label>
                     <TextInput
                        id="data_fim"
                        type="date"
                        value={formData.data_fim}
                        min={formData.data_inicio || undefined}
                        onChange={(e) =>
                           onFieldChange("data_fim", e.target.value)
                        }
                        disabled={isDisabled}
                        color={errors.data_fim ? "failure" : undefined}
                     />
                     {errors.data_fim ? (
                        <HelperText color="failure">
                           {errors.data_fim}
                        </HelperText>
                     ) : formData.data_fim ? (
                        <HelperText color="gray">
                           {formatDiariaDate(formData.data_fim)}
                        </HelperText>
                     ) : (
                        <HelperText color="gray">
                           Deixe em branco para vigência indeterminada
                        </HelperText>
                     )}
                  </div>
               </div>

               <div className="flex justify-end gap-2 pt-4">
                  <Button color="gray" onClick={onClose} disabled={isDisabled}>
                     Cancelar
                  </Button>
                  <Button
                     type="submit"
                     color="red"
                     disabled={!hasChanges || isDisabled}
                  >
                     {isSubmitting ? (
                        <>
                           <Spinner
                              size="sm"
                              className="mr-2"
                              color="primary"
                           />
                           Salvando...
                        </>
                     ) : isCreating ? (
                        "Criar"
                     ) : (
                        "Salvar"
                     )}
                  </Button>
               </div>
            </form>
         </ModalBody>
      </Modal>
   );
}
