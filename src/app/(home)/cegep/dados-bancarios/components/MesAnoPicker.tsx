import { useMemo } from "react";
import { Select } from "flowbite-react";
import { splitMonthInput } from "@/../utils/dateHandler";
import { MESES_PT } from "../constants/bancos";

interface MesAnoPickerProps {
   value: string; // "YYYY-MM", "" ou parcial ("YYYY-" / "-MM")
   onChange: (value: string) => void;
   error?: boolean;
}

/**
 * Seletor de mês/ano em dois <Select>. A seleção parcial fica no próprio
 * valor ("2026-" / "-05"): com `joinMonthInput`, que devolve "" se faltar uma
 * parte, escolher só o mês apagava o ano e os dois selects travavam no vazio.
 * Quem valida o valor completo é o formulário.
 */
export function MesAnoPicker({ value, onChange, error }: MesAnoPickerProps) {
   const { ano, mes } = splitMonthInput(value);

   const anos = useMemo(() => {
      const atual = new Date().getFullYear();
      const lista = Array.from({ length: 6 }, (_, i) => atual - i);
      // Registro mais antigo que a janela continua aparecendo selecionado.
      const salvo = Number(ano);
      if (salvo && !lista.includes(salvo)) lista.push(salvo);
      return lista.sort((a, b) => b - a);
   }, [ano]);

   const emit = (novoAno: string, novoMes: string) =>
      onChange(novoAno || novoMes ? `${novoAno}-${novoMes}` : "");

   const color = error ? "failure" : "gray";

   return (
      <>
         <Select
            id="mes_ano_mes"
            aria-label="Mês de referência"
            value={mes}
            onChange={(e) => emit(ano, e.target.value)}
            color={color}
            className="min-w-0 flex-1"
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
            aria-label="Ano de referência"
            value={ano}
            onChange={(e) => emit(e.target.value, mes)}
            color={color}
            className="w-24 shrink-0"
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
