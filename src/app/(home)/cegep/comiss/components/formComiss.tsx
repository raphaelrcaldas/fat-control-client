import {
   Modal,
   ModalBody,
   ModalHeader,
   Label,
   TextInput,
   Checkbox,
   Button,
   Select,
   Spinner,
   ModalFooter,
} from "flowbite-react";
import { useState, useMemo } from "react";
import { IoMdSearch } from "react-icons/io";
import { UserPublic } from "services/routes/users";
import { Comiss as ComissSchema } from "services/routes/cegep/comiss";
import { createCmto, updateCmto } from "services/routes/cegep/comiss";
import { SearchUser } from "src/app/(home)/users/components/searchUser";
import { useToast } from "@/app/context/toast";

export function FormComiss({
   show,
   setShow,
   comiss,
   update,
}: {
   show: boolean;
   setShow: React.Dispatch<React.SetStateAction<boolean>>;
   comiss?: ComissSchema;
   update: () => void;
}) {
   const [showUserSearch, setShowUserSearch] = useState(false);
   const { push } = useToast();

   // Valores padrões do militar
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
   const [valAjFc, setValAjFC] = useState(defaultValues.valAjFc);
   const [status, setStatus] = useState(defaultValues.status);
   const [dep, setDep] = useState(defaultValues.dep);
   const [diasCumprir, setDiasCumprir] = useState(defaultValues.diasCumprir);

   const [isLoading, setIsLoading] = useState(false);

   function verificarCampos(errors: string[]) {
      if (!(docProp != "")) errors.push("- Documento Proposta");
      if (!(docAut != "")) errors.push("- Documento Autorização");
      if (!(dataAb != "")) errors.push("- Data de Abertura");
      if (!(dataFc != "")) errors.push("- Data de Encerramento");
      if (!(qtdAjAb != 0))
         errors.push("- Quantidade da Ajuda de Custo da Abertura");
      if (!(qtdAjFc != 0))
         errors.push("- Quantidade da Ajuda de Custo do Encerramento");
      if (!(valAjAb != 0)) errors.push("- Valor da Ajuda de Custo da Abertura");
      if (!(valAjFc != 0))
         errors.push("- Valor da Ajuda de Custo do Encerramento");
   }

   async function handleComiss() {
      let errors = [];
      verificarCampos(errors);
      if (errors.length > 0) {
         // Apenas retorna, não mostra push nem alert
         setIsLoading(false);
         return;
      }
      setIsLoading(true);

      const comisObj: ComissSchema = {
         user_id: user.id,
         doc_prop: docProp,
         doc_aut: docAut,
         doc_enc: docEnc,
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

      try {
         const res = comiss
            ? await updateCmto(comisObj)
            : await createCmto(comisObj);

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.detail || "Erro desconhecido");
         }

         push({
            message: data.detail || "Erro desconhecido",
            type: res.ok ? "success" : "error",
         });

         update();
         setShow(false);
      } catch (err) {
         push({
            title: "Erro",
            message: "Erro ao salvar o comissionamento: " + err.message,
            type: "error",
         });
      } finally {
         setIsLoading(false);
      }
   }

   return (
      <Modal show={show} size='6xl' onClose={() => setShow(false)}>
         <ModalHeader className='border-b border-gray-200'>
            <h3 className='text-xl font-semibold text-gray-900'>
               {comiss ? "Editar" : "Adicionar"} Comissionamento
            </h3>
         </ModalHeader>
         <ModalBody className='space-y-6'>
            {/* Seleção de Militar */}
            <div className='flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200'>
               {user ? (
                  <div className='text-center space-y-1'>
                     <span className='font-semibold text-gray-900 uppercase block'>
                        {user.posto.mid} {user.esp} {user.nome_guerra}
                     </span>
                     <span className='text-sm text-gray-600 capitalize'>
                        {user.nome_completo}
                     </span>
                  </div>
               ) : (
                  <span className='text-red-600 text-sm font-medium'>
                     Selecione um militar
                  </span>
               )}

               {!comiss && (
                  <Button
                     pill
                     onClick={() => setShowUserSearch(true)}
                     color='light'
                     className='hover:bg-white transition-colors duration-200'
                  >
                     <IoMdSearch className='size-5' />
                  </Button>
               )}
            </div>

            <SearchUser
               show={showUserSearch}
               setShow={setShowUserSearch}
               setUser={setUser}
            />

            {/* Documentos */}
            <div className='space-y-3'>
               <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
                  Documentos
               </h4>
               <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                     <Label htmlFor='doc-prop' className='text-sm font-medium text-gray-700 mb-2 block'>
                        Proposta
                     </Label>
                     <TextInput
                        id='doc-prop'
                        required
                        value={docProp}
                        onChange={(e) => setDocProp(e.target.value)}
                        placeholder='Ex: OF-123/2024'
                     />
                  </div>
                  <div>
                     <Label htmlFor='doc-aut' className='text-sm font-medium text-gray-700 mb-2 block'>
                        Autorização
                     </Label>
                     <TextInput
                        id='doc-aut'
                        required
                        value={docAut}
                        onChange={(e) => setDocAut(e.target.value)}
                        placeholder='Ex: PORT-456/2024'
                     />
                  </div>
                  <div>
                     <Label htmlFor='doc-enc' className='text-sm font-medium text-gray-700 mb-2 block'>
                        Encerramento
                     </Label>
                     <TextInput
                        id='doc-enc'
                        value={docEnc}
                        onChange={(e) => setDocEnc(e.target.value)}
                        placeholder='Ex: OF-789/2024'
                     />
                  </div>
               </div>
            </div>

            {/* Datas e Valores */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
               {/* Abertura */}
               <div className='bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-xl border border-emerald-200 shadow-sm'>
                  <h4 className='text-sm font-semibold text-emerald-800 mb-4 flex items-center gap-2'>
                     <div className='w-2 h-2 bg-emerald-500 rounded-full' />
                     Abertura
                  </h4>
                  <div className='space-y-4'>
                     <div>
                        <Label className='text-xs font-medium text-gray-600 mb-1.5 block'>
                           Data
                        </Label>
                        <TextInput
                           type='date'
                           value={dataAb}
                           onChange={(e) => setDataAb(e.target.value)}
                        />
                     </div>
                     <div className='grid grid-cols-2 gap-3'>
                        <div>
                           <Label className='text-xs font-medium text-gray-600 mb-1.5 block'>
                              Qtd. Ajuda
                           </Label>
                           <TextInput
                              value={qtdAjAb}
                              type='number'
                              min={0}
                              max={2}
                              step={0.5}
                              onChange={(e) => setQtdAjAb(Number(e.target.value))}
                           />
                        </div>
                        <div>
                           <Label className='text-xs font-medium text-gray-600 mb-1.5 block'>
                              Valor (R$)
                           </Label>
                           <TextInput
                              value={valAjAb}
                              min={0}
                              type='number'
                              step={0.01}
                              onChange={(e) => setValAjAb(Number(e.target.value))}
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Fechamento */}
               <div className='bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border border-orange-200 shadow-sm'>
                  <h4 className='text-sm font-semibold text-orange-800 mb-4 flex items-center gap-2'>
                     <div className='w-2 h-2 bg-orange-500 rounded-full' />
                     Fechamento
                  </h4>
                  <div className='space-y-4'>
                     <div>
                        <Label className='text-xs font-medium text-gray-600 mb-1.5 block'>
                           Data
                        </Label>
                        <TextInput
                           type='date'
                           min={dataAb}
                           value={dataFc}
                           onChange={(e) => setDataFc(e.target.value)}
                        />
                     </div>
                     <div className='grid grid-cols-2 gap-3'>
                        <div>
                           <Label className='text-xs font-medium text-gray-600 mb-1.5 block'>
                              Qtd. Ajuda
                           </Label>
                           <TextInput
                              value={qtdAjFc}
                              type='number'
                              min={0}
                              max={2}
                              step={0.5}
                              onChange={(e) => setQtdAjFc(Number(e.target.value))}
                           />
                        </div>
                        <div>
                           <Label className='text-xs font-medium text-gray-600 mb-1.5 block'>
                              Valor (R$)
                           </Label>
                           <TextInput
                              value={valAjFc}
                              min={0}
                              type='number'
                              step={0.01}
                              onChange={(e) => setValAjFC(Number(e.target.value))}
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Configurações Adicionais */}
            <div className='space-y-3'>
               <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
                  Configurações
               </h4>
               <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                     <Label htmlFor='status' className='text-sm font-medium text-gray-700 mb-2 block'>
                        Status
                     </Label>
                     <Select
                        id='status'
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                     >
                        <option value='' disabled>
                           Selecione
                        </option>
                        <option value='aberto'>Aberto</option>
                        <option value='fechado'>Fechado</option>
                     </Select>
                  </div>
                  <div>
                     <Label htmlFor='dias-cumprir' className='text-sm font-medium text-gray-700 mb-2 block'>
                        Dias a Cumprir
                     </Label>
                     <TextInput
                        id='dias-cumprir'
                        type='number'
                        min={0}
                        value={diasCumprir}
                        onChange={(e) => setDiasCumprir(Number(e.target.value))}
                        placeholder='0 = Comparativo'
                     />
                  </div>
                  <div className='flex flex-col justify-center'>
                     <Label htmlFor='dep' className='text-sm font-medium text-gray-700 mb-2 block'>
                        Possui Dependente
                     </Label>
                     <div className='flex items-center gap-2'>
                        <Checkbox
                           id='dep'
                           color='blue'
                           className='w-5 h-5'
                           checked={dep}
                           onChange={(e) => setDep(e.target.checked)}
                        />
                        <span className='text-sm text-gray-600'>
                           {dep ? "Sim" : "Não"}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </ModalBody>
         <ModalFooter className='flex justify-end gap-3 border-t border-gray-200'>
            <Button
               color='gray'
               onClick={() => setShow(false)}
               disabled={isLoading}
            >
               Cancelar
            </Button>
            <Button
               className='px-6'
               color='blue'
               onClick={handleComiss}
               disabled={isLoading}
            >
               {isLoading ? (
                  <div className='flex items-center gap-2'>
                     <Spinner size='sm' />
                     <span>Salvando...</span>
                  </div>
               ) : (
                  comiss ? "Salvar Alterações" : "Adicionar Comissionamento"
               )}
            </Button>
         </ModalFooter>
      </Modal>
   );
}
