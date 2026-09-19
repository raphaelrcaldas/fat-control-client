"use client";

import { Button } from "flowbite-react";
import { HiX } from "react-icons/hi";
import type { UserPublic } from "services/routes/users";

import { SearchUser } from "@/app/(home)/users/components/searchUser";

export interface MilitarSel {
   id: number;
   p_g: string;
   nome_guerra: string;
}

interface MilitaresPickerProps {
   selecionados: MilitarSel[];
   onChange: (militares: MilitarSel[]) => void;
   buscaAberta: boolean;
   onBuscaAbertaChange: (aberta: boolean) => void;
   podeSalvar: boolean;
}

/**
 * Quem cumpriu a missão.
 *
 * Todos os selecionados recebem **o mesmo multiplicador** — o que muda
 * entre eles é só o soldo do posto. Por isso não há vínculo militar↔trecho
 * aqui: a tripulação cumpre a missão junta.
 */
export function MilitaresPicker({
   selecionados,
   onChange,
   buscaAberta,
   onBuscaAbertaChange,
   podeSalvar,
}: MilitaresPickerProps) {
   function adicionar(user: UserPublic) {
      if (selecionados.some((militar) => militar.id === user.id)) return;

      onChange([
         ...selecionados,
         {
            id: user.id,
            p_g: user.p_g.toUpperCase(),
            nome_guerra: user.nome_guerra.toUpperCase(),
         },
      ]);
   }

   return (
      <div>
         <SearchUser
            show={buscaAberta}
            setShow={onBuscaAbertaChange}
            setUser={adicionar}
            userIdsIgnr={selecionados.map((militar) => militar.id)}
         />

         {selecionados.length > 0 && (
            <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
               {selecionados.map((militar) => {
                  const pG = militar.p_g.toUpperCase();
                  const nomeGuerra = militar.nome_guerra.toUpperCase();
                  const nomeCompleto = `${pG} ${nomeGuerra}`;

                  return (
                     <li key={militar.id} className="min-w-0">
                        <div className="group relative flex min-w-0 items-center gap-3 rounded border border-slate-200 bg-white px-2 py-1 shadow-sm select-none">
                           <div
                              className="min-w-0 flex-1 truncate text-xs font-medium whitespace-nowrap text-slate-700 uppercase"
                              title={nomeCompleto}
                           >
                              <span className="font-bold">{pG}</span>{" "}
                              <span>{nomeGuerra}</span>
                           </div>
                           {podeSalvar && (
                              <Button
                                 type="button"
                                 color="light"
                                 size="xs"
                                 onClick={() =>
                                    onChange(
                                       selecionados.filter(
                                          (selecionado) =>
                                             selecionado.id !== militar.id
                                       )
                                    )
                                 }
                                 title={`Remover ${nomeGuerra}`}
                                 aria-label={`Remover ${nomeGuerra}`}
                                 className="h-[24px] w-[24px] shrink-0 p-0"
                              >
                                 <HiX className="h-3.5 w-3.5" />
                                 <span className="sr-only">
                                    Remover {nomeGuerra}
                                 </span>
                              </Button>
                           )}
                        </div>
                     </li>
                  );
               })}
            </ul>
         )}

         {selecionados.length === 0 && (
            <div className="flex items-center justify-center rounded border border-slate-200 bg-white px-4 py-8 shadow-sm">
               <p className="text-sm text-slate-400 italic">
                  Nenhum militar adicionado
               </p>
            </div>
         )}
      </div>
   );
}
