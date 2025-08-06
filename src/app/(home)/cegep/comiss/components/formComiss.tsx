import {
   Modal,
   ModalBody,
   ModalHeader,
   Label,
   TextInput,
   Checkbox,
   Button,
   Select,
   ModalFooter,
} from "flowbite-react";
import { useState, useMemo } from "react";
import { IoMdSearch } from "react-icons/io";
import { UserPublic } from "services/routes/users";
import { Comiss as ComissSchema } from "services/routes/cegep/comiss";
import { createCmto, updateCmto } from "services/routes/cegep/comiss";
import { SearchUser } from "src/app/(home)/users/components/searchUser";

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
         valAjFc: comiss ? comiss.valor_aj_ab : 0,
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
         alert("Preencha os campos obrigatórios:\n" + errors.join("\n"));
         return;
      }

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

         alert(data.detail);

         update();
         setShow(false);
      } catch (err) {
         alert("Erro ao salvar o comissionamento: " + err.message);
      }
   }

   return (
      <Modal show={show} size='6xl' onClose={() => setShow(false)}>
         <ModalHeader>
            {comiss ? "Editar" : "Adicionar"} Comissionamento
         </ModalHeader>
         <ModalBody>
            <div className='flex flex-row gap-2 p-2 m-4 justify-center items-center text-base'>
               {user ? (
                  <span className='uppercase font-medium bg-white shadow-md px-4 py-1 rounded-lg'>
                     {user.posto.mid} {user.esp} {user.nome_completo}
                  </span>
               ) : (
                  <span className='text-red-600 text-sm'>
                     Insira uma Militar
                  </span>
               )}

               {!comiss && (
                  <Button
                     pill
                     onClick={() => setShowUserSearch(true)}
                     color='light'
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
            <div className='grid grid-cols-3 gap-3 text-center'>
               <div>
                  <div className='mb-2 block'>
                     <Label htmlFor='doc-prop'>Proposta</Label>
                  </div>
                  <TextInput
                     id='doc-prop'
                     required
                     shadow
                     value={docProp}
                     onChange={(e) => setDocProp(e.target.value)}
                  />
               </div>
               <div>
                  <div className='mb-2 block'>
                     <Label htmlFor='doc-aut'>Autorização</Label>
                  </div>
                  <TextInput
                     id='doc-aut'
                     required
                     shadow
                     value={docAut}
                     onChange={(e) => setDocAut(e.target.value)}
                  />
               </div>
               <div>
                  <div className='mb-2 block'>
                     <Label htmlFor='doc-enc'>Encerramento</Label>
                  </div>
                  <TextInput
                     id='doc-enc'
                     required
                     shadow
                     value={docEnc}
                     onChange={(e) => setDocEnc(e.target.value)}
                  />
               </div>
            </div>
            <div className='grid grid-cols-2 mt-4 gap-2'>
               <div className='bg-green-100 text-center p-2 rounded-lg'>
                  <Label>Abertura</Label>
                  <div className='grid grid-cols-3 mt-2 gap-2'>
                     <div className='grid'>
                        <TextInput
                           type='date'
                           value={dataAb}
                           onChange={(e) => setDataAb(e.target.value)}
                        />
                        <span className='text-slate-500'>Data</span>
                     </div>
                     <div className='grid'>
                        <TextInput
                           value={qtdAjAb}
                           className='w-20 justify-self-center'
                           type='number'
                           min={0}
                           max={2}
                           onChange={(e) => setQtdAjAb(Number(e.target.value))}
                        />
                        <span className='text-slate-500'>Ajuda de Custo</span>
                     </div>
                     <div className='grid'>
                        <TextInput
                           value={valAjAb}
                           className='w-32 justify-self-center'
                           min={0}
                           type='number'
                           onChange={(e) => setValAjAb(Number(e.target.value))}
                        />
                        <span className='text-slate-500'>Valor</span>
                     </div>
                  </div>
               </div>
               <div className='bg-orange-100 text-center p-2 rounded-lg'>
                  <Label>Fechamento</Label>
                  <div className='grid grid-cols-3 mt-2 gap-2'>
                     <div className='grid'>
                        <TextInput
                           type='date'
                           min={dataAb}
                           value={dataFc}
                           onChange={(e) => setDataFc(e.target.value)}
                        />
                        <span className='text-slate-500'>Data</span>
                     </div>
                     <div className='grid'>
                        <TextInput
                           value={qtdAjFc}
                           className='w-20 justify-self-center'
                           type='number'
                           min={0}
                           max={2}
                           onChange={(e) => setQtdAjFc(Number(e.target.value))}
                        />
                        <span className='text-slate-500'>Ajuda de Custo</span>
                     </div>
                     <div className='grid'>
                        <TextInput
                           value={valAjFc}
                           className='w-32 justify-self-center'
                           min={0}
                           type='number'
                           onChange={(e) => setValAjFC(Number(e.target.value))}
                        />
                        <span className='text-slate-500'>Valor</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className='grid grid-cols-3 mt-3 justify-items-center text-center'>
               <div>
                  <div className='mb-2 block'>
                     <Label htmlFor='status'>Status</Label>
                  </div>
                  <Select
                     id='status'
                     value={status}
                     onChange={(e) => setStatus(e.target.value)}
                  >
                     <option value='' disabled></option>
                     <option value='aberto'>Aberto</option>
                     <option value='fechado'>Fechado</option>
                  </Select>
               </div>
               <div>
                  <div className='mb-2 block'>
                     <Label htmlFor='dias-cumprir'>Dias a Cumprir</Label>
                  </div>
                  <TextInput
                     id='dias-cumprir'
                     type='number'
                     className='w-24'
                     min={0}
                     value={diasCumprir}
                     onChange={(e) => setDiasCumprir(Number(e.target.value))}
                  />
               </div>
               <div>
                  <div className='mb-2 block'>
                     <Label htmlFor='dep'>Possui Dependente</Label>
                  </div>
                  <Checkbox
                     id='del'
                     size={10}
                     className='size-7'
                     checked={dep}
                     onChange={(e) => setDep(e.target.checked)}
                  />
               </div>
            </div>
         </ModalBody>
         <ModalFooter className='flex justify-center'>
            <Button className='w-32' onClick={handleComiss}>
               {comiss ? "Salvar" : "Adicionar"}
            </Button>
         </ModalFooter>
      </Modal>
   );
}
