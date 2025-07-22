import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Textarea,
   Select,
   Label,
   TextInput,
} from "flowbite-react";
import { MissionPernoite } from "./pernoite/missionPernoite";
import { FormPernoite } from "./pernoite/formPernoite";
import { FormMilitar } from "./militar/formMilitar";
import { MissionMilitar } from "./militar/missionMilitar";
import { Missao } from "services/routes/cegep/missoes";
import { DateTimePicker } from "src/app/(home)/components/dateTimePicker";
import { useState, useMemo, useEffect } from "react";
import { FaPlaneDeparture, FaPlaneArrival } from "react-icons/fa";
import { createUpdateFragMis } from "services/routes/cegep/missoes";
import { deleteFragMis } from "services/routes/cegep/missoes";
import clsx from "clsx";

export default function MissionDetail({
   missao,
   show,
   setShow,
   edit,
   update,
}: {
   missao?: Missao;
   show: boolean;
   edit: boolean;
   setShow: React.Dispatch<React.SetStateAction<boolean>>;
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
   const [ind, setInd] = useState(defaultValues.ind);
   const [obs, setObs] = useState(defaultValues.obs);
   const [formPnt, setFormPnt] = useState(false);
   const [pnts, setPnts] = useState(defaultValues.pnts);
   const [formMil, setFormMil] = useState(false);
   const [mils, setMils] = useState(defaultValues.mils);

   const [checkAfastRegres, setCheckAfastRegres] = useState(false);

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

      // Checagem adicional: afastamento não pode ser maior que regresso
      if (checkAfast && checkRegres) {
         const dataAfast = new Date(afast);
         const dataRegres = new Date(regres);
         if (dataAfast > dataRegres) {
            errors.push(
               "- Data de afastamento não pode ser maior que a de regresso"
            );
         }
      }

      if (errors.length > 0) {
         alert("Preencha os campos obrigatórios:\n" + errors.join("\n"));
         return;
      }

      onSave();
   }

   async function onSave() {
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
         alert(data.detail);
         setEditMode(false);
         update(); // Atualiza lista, se necessário
      } else {
         const error = await response.json();
         alert(
            "Erro ao salvar missão: " + (error.detail || "Erro desconhecido")
         );
      }
   }

   async function onDelete() {
      const response = await deleteFragMis(missao.id);
      if (response.ok) {
         const data = await response.json();
         alert(data.detail);
         setShow(false);
         update(); // Atualiza lista, se necessário
      } else {
         const error = await response.json();
         alert(
            "Erro ao deletar missão: " + (error.detail || "Erro desconhecido")
         );
      }
   }

   function handleClose() {
      if (missao) {
         setEditMode(false);
      }
      setShow(false);
   }

   useEffect(() => {
      const afastValido = afast && !isNaN(new Date(afast).getTime());
      const regresValido = regres && !isNaN(new Date(regres).getTime());
      setCheckAfastRegres(afastValido && regresValido);
   }, [afast, regres]);

   useEffect(() => {
      if (show) {
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
         setEditMode(edit);
      }
   }, [show, defaultValues, edit]);

   return (
      <Modal size='2xl' show={show} onClose={handleClose}>
         <ModalHeader>Detalhes de Missão</ModalHeader>
         <ModalBody>
            <div className='flex flex-row justify-center items-center gap-4'>
               <div className='flex flex-col justify-center items-center p-2'>
                  <Label>Tipo de Ordem</Label>
                  {editMode ? (
                     <Select
                        value={tipoDoc}
                        onChange={(e) => setTipoDoc(e.target.value)}
                     >
                        <option value=''></option>
                        <option value='om'>Missão</option>
                        <option value='os'>Serviço</option>
                     </Select>
                  ) : (
                     <h2 className='text-center uppercase'>{tipoDoc}</h2>
                  )}
               </div>
               <div className='flex flex-col justify-center items-center p-2'>
                  <Label>Nº Documento</Label>
                  {editMode ? (
                     <TextInput
                        className='w-24'
                        value={nDoc ?? ""}
                        onChange={(e) =>
                           setNDoc(
                              e.target.value === ""
                                 ? undefined
                                 : Number(e.target.value)
                           )
                        }
                        onKeyDown={(e) => {
                           // Permite apenas números, backspace, tab, delete, setas
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
                     <h2 className='text-center uppercase'>{nDoc}</h2>
                  )}
               </div>
            </div>

            <div className='grid justify-items-center mt-4'>
               <Label>Descrição</Label>
               {editMode ? (
                  <TextInput
                     className='w-2/3'
                     value={desc}
                     onChange={(e) => setDesc(e.target.value)}
                  />
               ) : (
                  <h3 className='text-center uppercase'>{desc}</h3>
               )}
            </div>

            <div className='mt-4 flex justify-around items-center'>
               <div className='flex flex-col gap-1'>
                  <Label className='text-center'>Tipo Missão</Label>
                  {editMode ? (
                     <Select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                     >
                        <option value='' disabled></option>
                        <option value='tal'>TAL</option>
                        <option value='opr'>OPR</option>
                        <option value='adm'>ADM</option>
                     </Select>
                  ) : (
                     <span
                        className={clsx(
                           "text-center rounded-lg uppercase px-2 py-1 font-semibold text-slate-700",
                           {
                              "bg-amber-300": tipo === "opr",
                              "bg-blue-300": tipo === "adm",
                              "bg-green-300": tipo === "tal",
                           }
                        )}
                     >
                        {tipo}
                     </span>
                  )}
               </div>
               <div className='flex flex-col gap-1'>
                  <Label className='text-center'>Natureza</Label>
                  {editMode ? (
                     <Select
                        value={ind}
                        onChange={(e) => setInd(e.target.value)}
                     >
                        <option disabled value=''></option>
                        <option value='n_ind'>NÃO INDENIZÁVEL</option>
                        <option value='ind'>INDENIZÁVEL</option>
                     </Select>
                  ) : (
                     <span
                        className={clsx(
                           "text-center uppercase px-2 py-1 rounded-lg font-semibold text-slate-700",
                           {
                              "bg-emerald-300": ind == "ind",
                              "bg-slate-200": ind == "n_ind",
                           }
                        )}
                     >
                        {ind == "ind" && "Indenizável"}
                        {ind == "n_ind" && "Não Indenizável"}
                     </span>
                  )}
               </div>
            </div>

            <div className='flex flex-row gap-2 mt-4 justify-center items-center'>
               <Label className='text-center w-28'>Afastamento</Label>
               {editMode ? (
                  <DateTimePicker value={afast} setValue={setAfast} />
               ) : (
                  <div className='flex text-base bg-yellow-200 p-1 rounded-lg justify-around w-48'>
                     <FaPlaneDeparture className='size-5' />
                     <span className='text-center font-medium'>
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

            <div className='flex flex-row gap-2 mt-4 justify-center items-center'>
               <Label className='text-center w-28'>Regresso</Label>
               {editMode ? (
                  <DateTimePicker value={regres} setValue={setRegres} />
               ) : (
                  <div className='flex text-base bg-yellow-200 p-1 rounded-lg justify-around w-48'>
                     <FaPlaneArrival className='size-5' />
                     <span className='text-center font-medium'>
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

            <div className='p-4 bg-slate-50 rounded-lg shadow-md my-4'>
               <h3 className='text-center text-sm font-medium text-slate-600'>
                  Observações
               </h3>
               {editMode ? (
                  <Textarea
                     value={obs}
                     onChange={(e) => setObs(e.target.value)}
                  />
               ) : (
                  <span>
                     {obs ? (
                        obs
                     ) : (
                        <div className='w-full text-center mt-2 uppercase text-red-500'>
                           Nenhuma Observação adicionada
                        </div>
                     )}
                  </span>
               )}
            </div>

            <div className='bg-slate-50 flex flex-col gap-2 rounded-lg shadow-md px-1 py-4 my-2'>
               <h3 className='text-center text-sm font-medium text-slate-600'>
                  Pernoites
               </h3>
               {pnts.length == 0 && (
                  <div className='w-full text-center uppercase text-red-500'>
                     Nenhum Pernoite Adicionado
                  </div>
               )}

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
                     color='light'
                     size='sm'
                     onClick={() => setFormPnt(true)}
                     disabled={!checkAfastRegres}
                     outline
                     pill
                     className='w-full'
                  >
                     + Pernoite
                  </Button>
               )}
            </div>

            <div className='bg-slate-50 shadow-md px-1 py-4 flex flex-col gap-3 rounded-lg'>
               <h3 className='text-center text-sm font-medium text-slate-600'>
                  Militares
               </h3>
               <div className='flex flex-wrap gap-2 uppercase font-medium'>
                  {mils.length == 0 && (
                     <div className='w-full text-center text-red-500'>
                        Nenhum Militar Adicionado
                     </div>
                  )}
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
                     color='light'
                     size='sm'
                     outline
                     onClick={() => setFormMil(true)}
                     pill
                     className='w-full'
                  >
                     + Militar
                  </Button>
               )}
            </div>
         </ModalBody>
         <ModalFooter>
            <div className='flex gap-2 w-full justify-center'>
               {!editMode ? (
                  <>
                     <Button onClick={() => setEditMode(true)}>Editar</Button>
                     <Button color='failure' onClick={onDelete}>
                        Deletar
                     </Button>
                  </>
               ) : (
                  <>
                     <Button onClick={handleFragMis} disabled={!isChanged}>
                        {missao ? "Salvar" : "Adicionar"}
                     </Button>
                     {missao && (
                        <Button
                           onClick={() => setEditMode(false)}
                           color='light'
                        >
                           Cancelar
                        </Button>
                     )}
                  </>
               )}
            </div>
         </ModalFooter>
      </Modal>
   );
}
