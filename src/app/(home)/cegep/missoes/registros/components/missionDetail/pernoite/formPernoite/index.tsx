import {
   Modal,
   ModalBody,
   ModalHeader,
   Button,
   Checkbox,
} from "flowbite-react";
import { IoMdSearch } from "react-icons/io";
import { useState, useMemo } from "react";
import { Cidade } from "services/routes/cities";
import { Pernoite } from "services/routes/cegep/missoes";
import { SearchLocal } from "@/components/location/SearchLocal";
import { DeletePernoiteModal } from "../deletePernoiteModal";

export function FormPernoite({
   showFormPnt,
   setShowFormPnt,
   pnt,
   pnts,
   afast,
   regres,
   setPnts,
}: {
   showFormPnt: boolean;
   setShowFormPnt: React.Dispatch<React.SetStateAction<boolean>>;
   afast: string;
   regres: string;
   pnt?: Pernoite;
   pnts: Pernoite[];
   setPnts?: React.Dispatch<React.SetStateAction<any>>;
}) {
   const [showSearchLocal, setShowSearchLocal] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);

   // Valores padrões do pernoite
   const defaultValues = useMemo(
      () => ({
         dataIni: pnt ? pnt.data_ini : "",
         dataFim: pnt ? pnt.data_fim : "",
         meiaDiaria: pnt ? pnt.meia_diaria : false,
         acDesloc: pnt ? pnt.acrec_desloc : false,
         obs: pnt ? pnt.obs : "",
         local: pnt ? pnt.cidade : {},
      }),
      [pnt]
   );

   const [dataIni, setDataIni] = useState(defaultValues.dataIni);
   const [dataFim, setDataFim] = useState(defaultValues.dataFim);
   const [meiaDiaria, setMeiaDiaria] = useState(defaultValues.meiaDiaria);
   const [acDesloc, setAcDesloc] = useState(defaultValues.acDesloc);
   const [obs, setObs] = useState(defaultValues.obs);
   const [local, setLocal] = useState<Cidade>(defaultValues.local);

   // Verifica se houve alteração em relação aos valores padrões
   const isChanged =
      dataIni !== defaultValues.dataIni ||
      dataFim !== defaultValues.dataFim ||
      meiaDiaria !== defaultValues.meiaDiaria ||
      acDesloc !== defaultValues.acDesloc ||
      obs !== defaultValues.obs ||
      local?.codigo !== defaultValues.local?.codigo;

   function onClose() {
      setLocal({});
      setDataIni("");
      setDataFim("");
      setAcDesloc(false);
      setObs("");
      setShowFormPnt(false);
   }

   interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}
   function handleSubmit(e: HandleSubmitEvent) {
      e.preventDefault();
      const errors: string[] = [];

      const ini = new Date(dataIni);
      const fim = new Date(dataFim);
      const afastDate = new Date(afast.split("T")[0]);
      const regresDate = new Date(regres.split("T")[0]);
      const iniValue = ini.valueOf();
      const fimValue = fim.valueOf();

      // ⏱ Validar datas
      validarDatas(ini, fim, afastDate, regresDate, errors);

      // Validar localidade
      if (!local?.codigo) {
         errors.push("- Localidade não selecionada");
      }

      // Validar conflitos com pernoites existentes
      if (conflitoDeDataComPernoites(pnts, iniValue, fimValue, pnt)) {
         errors.push("- Existe conflito de pernoites, revise as datas.");
      }

      // Validar conflito de acréscimo de deslocamento
      if (conflitoAcrescimoLocal(pnts, local.codigo, acDesloc, pnt)) {
         errors.push(
            "- Existe conflito de acréscimo de deslocamento nessa localidade."
         );
      }

      if (errors.length > 0) {
         alert("Preencha corretamente:\n" + errors.join("\n"));
         return;
      }

      onSave();
   }

   function onSave() {
      const newPnt: Pernoite = {
         data_ini: dataIni,
         data_fim: dataFim,
         meia_diaria: meiaDiaria,
         acrec_desloc: acDesloc,
         obs: obs,
         cidade_id: local.codigo,
         cidade: local,
      };

      if (pnt) {
         // Atualiza o pernoite existente
         const idx = pnts.indexOf(pnt);
         if (idx !== -1) {
            const updated = [...pnts];
            updated[idx] = newPnt;
            setPnts(updated);
         }
      } else {
         // Adiciona novo pernoite
         setPnts([...pnts, newPnt]);
      }
      onClose();
   }

   function onDelete() {
      setShowDeleteModal(true);
   }

   function confirmDelete() {
      setPnts(
         pnts.filter((p) => {
            const checkIni = p.data_ini !== dataIni;
            const checkFim = p.data_fim !== dataFim;
            const checkLocal = p.cidade.codigo !== local.codigo;
            // Mantém apenas os que NÃO são iguais ao alvo
            return checkIni || checkFim || checkLocal;
         })
      );
      onClose();
   }

   return (
      <Modal size='xl' show={showFormPnt} onClose={onClose}>
         <ModalHeader className='border-b-2 border-gray-100'>
            <div className='flex items-center gap-2'>
               <span className='text-xl font-bold text-gray-800'>
                  {pnt ? "Editar Pernoite" : "Novo Pernoite"}
               </span>
            </div>
         </ModalHeader>
         <ModalBody className='p-6'>
            {/* Informação das datas da missão */}
            <div className='mb-4 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border-2 border-amber-200'>
               <h4 className='text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide'>
                  Período da Missão
               </h4>
               <div className='flex items-center justify-center gap-6'>
                  <div className='flex flex-col items-center'>
                     <span className='text-xs text-gray-600 font-medium mb-1'>
                        Afastamento
                     </span>
                     <span className='text-base font-bold text-gray-800 bg-white px-4 py-2 rounded-md shadow-sm'>
                        {afast
                           ? new Date(afast).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                             })
                           : "Não informado"}
                     </span>
                  </div>
                  <div className='flex items-center'>
                     <svg
                        className='w-6 h-6 text-amber-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                     >
                        <path
                           strokeLinecap='round'
                           strokeLinejoin='round'
                           strokeWidth={2}
                           d='M17 8l4 4m0 0l-4 4m4-4H3'
                        />
                     </svg>
                  </div>
                  <div className='flex flex-col items-center'>
                     <span className='text-xs text-gray-600 font-medium mb-1'>
                        Regresso
                     </span>
                     <span className='text-base font-bold text-gray-800 bg-white px-4 py-2 rounded-md shadow-sm'>
                        {regres
                           ? new Date(regres).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                             })
                           : "Não informado"}
                     </span>
                  </div>
               </div>
               <p className='text-xs text-center text-amber-700 mt-3 font-medium'>
                  O pernoite deve estar dentro deste período
               </p>
            </div>

            <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
               {/* Seção de Datas */}
               <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100'>
                  <h3 className='text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                     <span className='w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs'>
                        1
                     </span>
                     Período do Pernoite
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                     <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-gray-700'>
                           Data de Início
                        </label>
                        <input
                           className='bg-white border-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-3 transition-all'
                           type='date'
                           value={dataIni}
                           min={afast ? afast.split("T")[0] : ""}
                           max={regres ? regres.split("T")[0] : ""}
                           onChange={(e) => {
                              setDataIni(e.target.value);
                           }}
                           required
                        />
                     </div>
                     <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium text-gray-700'>
                           Data de Fim
                        </label>
                        <input
                           className='bg-white border-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-3 transition-all'
                           type='date'
                           value={dataFim}
                           min={afast ? afast.split("T")[0] : ""}
                           max={regres ? regres.split("T")[0] : ""}
                           onChange={(e) => {
                              setDataFim(e.target.value);
                           }}
                           required
                        />
                     </div>
                  </div>
               </div>

               {/* Seção de Localidade */}
               <div className='bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100'>
                  <h3 className='text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                     <span className='w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs'>
                        2
                     </span>
                     Localidade
                  </h3>
                  <div className='flex flex-row gap-3 justify-between items-center'>
                     {local.nome ? (
                        <div className='flex-1 bg-white border-2 border-green-300 rounded-lg px-4 py-3 shadow-sm'>
                           <div className='flex items-center gap-2'>
                              <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                              <span className='font-semibold text-gray-800 text-base'>
                                 {local.nome}, {local.uf}
                              </span>
                           </div>
                        </div>
                     ) : (
                        <div className='flex-1 bg-white border-2 border-red-300 rounded-lg px-4 py-3 shadow-sm'>
                           <div className='flex items-center gap-2'>
                              <span className='w-2 h-2 bg-red-500 rounded-full'></span>
                              <span className='text-red-600 text-sm font-medium'>
                                 Nenhuma localidade selecionada
                              </span>
                           </div>
                        </div>
                     )}
                     <Button
                        size='lg'
                        pill
                        onClick={() => setShowSearchLocal(true)}
                        color='purple'
                        className='shadow-md hover:shadow-lg transition-shadow'
                     >
                        <IoMdSearch className='size-5' />
                     </Button>
                  </div>

                  <SearchLocal
                     show={showSearchLocal}
                     setShow={setShowSearchLocal}
                     setLocal={setLocal}
                  />
               </div>

               {/* Seção de Opções */}
               <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100'>
                  <h3 className='text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                     <span className='w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs'>
                        3
                     </span>
                     Opções Adicionais
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                     <div
                        className='bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-colors cursor-pointer'
                        onClick={() => setAcDesloc(!acDesloc)}
                     >
                        <div className='flex items-center justify-between'>
                           <div className='flex flex-col'>
                              <label className='text-sm font-semibold text-gray-800 cursor-pointer'>
                                 Acréscimo Deslocamento
                              </label>
                              <span className='text-xs text-gray-500'>
                                 + R$ 95,00
                              </span>
                           </div>
                           <Checkbox
                              checked={acDesloc}
                              color='green'
                              onChange={(e) => setAcDesloc(e.target.checked)}
                              className='size-6'
                           />
                        </div>
                     </div>

                     <div
                        className='bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-amber-300 transition-colors cursor-pointer'
                        onClick={() => setMeiaDiaria(!meiaDiaria)}
                     >
                        <div className='flex items-center justify-between'>
                           <div className='flex flex-col'>
                              <label className='text-sm font-semibold text-gray-800 cursor-pointer'>
                                 Meia Diária
                              </label>
                              <span className='text-xs text-gray-500'>
                                 50% do valor
                              </span>
                           </div>
                           <Checkbox
                              checked={meiaDiaria}
                              color='yellow'
                              onChange={(e) => setMeiaDiaria(e.target.checked)}
                              className='size-6'
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Botões de Ação */}
               <div className='flex gap-3 justify-center pt-4 border-t-2 border-gray-100'>
                  <Button
                     color='gray'
                     className='w-32'
                     onClick={onClose}
                     type='button'
                  >
                     Cancelar
                  </Button>

                  {pnt && (
                     <Button
                        onClick={onDelete}
                        className='w-32'
                        color='red'
                        type='button'
                     >
                        Excluir
                     </Button>
                  )}

                  <Button
                     color='blue'
                     className='w-32'
                     type='submit'
                     disabled={!isChanged}
                  >
                     {pnt ? "Atualizar" : "Salvar"}
                  </Button>
               </div>
            </form>
         </ModalBody>

         <DeletePernoiteModal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            pernoiteInfo={{
               cidade: local.nome
                  ? `${local.nome}, ${local.uf}`
                  : "Não informado",
               dataIni: dataIni
                  ? new Date(dataIni).toLocaleDateString("pt-BR", {
                       day: "2-digit",
                       month: "short",
                       year: "numeric",
                    })
                  : "Não informado",
               dataFim: dataFim
                  ? new Date(dataFim).toLocaleDateString("pt-BR", {
                       day: "2-digit",
                       month: "short",
                       year: "numeric",
                    })
                  : "Não informado",
            }}
         />
      </Modal>
   );
}

