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
import { HiArrowLeft } from "react-icons/hi";
import { useToast } from "@/app/context/toast";
import { isoStrToDate } from "utils/dateHandler";
import { UserPublic } from "services/routes/users";
import { SearchUser } from "src/app/(home)/users/components/searchUser";
import { useCreateComiss, useUpdateComiss } from "@/hooks/queries";
import { sanitizeLinha } from "utils/sanitize";

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
         docEnc: comiss ? comiss.doc_enc : "",
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
      if (docProp === "") errors.push("- Documento Proposta");
      if (docAut === "") errors.push("- Documento Autorizacao");
      if (dataAb === "") errors.push("- Data de Abertura");
      if (dataFc === "") errors.push("- Data de Encerramento");
      if (qtdAjAb === 0)
         errors.push("- Quantidade da Ajuda de Custo da Abertura");
      if (qtdAjFc === 0)
         errors.push("- Quantidade da Ajuda de Custo do Encerramento");
      if (valAjAb === 0) errors.push("- Valor da Ajuda de Custo da Abertura");
      if (valAjFc === 0)
         errors.push("- Valor da Ajuda de Custo do Encerramento");
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
            `- Completude esta em ${comiss.completude}%; o fechamento exige 100%`
         );
      }

      const missoes = comiss.missoes;
      if (missoes.length === 0) {
         errors.push(
            "- Nao ha missoes vinculadas para fechar o comissionamento"
         );
         return;
      }

      // Ultima missao = maior data de regresso; fechamento deve ser o dia seguinte.
      const ultimaRegres = missoes.reduce((maisRecente, mis) =>
         new Date(mis.regres).getTime() > new Date(maisRecente.regres).getTime()
            ? mis
            : maisRecente
      );

      const [ano, mes, dia] = ultimaRegres.regres
         .split("T")[0]
         .split("-")
         .map(Number);
      const diaSeguinte = new Date(ano, mes - 1, dia + 1);
      const esperado = `${diaSeguinte.getFullYear()}-${String(
         diaSeguinte.getMonth() + 1
      ).padStart(2, "0")}-${String(diaSeguinte.getDate()).padStart(2, "0")}`;

      if (dataFc !== esperado) {
         const esperadoBr = isoStrToDate(esperado).toLocaleDateString("pt-br");
         errors.push(
            `- Data de fechamento deve ser ${esperadoBr} (dia seguinte a ultima missao)`
         );
      }
   }

   async function handleSaveComiss() {
      const errors: string[] = [];
      verificarCampos(errors);
      verificarFechamento(errors);
      if (errors.length > 0) {
         push({
            title: "Campos obrigatorios",
            message: errors.join("\n"),
            type: "error",
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
            if (result.ok) {
               push({
                  message: result.message || "Salvo com sucesso",
                  type: "success",
               });
               onSuccess?.();
            } else {
               push({
                  title: "Erro",
                  message: result.message || "Erro ao salvar o comissionamento",
                  type: "error",
               });
            }
         },
         onError: (err: Error) => {
            push({
               title: "Erro",
               message: err?.message || "Erro ao salvar o comissionamento",
               type: "error",
            });
         },
      });
   }

   return (
      <div className="flex w-full justify-center">
         <div className="flex w-full max-w-7xl flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
               <button
                  onClick={onCancel}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
               >
                  <HiArrowLeft className="h-4 w-4" />
                  {comiss ? "Cancelar" : "Voltar"}
               </button>
               <h2 className="text-lg font-bold text-gray-900">
                  {comiss ? "Editar" : "Adicionar"} Comissionamento
               </h2>
               <div className="w-20" />
            </div>

            {/* Selecao de Militar */}
            <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
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
            <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
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
                        Autorizacao
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
               <div className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
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
               <div className="rounded-xl border border-orange-200 bg-white p-5 shadow-sm">
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
            <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
               <h4 className="text-sm font-semibold tracking-wide text-gray-700 uppercase">
                  Configuracoes
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
                           color="blue"
                           className="h-5 w-5"
                           checked={dep}
                           onChange={(e) => setDep(e.target.checked)}
                        />
                        <span className="text-sm text-gray-600">
                           {dep ? "Sim" : "Nao"}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Botoes */}
            <div className="flex justify-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
               <Button color="gray" onClick={onCancel} disabled={isLoading}>
                  Cancelar
               </Button>
               <Button
                  className="px-6"
                  color="blue"
                  onClick={handleSaveComiss}
                  disabled={isLoading}
               >
                  {isLoading ? (
                     <div className="flex items-center gap-2">
                        <Spinner size="sm" color="failure" />
                        <span>Salvando...</span>
                     </div>
                  ) : comiss ? (
                     "Salvar Alteracoes"
                  ) : (
                     "Adicionar Comissionamento"
                  )}
               </Button>
            </div>
         </div>
      </div>
   );
}
