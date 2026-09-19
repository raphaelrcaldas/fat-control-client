"use client";

import { useState, type KeyboardEvent } from "react";
import { Button, TextInput } from "flowbite-react";
import { HiPlus, HiX } from "react-icons/hi";
import { TbPlaneInflight } from "react-icons/tb";

import { validateIcao } from "../helpers/locEspForm";

interface IcaoInputProps {
   value: string[];
   onChange: (icaos: string[]) => void;
   /** Erro vindo da validação do formulário inteiro (lista vazia). */
   error?: string;
   disabled?: boolean;
}

/**
 * Entrada dos aeródromos que atendem a localidade.
 *
 * É lista e não campo único porque um município pode ter vários: Manaus tem
 * SBEG e SBMN, São Gabriel da Cachoeira tem três. Cada ICAO vira um chip
 * removível — ver docs/dominio/gle.md.
 */
export function IcaoInput({
   value,
   onChange,
   error,
   disabled,
}: IcaoInputProps) {
   const [rascunho, setRascunho] = useState("");
   const [erroLocal, setErroLocal] = useState<string | null>(null);

   function adicionar() {
      const candidato = rascunho.trim().toUpperCase();
      const problema = validateIcao(candidato, value);
      if (problema) {
         setErroLocal(problema);
         return;
      }
      onChange([...value, candidato]);
      setRascunho("");
      setErroLocal(null);
   }

   function remover(icao: string) {
      onChange(value.filter((item) => item !== icao));
   }

   // Enter adiciona sem submeter o formulário em volta — num campo de lista
   // o Enter pertence ao item, não ao form.
   function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      if (event.key === "Enter") {
         event.preventDefault();
         adicionar();
      }
   }

   const mensagem = erroLocal ?? error;

   return (
      <div>
         <div className="flex gap-2">
            <TextInput
               id="icao"
               value={rascunho}
               onChange={(e) => {
                  setRascunho(e.target.value.toUpperCase());
                  if (erroLocal) setErroLocal(null);
               }}
               onKeyDown={handleKeyDown}
               placeholder="SBEG"
               maxLength={4}
               disabled={disabled}
               color={mensagem ? "failure" : undefined}
               className="flex-1 font-mono uppercase"
               aria-label="Código ICAO do aeródromo"
               aria-invalid={mensagem ? true : undefined}
            />
            <Button
               type="button"
               color="light"
               onClick={adicionar}
               disabled={disabled || !rascunho.trim()}
               aria-label="Adicionar ICAO à lista"
            >
               <HiPlus className="h-4 w-4 sm:mr-2" />
               <span className="hidden sm:inline">Adicionar</span>
            </Button>
         </div>

         {mensagem && (
            <p className="mt-1 text-sm text-red-600" role="alert">
               {mensagem}
            </p>
         )}

         {value.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
               {value.map((icao) => (
                  <li key={icao}>
                     <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 py-1 pr-1 pl-2.5 font-mono text-sm font-semibold text-slate-700">
                        {icao}
                        <button
                           type="button"
                           onClick={() => remover(icao)}
                           disabled={disabled}
                           className="grid h-[24px] w-[24px] place-items-center rounded text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-50"
                           aria-label={`Remover ${icao}`}
                        >
                           <HiX className="h-3.5 w-3.5" />
                        </button>
                     </span>
                  </li>
               ))}
            </ul>
         ) : (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
               <TbPlaneInflight className="h-3.5 w-3.5 shrink-0" />
               Nenhum aeródromo. É o ICAO que liga a etapa de voo a esta
               localidade.
            </p>
         )}
      </div>
   );
}