function validarDatas(
   ini: Date,
   fim: Date,
   afast: Date,
   regres: Date,
   errors: string[]
) {
   if (!ini || isNaN(ini.getTime())) {
      errors.push("- Data de início inválida");
   }
   if (!fim || isNaN(fim.getTime())) {
      errors.push("- Data de fim inválida");
   }
   if (ini > fim) {
      errors.push("- Data de início não pode ser maior que a data de fim");
   }
   if (!(afast <= ini && fim <= regres)) {
      errors.push("- O pernoite deve estar contido no período da missão.");
   }
}

function conflitoDeDataComPernoites(
   pnts: Pernoite[],
   iniValue: number,
   fimValue: number,
   pnt?: Pernoite
): boolean {
   return pnts.some((p) => {
      if (
         pnt &&
         p.data_ini === pnt.data_ini &&
         p.data_fim === pnt.data_fim &&
         p.cidade?.codigo === pnt.cidade?.codigo
      )
         return false;

      const pIni = new Date(p.data_ini).getTime();
      const pFim = new Date(p.data_fim).getTime();
      return iniValue < pFim && pIni < fimValue;
   });
}

function conflitoAcrescimoLocal(
   pnts: Pernoite[],
   codigoLocal: number,
   acDesloc: boolean,
   pnt?: Pernoite
): boolean {
   return pnts.some((p) => {
      if (
         pnt &&
         p.data_ini === pnt.data_ini &&
         p.data_fim === pnt.data_fim &&
         p.cidade?.codigo === pnt.cidade?.codigo
      )
         return false;

      return p.cidade?.codigo === codigoLocal && p.acrec_desloc && acDesloc;
   });
}
