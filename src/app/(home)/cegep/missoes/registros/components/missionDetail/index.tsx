import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Textarea,
   Select,
   Label,
   Spinner,
   TextInput,
   Checkbox,
} from "flowbite-react";
import { MissionPernoite } from "./pernoite/missionPernoite";
import { FormPernoite } from "./pernoite/formPernoite";
import { FormMilitar } from "./militar/formMilitar";
import { MissionMilitar } from "./militar/missionMilitar";
import { ErrorModal } from "./errorModal";
import { DeleteMissionModal } from "./deleteMissionModal";
import { Missao } from "services/routes/cegep/missoes";
import { DateTimePicker } from "src/app/(home)/components/dateTimePicker";
import { useState, useMemo, useEffect } from "react";
import { FaPlaneDeparture, FaPlaneArrival } from "react-icons/fa";
import { createUpdateFragMis } from "services/routes/cegep/missoes";
import { deleteFragMis } from "services/routes/cegep/missoes";
import { useToast } from "@/app/context/toast";
import clsx from "clsx";

export default function MissionDetail({
   missao,
   show,
   setShow,
   edit,
   update,
   setClone,
}: {
   missao?: Missao;
   show: boolean;
   edit: boolean;
   setShow: React.Dispatch<React.SetStateAction<boolean>>;
   setClone: React.Dispatch<React.SetStateAction<Missao | null>>;
   update: () => void;
}) {
   // Valores padrões
   const defaultValues = useMemo(
      () => ({
         tipoDoc: missao ? missao.tipo_doc : "",
         nDoc: missao ? missao.n_doc : undefined,
         desc: missao ? missao.desc : "",
         afast: missao ? missao.afast : "",
         regres: missao ? missao.regres : "",
         tipo: missao ? missao.tipo : "",
         ind: missao ? (missao.indenizavel ? "ind" : "n_ind") : "",
         acrecDesloc: missao ? missao.acrec_desloc : false,
         obs: missao ? missao.obs : "",
         pnts: missao ? missao.pernoites : [],
         mils: missao ? missao.users : [],
      }),
      [missao]
   );

   const [editMode, setEditMode] = useState(edit);
   const [tipoDoc, setTipoDoc] = useState(defaultValues.tipoDoc);
   const [nDoc, setNDoc] = useState(defaultValues.nDoc);
   const [desc, setDesc] = useState(defaultValues.desc);
   const [tipo, setTipo] = useState(defaultValues.tipo);
   const [afast, setAfast] = useState(defaultValues.afast);
   const [regres, setRegres] = useState(defaultValues.regres);
   const [acrecDesloc, setAcrecDesloc] = useState(defaultValues.acrecDesloc);
   const [ind, setInd] = useState(defaultValues.ind);
   const [obs, setObs] = useState(defaultValues.obs);
   const [formPnt, setFormPnt] = useState(false);
   const [pnts, setPnts] = useState(defaultValues.pnts);
   const [formMil, setFormMil] = useState(false);
   const [mils, setMils] = useState(defaultValues.mils);

   const [checkAfastRegres, setCheckAfastRegres] = useState(false);

   const [isLoading, setIsloading] = useState(false);
   const [showErrorModal, setShowErrorModal] = useState(false);
   const [errorMessage, setErrorMessage] = useState("");
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const { push } = useToast();

   const sortedPnts = useMemo(
      () =>
         pnts.toSorted(
            (pntPrev, pntAft) =>
               new Date(pntPrev.data_ini).valueOf() -
               new Date(pntAft.data_ini).valueOf()
         ),
      [pnts]
   );

   const isChanged =
      nDoc !== defaultValues.nDoc ||
      tipoDoc !== defaultValues.tipoDoc ||
      desc !== defaultValues.desc ||
      tipo !== defaultValues.tipo ||
      afast !== defaultValues.afast ||
      regres !== defaultValues.regres ||
      acrecDesloc !== defaultValues.acrecDesloc ||
      ind !== defaultValues.ind ||
      obs !== defaultValues.obs ||
      JSON.stringify(pnts) !== JSON.stringify(defaultValues.pnts) ||
      JSON.stringify(mils) !== JSON.stringify(defaultValues.mils);

   function handleFragMis() {
      const checkNDoc = nDoc != 0;
      const checkTipoDoc = tipoDoc != "";
      const checkDesc = desc != "";
      const checkTipo = tipo != "";
      const checkAfast = afast != "";
      const checkRegres = regres != "";
      const checkInd = ind != "";
      const checkPnts = pnts.length > 0;
      const checkMil = mils.length > 0;

      let errors = [];
      if (!checkNDoc) errors.push("- Tipo da Ordem");
      if (!checkTipoDoc) errors.push("- Documento Referência");
      if (!checkDesc) errors.push("- Descrição");
      if (!checkTipo) errors.push("- Tipo da Missão");
      if (!checkAfast) errors.push("- Data de Afastamento");
      if (!checkRegres) errors.push("- Data de Regresso");

      if (!checkInd) errors.push("- Natureza");
      if (!checkPnts) errors.push("- Pelo menos um Pernoite");
      if (!checkMil) errors.push("- Pelo menos um Militar");

      const dataAfast = new Date(afast.split("T")[0]);
      const dataRegres = new Date(regres.split("T")[0]);

      // Checagem adicional: afastamento não pode ser maior que regresso
      if (checkAfast && checkRegres) {
         if (dataAfast > dataRegres) {
            errors.push(
               "- Data de afastamento não pode ser maior que a de regresso"
            );
         }
      }

      // Checar se pernoites não ultrapassam o afastamento e regresso
      pnts.forEach((pnt) => {
         if (new Date(pnt.data_ini) < dataAfast) {
            errors.push(
               `- O início do pernoite em ${pnt.cidade.nome}-${pnt.cidade.uf} esta conflito com a data de afastamento`
            );
         }
         if (new Date(pnt.data_fim) > dataRegres) {
            errors.push(
               `- O fim do pernoite em ${pnt.cidade.nome}-${pnt.cidade.uf} esta conflito com a data de regresso`
            );
         }
      });

      if (errors.length > 0) {
         alert("Preencha os campos obrigatórios:\n" + errors.join("\n"));
         return;
      }

      onSave();
   }

   async function onSave() {
      setIsloading(true);

      const pntsWithFragId = missao
         ? pnts.map((p) => ({ ...p, frag_id: missao.id }))
         : pnts;

      const usersWithFragId = missao
         ? mils.map((p) => ({ ...p, frag_id: missao.id }))
         : mils;

      const fragMis: Missao = {
         id: missao ? missao.id : null,
         tipo_doc: tipoDoc,
         n_doc: nDoc,
         desc: desc,
         acrec_desloc: acrecDesloc,
         tipo: tipo,
         afast: afast,
         regres: regres,
         indenizavel: ind == "ind",
         obs: obs,
         pernoites: pntsWithFragId,
         users: usersWithFragId,
      };

      const response = await createUpdateFragMis(fragMis);
      if (response.ok) {
         const data = await response.json();
         push({ message: data.detail, type: "success" });
         setEditMode(false);
         update();
      } else {
         const error = await response.json();
         setErrorMessage(error.detail || "Erro desconhecido ao salvar missão");
         setShowErrorModal(true);
      }
      setIsloading(false);
   }

   async function onDelete() {
      const response = await deleteFragMis(missao.id);
      if (response.ok) {
         const data = await response.json();
         push({ message: data.detail, type: "success" });
         setShow(false);
         update();
      } else {
         const error = await response.json();
         setErrorMessage(
            error.detail || "Erro desconhecido ao deletar missão"
         );
         setShowErrorModal(true);
      }
   }

   function handleClose() {
      if (missao) {
         setEditMode(false);
      }
      setClone(null);
      setShow(false);
   }

   useEffect(() => {
      const afastValido = afast && !isNaN(new Date(afast).getTime());
      const regresValido = regres && !isNaN(new Date(regres).getTime());
      setCheckAfastRegres(afastValido && regresValido);
   }, [afast, regres]);

   function setDefaultValues() {
      setTipoDoc(defaultValues.tipoDoc);
      setNDoc(defaultValues.nDoc);
      setDesc(defaultValues.desc);
      setTipo(defaultValues.tipo);
      setAfast(defaultValues.afast);
      setRegres(defaultValues.regres);
      setInd(defaultValues.ind);
      setObs(defaultValues.obs);
      setPnts(defaultValues.pnts);
      setMils(defaultValues.mils);
   }

   useEffect(() => {
      if (show) {
         setDefaultValues();
         setEditMode(edit);
      }
   }, [show, defaultValues, edit]);

   return (
      <>
         <ErrorModal
            show={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            errorMessage={errorMessage}
            errorTitle="Erro"
         />
         <DeleteMissionModal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={onDelete}
            missionInfo={{
               tipoDoc: tipoDoc,
               nDoc: nDoc,
               desc: desc,
            }}
         />
         <Modal size='4xl' show={show} onClose={handleClose}>
         <ModalHeader className='border-b border-slate-200 pb-4'>
            <div className='flex items-center gap-3'>
               <div className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-100'>
                  <FaPlaneDeparture className='text-blue-600' />
               </div>
               <div>
                  <h2 className='text-xl font-bold text-slate-800'>
                     {editMode && !missao ? "Nova Missão" : "Detalhes da Missão"}
                  </h2>
                  {!editMode && (
                     <p className='text-sm text-slate-500'>
                        Visualizando informações da missão
                     </p>
                  )}
               </div>
            </div>
         </ModalHeader>
         <ModalBody className='space-y-6 py-2'>
            {/* Seção: Informações do Documento */}
            <div className='bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm'>
               <h3 className='text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2'>
                  <div className='w-1 h-4 bg-blue-500 rounded-full'></div>
                  Documento de Referência
               </h3>
               <div className='grid grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                     <Label className='text-sm font-medium text-slate-600'>
                        Tipo de Ordem
                     </Label>
                     {editMode ? (
                        <Select
                           value={tipoDoc}
                           onChange={(e) => setTipoDoc(e.target.value)}
                           className='w-full'
                        >
                           <option value=''></option>
                           <option value='om'>Ordem de Missão</option>
                           <option value='os'>Ordem de Serviço</option>
                        </Select>
                     ) : (
                        <div className='px-4 py-2 bg-white rounded-lg border border-slate-200'>
                           <span className='text-base font-semibold text-slate-800 uppercase'>
                              {tipoDoc}
                           </span>
                        </div>
                     )}
                  </div>
                  <div className='space-y-2'>
                     <Label className='text-sm font-medium text-slate-600'>
                        Nº do Documento
                     </Label>
                     {editMode ? (
                        <TextInput
                           className='w-full'
                           value={nDoc ?? ""}
                           onChange={(e) =>
                              setNDoc(
                                 e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value)
                              )
                           }
                           onKeyDown={(e) => {
                              if (
                                 !(
                                    (e.key >= "0" && e.key <= "9") ||
                                    [
                                       "Backspace",
                                       "Tab",
                                       "Delete",
                                       "ArrowLeft",
                                       "ArrowRight",
                                    ].includes(e.key)
                                 )
                              ) {
                                 e.preventDefault();
                              }
                           }}
                        />
                     ) : (
                        <div className='px-4 py-2 bg-white rounded-lg border border-slate-200'>
                           <span className='text-base font-semibold text-slate-800'>
                              {nDoc}
                           </span>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Seção: Descrição */}
            <div className='bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm'>
               <h3 className='text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2'>
                  <div className='w-1 h-4 bg-blue-500 rounded-full'></div>
                  Descrição
               </h3>
               {editMode ? (
                  <TextInput
                     className='w-full'
                     placeholder='OFRAG XXX - APOIO XXX'
                     value={desc}
                     onChange={(e) => setDesc(e.target.value)}
                  />
               ) : (
                  <div className='px-4 py-3 bg-white rounded-lg border border-slate-200'>
                     <p className='text-base font-medium text-slate-800 uppercase'>
                        {desc}
                     </p>
                  </div>
               )}
            </div>

            {/* Seção: Classificação */}
            <div className='bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm'>
               <h3 className='text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2'>
                  <div className='w-1 h-4 bg-blue-500 rounded-full'></div>
                  Classificação
               </h3>
               <div className='grid grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                     <Label className='text-sm font-medium text-slate-600 mr-2'>
                        Tipo de Missão
                     </Label>
                     {editMode ? (
                        <Select
                           value={tipo}
                           onChange={(e) => setTipo(e.target.value)}
                           className='w-full'
                        >
                           <option value='' disabled></option>
                           <option value='tal'>TAL - Transporte Aerologístico</option>
                           <option value='opr'>OPR - Operacional</option>
                           <option value='adm'>ADM - Administrativo</option>
                        </Select>
                     ) : (
                        <div className='inline-block'>
                           <span
                              className={clsx(
                                 "inline-flex items-center px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide shadow-sm transition-all",
                                 {
                                    "bg-gradient-to-r from-amber-400 to-amber-500 text-white":
                                       tipo === "opr",
                                    "bg-gradient-to-r from-blue-400 to-blue-500 text-white":
                                       tipo === "adm",
                                    "bg-gradient-to-r from-green-400 to-green-500 text-white":
                                       tipo === "tal",
                                 }
                              )}
                           >
                              {tipo}
                           </span>
                        </div>
                     )}
                  </div>
                  <div className='space-y-2'>
                     <Label className='text-sm font-medium text-slate-600 mr-2'>
                        Natureza
                     </Label>
                     {editMode ? (
                        <Select
                           value={ind}
                           onChange={(e) => setInd(e.target.value)}
                           className='w-full'
                        >
                           <option disabled value=''></option>
                           <option value='n_ind'>NÃO INDENIZÁVEL</option>
                           <option value='ind'>INDENIZÁVEL</option>
                        </Select>
                     ) : (
                        <div className='inline-block'>
                           <span
                              className={clsx(
                                 "inline-flex items-center px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide shadow-sm transition-all",
                                 {
                                    "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white":
                                       ind == "ind",
                                    "bg-slate-200 text-slate-700": ind == "n_ind",
                                 }
                              )}
                           >
                              {ind == "ind" && "Indenizável"}
                              {ind == "n_ind" && "Não Indenizável"}
                           </span>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Seção: Datas e Deslocamento */}
            <div className='bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm'>
               <h3 className='text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2'>
                  <div className='w-1 h-4 bg-blue-500 rounded-full'></div>
                  Período e Deslocamento
               </h3>
               <div className='space-y-4'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                     <div className='space-y-2'>
                        <Label className='text-sm font-medium text-slate-600 flex items-center gap-2'>
                           <FaPlaneDeparture className='text-slate-500' />
                           Afastamento
                        </Label>
                        {editMode ? (
                           <DateTimePicker value={afast} setValue={setAfast} />
                        ) : (
                           <div className='flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg border border-yellow-300 shadow-sm'>
                              <FaPlaneDeparture className='text-yellow-700 text-lg' />
                              <span className='font-semibold text-slate-800'>
                                 {new Date(afast).toLocaleDateString("pt-BR", {
                                    year: "numeric",
                                    month: "numeric",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                 })}
                              </span>
                           </div>
                        )}
                     </div>

                     <div className='space-y-2'>
                        <Label className='text-sm font-medium text-slate-600 flex items-center gap-2'>
                           <FaPlaneArrival className='text-slate-500' />
                           Regresso
                        </Label>
                        {editMode ? (
                           <DateTimePicker value={regres} setValue={setRegres} />
                        ) : (
                           <div className='flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg border border-yellow-300 shadow-sm'>
                              <FaPlaneArrival className='text-yellow-700 text-lg' />
                              <span className='font-semibold text-slate-800'>
                                 {new Date(regres).toLocaleDateString("pt-BR", {
                                    year: "numeric",
                                    month: "numeric",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                 })}
                              </span>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className='flex items-center gap-3 pt-2 border-t border-slate-200'>
                     <Label className='font-medium text-slate-500' htmlFor='ac_desloc'>
                        Acréscimo de Deslocamento:
                     </Label>
                     {editMode ? (
                        <Checkbox
                           id='ac_desloc'
                           color='blue'
                           onChange={(e) => setAcrecDesloc(e.target.checked)}
                           className='size-5'
                           checked={acrecDesloc}
                        />
                     ) : (
                        <span
                           className={clsx(
                              "px-3 py-1 rounded-md font-semibold uppercase",
                              {
                                 "bg-green-100 text-green-700": acrecDesloc,
                                 "bg-slate-200 text-slate-600": !acrecDesloc,
                              }
                           )}
                        >
                           {acrecDesloc ? "Sim" : "Não"}
                        </span>
                     )}
                  </div>
               </div>
            </div>

            {/* Seção: Observações */}
            <div className='bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm'>
               <h3 className='text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2'>
                  <div className='w-1 h-4 bg-blue-500 rounded-full'></div>
                  Observações
               </h3>
               {editMode ? (
                  <Textarea
                     value={obs}
                     onChange={(e) => setObs(e.target.value)}
                     placeholder='RETORNO OM XXX'
                     rows={4}
                     className='w-full'
                  />
               ) : (
                  <div className='px-4 py-3 bg-white rounded-lg border border-slate-200 min-h-[100px]'>
                     {obs ? (
                        <p className='text-slate-700 whitespace-pre-wrap'>{obs}</p>
                     ) : (
                        <div className='flex items-center justify-center h-full text-sm text-slate-400 italic'>
                           Nenhuma observação adicionada
                        </div>
                     )}
                  </div>
               )}
            </div>

            {/* Seção: Pernoites */}
            <div className='bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm'>
               <h3 className='text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2'>
                  <div className='w-1 h-4 bg-blue-500 rounded-full'></div>
                  Pernoites
               </h3>

               {pnts.length == 0 && (
                  <div className='flex items-center justify-center py-8 px-4 bg-white rounded-lg border border-slate-200'>
                     <p className='text-sm text-slate-400 italic'>
                        Nenhum pernoite adicionado
                     </p>
                  </div>
               )}

               <div className='space-y-2'>
                  {sortedPnts.map((pnt, index: number) => {
                     return (
                        <MissionPernoite
                           key={index}
                           pnt={pnt}
                           edit={editMode}
                           afast={afast}
                           regres={regres}
                           pnts={pnts}
                           setPnts={setPnts}
                        />
                     );
                  })}
               </div>

               <FormPernoite
                  afast={afast}
                  regres={regres}
                  showFormPnt={formPnt}
                  setShowFormPnt={setFormPnt}
                  pnts={pnts}
                  setPnts={setPnts}
               />

               {editMode && (
                  <Button
                     color='blue'
                     size='sm'
                     onClick={() => setFormPnt(true)}
                     disabled={!checkAfastRegres}
                     className='w-full mt-4 font-semibold'
                  >
                     + Adicionar Pernoite
                  </Button>
               )}
            </div>

            {/* Seção: Militares */}
            <div className='bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm'>
               <h3 className='text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2'>
                  <div className='w-1 h-4 bg-blue-500 rounded-full'></div>
                  Militares
               </h3>

               {mils.length == 0 && (
                  <div className='flex items-center justify-center py-8 px-4 bg-white rounded-lg border border-slate-200'>
                     <p className='text-sm text-slate-400 italic'>
                        Nenhum militar adicionado
                     </p>
                  </div>
               )}

               <div className='grid gap-2 uppercase font-medium' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                  {mils.map((userMis) => {
                     return (
                        <MissionMilitar
                           key={userMis.user_id}
                           edit={editMode}
                           userMis={userMis}
                           mils={mils}
                           setMils={setMils}
                        />
                     );
                  })}
               </div>

               {formMil && (
                  <FormMilitar
                     show={formMil}
                     setShow={setFormMil}
                     mils={mils}
                     setMils={setMils}
                  />
               )}

               {editMode && (
                  <Button
                     color='blue'
                     size='sm'
                     onClick={() => setFormMil(true)}
                     className='w-full mt-4 font-semibold'
                  >
                     + Adicionar Militar
                  </Button>
               )}
            </div>
         </ModalBody>
         <ModalFooter className='border-t border-slate-200 bg-slate-50'>
            <div className='flex gap-3 w-full justify-center'>
               {!editMode ? (
                  <>
                     <Button
                        color='blue'
                        onClick={() => setEditMode(true)}
                        className='px-6 py-2.5 font-semibold shadow-md hover:shadow-lg transition-all'
                     >
                        Editar
                     </Button>
                     <Button
                        color='red'
                        onClick={() => setShowDeleteModal(true)}
                        className='px-6 py-2.5 font-semibold shadow-md hover:shadow-lg transition-all'
                     >
                        Deletar
                     </Button>
                  </>
               ) : (
                  <>
                     {missao && (
                        <Button
                           onClick={() => {
                              setEditMode(false);
                              setDefaultValues();
                           }}
                           color='alternative'
                           className='px-6 py-2.5 font-semibold'
                        >
                           Cancelar
                        </Button>
                     )}
                     <Button
                        onClick={handleFragMis}
                        color='blue'
                        disabled={!isChanged || isLoading}
                        className='px-8 py-2.5 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                     >
                        {isLoading ? (
                           <div className='flex items-center gap-2'>
                              <Spinner size='sm' />
                              <span>Salvando...</span>
                           </div>
                        ) : missao ? (
                           "Salvar Alterações"
                        ) : (
                           "Criar Missão"
                        )}
                     </Button>
                  </>
               )}
            </div>
         </ModalFooter>
         </Modal>
      </>
   );
}
