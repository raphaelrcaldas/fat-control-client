import { Label, Select, TextInput } from "flowbite-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import {
   TODAS_FUNCOES,
   getFuncLabel,
   OPER_LABELS,
} from "@/constants/tripulantes";
import { useOrgProjetos } from "@/hooks/queries/useAeronaves";

type FuncFieldsProps = {
   register: UseFormRegister<any>;
   errors: FieldErrors<any>;
   currentOper?: string;
};

/**
 * Campos da função única (1:1) do tripulante: func, oper, proj e data_op.
 * Compartilhado entre o cadastro e a edição de tripulante — a função deixou
 * de ser entidade separada e passou a viver no próprio tripulante.
 *
 * `proj` é FK para `projetos_anvs.modelo` e as opções são os projetos
 * operados pela org ativa (tenant_projetos), não uma lista fixa.
 */
export function FuncFields({ register, errors, currentOper }: FuncFieldsProps) {
   const { data: projetos = [], isLoading: loadingProjetos } = useOrgProjetos();

   return (
      <div className="grid grid-cols-2 gap-4">
         <div className="flex flex-col gap-2">
            <Label htmlFor="func" className="text-sm font-semibold">
               Função <span className="text-red-500">*</span>
            </Label>
            <Select
               id="func"
               {...register("func", { required: "Função é obrigatória" })}
               color={errors.func ? "failure" : "gray"}
            >
               <option value="">Selecione</option>
               {TODAS_FUNCOES.map((func) => (
                  <option key={func} value={func}>
                     {func.toUpperCase()} - {getFuncLabel(func)}
                  </option>
               ))}
            </Select>
            {errors.func && (
               <p className="mt-1 text-sm text-red-600">
                  {String(errors.func.message)}
               </p>
            )}
         </div>

         <div className="flex flex-col gap-2">
            <Label htmlFor="oper" className="text-sm font-semibold">
               Operacionalidade <span className="text-red-500">*</span>
            </Label>
            <Select
               id="oper"
               {...register("oper", {
                  required: "Operacionalidade é obrigatória",
               })}
               color={errors.oper ? "failure" : "gray"}
            >
               <option value="">Selecione</option>
               {Object.entries(OPER_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                     {key.toUpperCase()} - {label}
                  </option>
               ))}
            </Select>
            {errors.oper && (
               <p className="mt-1 text-sm text-red-600">
                  {String(errors.oper.message)}
               </p>
            )}
         </div>

         <div className="flex flex-col gap-2">
            <Label htmlFor="proj" className="text-sm font-semibold">
               Projeto <span className="text-red-500">*</span>
            </Label>
            <Select
               id="proj"
               disabled={loadingProjetos}
               {...register("proj", { required: "Projeto é obrigatório" })}
               color={errors.proj ? "failure" : "gray"}
            >
               <option value="">
                  {loadingProjetos ? "Carregando..." : "Selecione"}
               </option>
               {projetos.map((projeto) => (
                  <option key={projeto.id_projeto} value={projeto.modelo}>
                     {projeto.modelo.toUpperCase()}
                  </option>
               ))}
            </Select>
            {errors.proj && (
               <p className="mt-1 text-sm text-red-600">
                  {String(errors.proj.message)}
               </p>
            )}
         </div>

         <div className="flex flex-col gap-2">
            <Label htmlFor="data_op" className="text-sm font-semibold">
               Data Operacional
               {currentOper !== "al" && (
                  <span className="text-red-500"> *</span>
               )}
            </Label>
            <TextInput
               id="data_op"
               type="date"
               {...register("data_op", {
                  validate: (value: string, formValues: { oper: string }) => {
                     if (formValues.oper !== "al" && !value?.trim()) {
                        return "Data operacional é obrigatória";
                     }
                     return true;
                  },
               })}
               color={errors.data_op ? "failure" : "gray"}
            />
            {errors.data_op ? (
               <p className="mt-1 text-sm text-red-600">
                  {String(errors.data_op.message)}
               </p>
            ) : currentOper === "al" ? (
               <p className="text-xs text-gray-500">Opcional para alunos</p>
            ) : (
               <p className="text-xs text-gray-500">
                  Obrigatório para operacionais
               </p>
            )}
         </div>
      </div>
   );
}
