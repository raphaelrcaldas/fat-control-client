"use client";

import { useState, useMemo } from "react";
import {
   Button,
   Label,
   TextInput,
   Checkbox,
   Select,
   Spinner,
} from "flowbite-react";
import {
   ComissList,
   ComissWithMiss,
   Comiss as ComissSchema,
} from "services/routes/cegep/comiss";
import { IoMdSearch } from "react-icons/io";
import { FaSave } from "react-icons/fa";
import { useToast } from "@/app/context/toast";
import { isoStrToDate, dateToIso, formatDateFull } from "utils/dateHandler";
import { UserPublic } from "services/routes/users";
import { SearchUser } from "src/app/(home)/users/components/searchUser";
import { useCreateComiss, useUpdateComiss } from "@/hooks/queries";
import { sanitizeLinha } from "utils/sanitize";
import { ComissDetailHeader } from "./detail/ComissDetailHeader";
import { formatComissSaveError } from "../comissErrors";

interface ComissFormProps {
   comiss?: ComissList | ComissWithMiss;
   onCancel: () => void;
   onSuccess?: () => void;
}

export function ComissForm({ comiss, onCancel, onSuccess }: ComissFormProps) {
   const [showUserSearch, setShowUserSearch] = useState(false);
   const { push } = useToast();

   const createMutation = useCreateComiss();
   const updateMutation = useUpdateComiss();

   const isLoading = createMutation.isPending || updateMutation.isPending;

   const defaultValues = useMemo(
      () => ({
         user: comiss ? comiss.user : null,
         docProp: comiss ? comiss.doc_prop : "",
         docAut: comiss ? comiss.doc_aut : "",
         docEnc: comiss ? (comiss.doc_enc ?? "") : "",
         dataAb: comiss ? comiss.data_ab : "",
         qtdAjAb: comiss ? comiss.qtd_aj_ab : 0,
         valAjAb: comiss ? comiss.valor_aj_ab : 0,
         dataFc: comiss ? comiss.data_fc : "",
         qtdAjFc: comiss ? comiss.qtd_aj_fc : 0,
         valAjFc: comiss ? comiss.valor_aj_fc : 0,
         userId: comiss ? comiss.user_id : null,
         status: comiss ? comiss.status : "",
         dep: comiss ? comiss.dep : false,
         diasCumprir: comiss
            ? comiss.dias_cumprir
               ? comiss.dias_cumprir
               : 0
            : 0,
      }),
      [comiss]
   );

   const [user, setUser] = useState<UserPublic | null>(defaultValues.user);
   const [docProp, setDocProp] = useState(defaultValues.docProp);
   const [docAut, setDocAut] = useState(defaultValues.docAut);
   const [docEnc, setDocEnc] = useState(defaultValues.docEnc);
   const [dataAb, setDataAb] = useState(defaultValues.dataAb);
   const [qtdAjAb, setQtdAjAb] = useState(defaultValues.qtdAjAb);
   const [valAjAb, setValAjAb] = useState(defaultValues.valAjAb);
   const [dataFc, setDataFc] = useState(defaultValues.dataFc);
   const [qtdAjFc, setQtdAjFc] = useState(defaultValues.qtdAjFc);
   const [valAjFc, setValAjFc] = useState(defaultValues.valAjFc);
   const [status, setStatus] = useState(defaultValues.status);
   const [dep, setDep] = useState(defaultValues.dep);
   const [diasCumprir, setDiasCumprir] = useState(defaultValues.diasCumprir);

   function verificarCampos(errors: string[]) {
      if (!user) errors.push("- Militar");
      if (status !== "aberto" && status !== "fechado") errors.push("- Status");
      if (docProp === "") errors.push("- Documento Proposta");
      if (docAut === "") errors.push("- Documento Autorização");
      if (dataAb === "") errors.push("- Data de Abertura");
      if (dataFc === "") errors.push("- Data de Fechamento");
      // Datas ISO (YYYY-MM-DD) comparam lexicograficamente = cronologicamente.
      if (dataAb && dataFc && dataFc < dataAb)
         errors.push(
            "- Data de fechamento não pode ser anterior à de abertura"
         );
      if (qtdAjAb === 0)
         errors.push("- Quantidade da Ajuda de Custo da Abertura");
      if (qtdAjFc === 0)
         errors.push("- Quantidade da Ajuda de Custo do Fechamento");
      if (qtdAjAb < 0 || qtdAjAb > 2 || qtdAjFc < 0 || qtdAjFc > 2)
         errors.push("- Quantidade de ajuda deve estar entre 0 e 2");
      if (valAjAb === 0) errors.push("- Valor da Ajuda de Custo da Abertura");
      if (valAjFc === 0) errors.push("- Valor da Ajuda de Custo do Fechamento");
      if (valAjAb < 0 || valAjFc < 0)
         errors.push("- Valores não podem ser negativos");
   }

   /**
    * Pre-validacao de UX para o fechamento. A API e a guarda autoritativa;
    * aqui apenas bloqueamos cedo e explicamos o motivo, evitando o round-trip.
    *
    * So roda na edicao (quando temos as missoes carregadas). Na criacao, sem
    * missoes em maos, deixamos a API decidir.
    */
   function verificarFechamento(errors: string[]) {
      if (status !== "fechado") return;
      if (!comiss || !("missoes" in comiss)) return;

      if (comiss.completude < 100) {
         errors.push(
            `- Completude está em ${comiss.completude}%; o fechamento exige 100%`
         );
      }

      const missoes = comiss.missoes;
      if (missoes.length === 0) {
         errors.push(
            "- Não há missões vinculadas para fechar o comissionamento"
         );
         return;
      }

      // Ultima missao = maior data de regresso; fechamento deve ser o dia seguinte.
      const ultimaRegres = missoes.reduce((maisRecente, mis) =>
         new Date(mis.regres).getTime() > new Date(maisRecente.regres).getTime()
            ? mis
            : maisRecente
      );

      const diaSeguinte = isoStrToDate(ultimaRegres.regres.split("T")[0]);
      diaSeguinte.setDate(diaSeguinte.getDate() + 1);
      const esperado = dateToIso(diaSeguinte);

      if (dataFc !== esperado) {
         const esperadoBr = formatDateFull(esperado);
         errors.push(
            `- Data de fechamento deve ser ${esperadoBr} (dia seguinte à última missão)`
         );
      }
   }

   async function handleSaveComiss() {
      const errors: string[] = [];
      verificarCampos(errors);
      verificarFechamento(errors);
      if (errors.length > 0) {
         push({
            title: "Campos obrigatórios",
            message: errors.join("\n"),
            type: "error",
            duration: 12000,
         });
         return;
      }

      const comisObj: ComissSchema = {
         user_id: user!.id,
         doc_prop: sanitizeLinha(docProp),
         doc_aut: sanitizeLinha(docAut),
         doc_enc: docEnc ? sanitizeLinha(docEnc) : null,
         data_ab: dataAb,
         data_fc: dataFc,
         qtd_aj_ab: qtdAjAb,
         qtd_aj_fc: qtdAjFc,
         valor_aj_ab: valAjAb,
         valor_aj_fc: valAjFc,
         status: status,
         dep: dep,
         dias_cumprir: diasCumprir == 0 ? null : diasCumprir,
         ...(comiss?.id && { id: comiss.id }),
      };

      const mutation = comiss ? updateMutation : createMutation;

      mutation.mutate(comisObj, {
         onSuccess: (result) => {
            push({
               message: result.message || "Salvo com sucesso",
               type: "success",
            });
            onSuccess?.();
         },
         onError: (err) => {
            const { title, message } = formatComissSaveError(
               err,
               "Erro ao salvar o comissionamento"
            );
            push({ title, message, type: "error", duration: 12000 });
         },
      });
   }

   return (
      <div className="flex w-full justify-center">
         <div className="w-full max-w-7xl space-y-2">
            {/* Barra de comando superior */}
            <ComissDetailHeader
               title={`${comiss ? "Editar" : "Adicionar"} Comissionamento`}
               onClose={onCancel}
               actions={
                  <Button
                     color="red"
                     size="sm"
                     onClick={handleSaveComiss}
                     disabled={isLoading}
                  >
                     {isLoading ? (
                        <>
                           <Spinner
                              size="sm"
                              color="primary"
                              className="sm:mr-2"
                           />
                           <span className="hidden sm:inline">Salvando...</span>
                        </>
                     ) : (
                        <>
                           <FaSave className="size-4 sm:mr-2" />
                           <span className="hidden sm:inline">
                              {comiss ? "Salvar" : "Adicionar"}
                           </span>
                        </>
                     )}
                  </Button>
               }
            />

            {/* Selecao de Militar */}
            <div className="flex items-center justify-center gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
               {user ? (
                  <div className="space-y-1 text-center">
                     <span className="block font-semibold text-gray-900 uppercase">
                        {user.posto.mid} {user.esp} {user.nome_guerra}
                     </span>
                     <span className="text-sm text-gray-600 capitalize">
                        {user.nome_completo}
                     </span>
                  </div>
               ) : (
                  <span className="text-sm font-medium text-red-600">
                     Selecione um militar
                  </span>
               )}

               {!comiss && (
                  <Button
                     pill
                     onClick={() => setShowUserSearch(true)}
                     color="light"
                     className="transition-colors duration-200 hover:bg-white"
                  >
                     <IoMdSearch className="size-5" />
                  </Button>
               )}
            </div>

            <SearchUser
               show={showUserSearch}
               setShow={setShowUserSearch}
               setUser={setUser}
            />

            {/* Documentos */}
            <div className="space-y-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
               <h4 className="text-sm font-semibold tracking-wide text-gray-700 uppercase">
                  Documentos
               </h4>
               <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                     <Label
                        htmlFor="doc-prop"
                        className="mb-2 block text-sm font-medium text-gray-700"
                     >
                        Proposta
                     </Label>
                     <TextInput
                        id="doc-prop"
                        required
                        value={docProp}
                        onChange={(e) => setDocProp(e.target.value)}
                        placeholder="Ex: OF-123/2024"
                     />
                  </div>
                  <div>
                     <Label
                        htmlFor="doc-aut"
                        className="mb-2 block text-sm font-medium text-gray-700"
                     >
                        Autorização
                     </Label>
                     <TextInput
                        id="doc-aut"
                        required
                        value={docAut}
                        onChange={(e) => setDocAut(e.target.value)}
                        placeholder="Ex: PORT-456/2024"
                     />
                  </div>
                  <div>
                     <Label
                        htmlFor="doc-enc"
                        className="mb-2 block text-sm font-medium text-gray-700"
                     >
                        Encerramento
                     </Label>
                     <TextInput
                        id="doc-enc"
                        value={docEnc}
                        onChange={(e) => setDocEnc(e.target.value)}
                        placeholder="Ex: OF-789/2024"
                     />
                  </div>
               </div>
            </div>

            {/* Datas e Valores */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               {/* Abertura */}
               <div className="rounded border border-emerald-200 bg-white p-5 shadow-sm">
                  <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                     <div className="h-2 w-2 rounded-full bg-emerald-500" />
                     Abertura
                  </h4>
                  <div className="space-y-4">
                     <div>
                        <Label className="mb-1.5 block text-xs font-medium text-gray-600">
                           Data
                        </Label>
                        <TextInput
                           type="date"
                           value={dataAb}
                           onChange={(e) => setDataAb(e.target.value)}
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <Label className="mb-1.5 block text-xs font-medium text-gray-600">
                              Qtd. Ajuda
                           </Label>
                           <TextInput
                              value={qtdAjAb}
                              type="number"
                              min={0}
                              max={2}
                              step={0.5}
                              onChange={(e) =>
                                 setQtdAjAb(Number(e.target.value))
                              }
                           />
                        </div>
                        <div>
                           <Label className="mb-1.5 block text-xs font-medium text-gray-600">
                              Valor (R$)
                           </Label>
                           <TextInput
                              value={valAjAb}
                              min={0}
                              type="number"
                              step={0.01}
                              onChange={(e) =>
                                 setValAjAb(Number(e.target.value))
                              }
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Fechamento */}
               <div className="rounded border border-orange-200 bg-white p-5 shadow-sm">
                  <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-orange-800">
                     <div className="h-2 w-2 rounded-full bg-orange-500" />
                     Fechamento
                  </h4>
                  <div className="space-y-4">
                     <div>
                        <Label className="mb-1.5 block text-xs font-medium text-gray-600">
                           Data
                        </Label>
                        <TextInput
                           type="date"
                           min={dataAb}
                           value={dataFc}
                           onChange={(e) => setDataFc(e.target.value)}
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <Label className="mb-1.5 block text-xs font-medium text-gray-600">
                              Qtd. Ajuda
                           </Label>
                           <TextInput
                              value={qtdAjFc}
                              type="number"
                              min={0}
                              max={2}
                              step={0.5}
                              onChange={(e) =>
                                 setQtdAjFc(Number(e.target.value))
                              }
                           />
                        </div>
                        <div>
                           <Label className="mb-1.5 block text-xs font-medium text-gray-600">
                              Valor (R$)
                           </Label>
                           <TextInput
                              value={valAjFc}
                              min={0}
                              type="number"
                              step={0.01}
                              onChange={(e) =>
                                 setValAjFc(Number(e.target.value))
                              }
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Configuracoes Adicionais */}
            <div className="space-y-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
               <h4 className="text-sm font-semibold tracking-wide text-gray-700 uppercase">
                  Configurações
               </h4>
               <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                     <Label
                        htmlFor="status"
                        className="mb-2 block text-sm font-medium text-gray-700"
                     >
                        Status
                     </Label>
                     <Select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                     >
                        <option value="" disabled>
                           Selecione
                        </option>
                        <option value="aberto">Aberto</option>
                        <option value="fechado">Fechado</option>
                     </Select>
                  </div>
                  <div>
                     <Label
                        htmlFor="dias-cumprir"
                        className="mb-2 block text-sm font-medium text-gray-700"
                     >
                        Dias a Cumprir
                     </Label>
                     <TextInput
                        id="dias-cumprir"
                        type="number"
                        min={0}
                        value={diasCumprir}
                        onChange={(e) => setDiasCumprir(Number(e.target.value))}
                        placeholder="0 = Comparativo"
                     />
                  </div>
                  <div className="flex flex-col justify-center">
                     <Label
                        htmlFor="dep"
                        className="mb-2 block text-sm font-medium text-gray-700"
                     >
                        Possui Dependente
                     </Label>
                     <div className="flex items-center gap-2">
                        <Checkbox
                           id="dep"
                           color="red"
                           className="h-5 w-5"
                           checked={dep}
                           onChange={(e) => setDep(e.target.checked)}
                        />
                        <span className="text-sm text-gray-600">
                           {dep ? "Sim" : "Não"}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
