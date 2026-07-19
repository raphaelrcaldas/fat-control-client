import {
   Modal,
   ModalBody,
   ModalHeader,
   Button,
   Checkbox,
   Label,
   TextInput,
} from "flowbite-react";
import { IoMdSearch } from "react-icons/io";
import { HiArrowRight } from "react-icons/hi";
import { useState, useMemo } from "react";
import { Cidade } from "services/routes/cities";
import {
   cidadePernoiteKeys,
   getCidadesPernoite,
   Pernoite,
} from "services/routes/cegep/missoes";
import { SearchLocal } from "@/components/location/SearchLocal";
import { DeletePernoiteModal } from "../deletePernoiteModal";
import { ValidationModal } from "../../../../../components/ValidationModal";
import { formatNaiveDate } from "utils/dateHandler";

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
   const [validationErrors, setValidationErrors] = useState<string[]>([]);

   // Valores padrões do pernoite
   const defaultValues = useMemo(
      () => ({
         dataIni: pnt ? pnt.data_ini : "",
         dataFim: pnt ? pnt.data_fim : "",
         meiaDiaria: pnt ? pnt.meia_diaria : false,
         acDesloc: pnt ? pnt.acrec_desloc : false,
         obs: pnt ? pnt.obs : "",
         local: pnt ? pnt.cidade : null,
      }),
      [pnt]
   );

   const [dataIni, setDataIni] = useState(defaultValues.dataIni);
   const [dataFim, setDataFim] = useState(defaultValues.dataFim);
   const [meiaDiaria, setMeiaDiaria] = useState(defaultValues.meiaDiaria);
   const [acDesloc, setAcDesloc] = useState(defaultValues.acDesloc);
   const [obs, setObs] = useState(defaultValues.obs);
   const [local, setLocal] = useState<Cidade | null>(defaultValues.local);

   // Verifica se houve alteração em relação aos valores padrões
   const isChanged =
      dataIni !== defaultValues.dataIni ||
      dataFim !== defaultValues.dataFim ||
      meiaDiaria !== defaultValues.meiaDiaria ||
      acDesloc !== defaultValues.acDesloc ||
      obs !== defaultValues.obs ||
      local?.codigo !== defaultValues.local?.codigo;

   function onClose() {
      setLocal(null);
      setDataIni("");
      setDataFim("");
      setAcDesloc(false);
      setMeiaDiaria(false);
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
      if (local && conflitoAcrescimoLocal(pnts, local.codigo, acDesloc, pnt)) {
         errors.push(
            "- Existe conflito de acréscimo de deslocamento nessa localidade."
         );
      }

      if (errors.length > 0) {
         setValidationErrors(errors);
         return;
      }

      onSave();
   }

   function onSave() {
      if (!local) return;

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
      // Remove pela referência do pernoite aberto no form — comparar pelos
      // campos do estado apagaria o item errado (ou nenhum) caso o usuário
      // tenha editado as datas/cidade antes de clicar em Excluir.
      if (!pnt) return;
      setPnts(pnts.filter((p) => p !== pnt));
      onClose();
   }

   return (
      <Modal size="xl" show={showFormPnt} onClose={onClose} dismissible>
         <ModalHeader className="border-b border-slate-200">
            <div className="flex items-center gap-2">
               <span className="text-xl font-bold text-gray-800">
                  {pnt ? "Editar Pernoite" : "Novo Pernoite"}
               </span>
            </div>
         </ModalHeader>
         <ModalBody className="p-6">
            {/* Informação das datas da missão */}
            <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-4">
               <h4 className="mb-2 text-xs font-semibold tracking-wide text-amber-800 uppercase">
                  Período da Missão
               </h4>
               <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center">
                     <span className="mb-1 text-xs font-medium text-gray-600">
                        Afastamento
                     </span>
                     <span className="rounded bg-white px-4 py-2 text-base font-bold text-gray-800 shadow-sm">
                        {afast ? formatNaiveDate(afast) : "Não informado"}
                     </span>
                  </div>
                  <div className="flex items-center">
                     <HiArrowRight className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex flex-col items-center">
                     <span className="mb-1 text-xs font-medium text-gray-600">
                        Regresso
                     </span>
                     <span className="rounded bg-white px-4 py-2 text-base font-bold text-gray-800 shadow-sm">
                        {regres ? formatNaiveDate(regres) : "Não informado"}
                     </span>
                  </div>
               </div>
               <p className="mt-3 text-center text-xs font-medium text-amber-700">
                  O pernoite deve estar dentro deste período
               </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
               {/* Seção de Datas */}
               <div className="rounded border border-slate-200 bg-slate-50 p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                     <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-xs text-white">
                        1
                     </span>
                     Período do Pernoite
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex flex-col gap-2">
                        <Label
                           htmlFor="pnt-data-ini"
                           className="text-sm font-medium text-gray-700"
                        >
                           Data de Início
                        </Label>
                        <TextInput
                           id="pnt-data-ini"
                           type="date"
                           value={dataIni}
                           min={afast ? afast.split("T")[0] : ""}
                           max={regres ? regres.split("T")[0] : ""}
                           onChange={(e) => {
                              setDataIni(e.target.value);
                           }}
                           required
                        />
                     </div>
                     <div className="flex flex-col gap-2">
                        <Label
                           htmlFor="pnt-data-fim"
                           className="text-sm font-medium text-gray-700"
                        >
                           Data de Fim
                        </Label>
                        <TextInput
                           id="pnt-data-fim"
                           type="date"
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
               <div className="rounded border border-slate-200 bg-slate-50 p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                     <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-xs text-white">
                        2
                     </span>
                     Localidade
                  </h3>
                  <div className="flex flex-row items-center justify-between gap-3">
                     {local?.nome ? (
                        <div className="flex-1 rounded border border-green-300 bg-white px-4 py-3 shadow-sm">
                           <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-green-500"></span>
                              <span className="text-base font-semibold text-gray-800">
                                 {local.nome}, {local.uf}
                              </span>
                           </div>
                        </div>
                     ) : (
                        <div className="flex-1 rounded border border-red-300 bg-white px-4 py-3 shadow-sm">
                           <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-red-500"></span>
                              <span className="text-sm font-medium text-red-600">
                                 Nenhuma localidade selecionada
                              </span>
                           </div>
                        </div>
                     )}
                     <Button
                        size="lg"
                        pill
                        onClick={() => setShowSearchLocal(true)}
                        color="primary"
                        className="shadow-sm"
                        aria-label="Buscar localidade"
                     >
                        <IoMdSearch className="size-5" />
                     </Button>
                  </div>

                  <SearchLocal
                     show={showSearchLocal}
                     setShow={setShowSearchLocal}
                     setLocal={setLocal}
                     fetcher={getCidadesPernoite}
                     queryKey={cidadePernoiteKeys.search}
                     allowEmpty
                  />
               </div>

               {/* Seção de Opções */}
               <div className="rounded border border-slate-200 bg-slate-50 p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                     <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-xs text-white">
                        3
                     </span>
                     Opções Adicionais
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div
                        className="cursor-pointer rounded border border-slate-200 bg-white p-4 hover:border-green-300"
                        onClick={() => setAcDesloc(!acDesloc)}
                     >
                        <div className="flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="cursor-pointer text-sm font-semibold text-gray-800">
                                 Acréscimo Deslocamento
                              </span>
                              <span className="text-xs text-gray-500">
                                 + R$ 95,00
                              </span>
                           </div>
                           <Checkbox
                              checked={acDesloc}
                              color="green"
                              onChange={(e) => setAcDesloc(e.target.checked)}
                              className="size-6"
                           />
                        </div>
                     </div>

                     <div
                        className="cursor-pointer rounded border border-slate-200 bg-white p-4 hover:border-amber-300"
                        onClick={() => setMeiaDiaria(!meiaDiaria)}
                     >
                        <div className="flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="cursor-pointer text-sm font-semibold text-gray-800">
                                 Meia Diária
                              </span>
                              <span className="text-xs text-gray-500">
                                 50% do valor
                              </span>
                           </div>
                           <Checkbox
                              checked={meiaDiaria}
                              color="yellow"
                              onChange={(e) => setMeiaDiaria(e.target.checked)}
                              className="size-6"
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Botões de Ação */}
               <div className="flex justify-center gap-3 border-t border-slate-200 pt-4">
                  <Button
                     color="gray"
                     className="w-32"
                     onClick={onClose}
                     type="button"
                  >
                     Cancelar
                  </Button>

                  {pnt && (
                     <Button
                        onClick={onDelete}
                        className="w-32"
                        color="red"
                        type="button"
                     >
                        Excluir
                     </Button>
                  )}

                  <Button
                     color="primary"
                     className="w-32"
                     type="submit"
                     disabled={!isChanged}
                  >
                     {pnt ? "Atualizar" : "Salvar"}
                  </Button>
               </div>
            </form>
         </ModalBody>

         <ValidationModal
            show={validationErrors.length > 0}
            errors={validationErrors}
            onClose={() => setValidationErrors([])}
         />

         <DeletePernoiteModal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            pernoiteInfo={{
               cidade: local?.nome
                  ? `${local.nome}, ${local.uf}`
                  : "Não informado",
               dataIni: dataIni ? formatNaiveDate(dataIni) : "Não informado",
               dataFim: dataFim ? formatNaiveDate(dataFim) : "Não informado",
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
