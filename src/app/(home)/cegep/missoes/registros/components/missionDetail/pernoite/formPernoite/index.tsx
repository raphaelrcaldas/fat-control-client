import {
   Modal,
   ModalBody,
   ModalHeader,
   Button,
   Checkbox,
   Textarea,
   Dropdown,
   DropdownItem,
} from "flowbite-react";
import { IoMdSearch } from "react-icons/io";
import { useState, useMemo } from "react";
import { Cidade } from "services/routes/cities";
import { Missao, Pernoite } from "services/routes/cegep/missoes";
import { DateTimePicker } from "src/app/(home)/components/dateTimePicker";
import { SearchLocal } from "../searchLocal";
import clsx from "clsx";
import MissionDetail from "../..";

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
      const afastDate = new Date(afast);
      const regresDate = new Date(regres);
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
      if (conflitoAcrescimoLocal(pnts, local.codigo, pnt)) {
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
      if (confirm("Confirma Exclusão do Pernoite ?")) {
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
   }

   return (
      <Modal size='md' show={showFormPnt} onClose={onClose}>
         <ModalHeader>Pernoite</ModalHeader>
         <ModalBody>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
               <div className='flex flex-col gap-4 justify-center'>
                  <div className='flex flex-row gap-2 justify-center items-center'>
                     <span className='font-medium text-base text-center w-12'>
                        Início
                     </span>
                     <DateTimePicker
                        value={dataIni}
                        setValue={setDataIni}
                        max={regres}
                        min={afast}
                     />
                  </div>
                  <div className='flex flex-row gap-2 justify-center items-center'>
                     <span className='font-medium text-base text-center w-12'>
                        Fim
                     </span>
                     <DateTimePicker
                        value={dataFim}
                        setValue={setDataFim}
                        max={regres}
                        min={afast}
                     />
                  </div>
               </div>

               <div className='bg-slate-100 p-2 rounded-lg shadow-md flex flex-col justify-center items-center'>
                  <h3 className='text-center font-medium'>Localidade</h3>
                  <div className='flex flex-row gap-2 p-2 justify-center items-center text-base'>
                     {local.nome ? (
                        <span className='uppercase font-medium bg-white shadow-md px-4 py-1 rounded-lg'>
                           {local.nome}-{local.uf}
                        </span>
                     ) : (
                        <>
                           <span className='text-red-600 text-sm'>
                              Insira uma localidade
                           </span>
                        </>
                     )}
                     <Button
                        pill
                        onClick={() => setShowSearchLocal(true)}
                        color='light'
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

               <div className='flex gap-2 justify-center items-center'>
                  <label className='text-base font-medium '>
                     Acréscimo Deslocamento
                  </label>
                  <Checkbox
                     checked={acDesloc}
                     onChange={(e) => setAcDesloc(e.target.checked)}
                     className='size-6'
                  />
               </div>

               <div className='flex gap-2 justify-center items-center'>
                  <label className='text-base font-medium '>Meia Diária</label>
                  <Checkbox
                     checked={meiaDiaria}
                     onChange={(e) => setMeiaDiaria(e.target.checked)}
                     className='size-6'
                  />
               </div>

               <div className='px-12'>
                  <Textarea
                     placeholder='Observação'
                     value={obs}
                     onChange={(e) => setObs(e.target.value)}
                  />
               </div>

               <div className='flex gap-3 justify-center'>
                  <Button className='w-28' type='submit' disabled={!isChanged}>
                     Salvar
                  </Button>

                  {pnt && (
                     <Button
                        onClick={onDelete}
                        className='w-28'
                        color='failure'
                     >
                        Excluir
                     </Button>
                  )}
               </div>
            </form>
         </ModalBody>
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
      return iniValue <= pFim && pIni <= fimValue;
   });
}

function conflitoAcrescimoLocal(
   pnts: Pernoite[],
   codigoLocal: number,
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

      return p.cidade?.codigo === codigoLocal && p.acrec_desloc;
   });
}
