import pgs from "../../../../public/infoFAB/infoPGs";
import { Select } from "flowbite-react";

export function SelectPostoGrad({ callFunc, value }) {
   return (
      <>
         <Select
            onChange={(event) => callFunc(event.target.value)}
            value={value}
            required
         >
            <option selected disabled></option>
            {Object.entries(pgs).map(([key, obj], index) => (
               <option key={index} value={key}>
                  {obj.pg.mid}
               </option>
            ))}
         </Select>
      </>
   );
}

export function SelectOMs({ callFunc, value }) {
   return (
      <Select
         required
         onChange={(event) => callFunc(event.target.value)}
         value={value}
         className='w-28'
      >
         <option disabled value={""}></option>
         <option value='11gt'>1º/1º GT</option>
         <option value='12gt'>1º/2º GT</option>
         <option value='22gt'>2º/2º GT</option>
         <option value='bagl'>BAGL</option>
         <option value='glog'>GLOG</option>
         <option value='gsdgl'>GSD-GL</option>
      </Select>
   );
}

export function SelectFuncao({ callFunc, value }) {
   return (
      <>
         <Select
            onChange={(event) => callFunc(event.target.value)}
            className='w-28'
            value={value}
            required
         >
            <option disabled value=''>
               Função
            </option>
            <option value='pil'>PIL</option>
            <option value='mc'>MC</option>
            <option value='lm'>LM</option>
            <option value='tf'>TF</option>
            <option value='os'>OS</option>
            <option value='oe'>OE</option>
         </Select>
      </>
   );
}

export function SelectOper({ callFunc, value }) {
   return (
      <>
         <Select
            onChange={(event) => callFunc(event.target.value)}
            value={value}
            required
         >
            <option disabled value=''>
               Oper
            </option>
            <option value='in'>IN</option>
            <option value='op'>OP</option>
            <option value='al'>AL</option>
         </Select>
      </>
   );
}
