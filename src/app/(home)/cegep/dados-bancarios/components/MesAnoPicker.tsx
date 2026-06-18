import { useMemo } from "react";
import { Select } from "flowbite-react";
import { joinMonthInput, splitMonthInput } from "@/../utils/dateHandler";
import { MESES_PT } from "../constants/bancos";

interface MesAnoPickerProps {
   value: string; // "YYYY-MM"
   onChange: (value: string) => void;
   error?: boolean;
}

/** Seletor de mês/ano em dois <Select> sobre um valor "YYYY-MM". */
export function MesAnoPicker({ value, onChange, error }: MesAnoPickerProps) {
   const anos = useMemo(() => {
      const atual = new Date().getFullYear();
      return Array.from({ length: 6 }, (_, i) => atual - i);
   }, []);

   const { ano, mes } = splitMonthInput(value);
   const color = error ? "failure" : "gray";

   return (
      <>
         <Select
            id="mes_ano_mes"
            value={mes}
            onChange={(e) => onChange(joinMonthInput(ano, e.target.value))}
            color={color}
            className="flex-1"
         >
            <option value="">Mês</option>
            {MESES_PT.map((nome, i) => (
               <option key={i} value={String(i + 1).padStart(2, "0")}>
                  {nome}
               </option>
            ))}
         </Select>
         <Select
            id="mes_ano_ano"
            value={ano}
            onChange={(e) => onChange(joinMonthInput(e.target.value, mes))}
            color={color}
            className="w-28"
         >
            <option value="">Ano</option>
            {anos.map((a) => (
               <option key={a} value={a}>
                  {a}
               </option>
            ))}
         </Select>
      </>
   );
}
