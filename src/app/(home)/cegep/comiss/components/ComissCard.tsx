import Link from "next/link";
import clsx from "clsx";
import { Progress } from "flowbite-react";
import { HiChevronRight } from "react-icons/hi";
import { isoDateToString } from "utils/dateHandler";
import { ComissList } from "services/routes/cegep/comiss";
import {
   deriveComissDias,
   progressColor,
   spineColor,
} from "../comissDerivacoes";
import { TipoComissChip, ModuloComissChip } from "./comissChips";

interface ComissCardProps {
   comiss: ComissList;
}

/**
 * Linha da lista no mobile.
 *
 * A tabela some abaixo de `md` porque as nove colunas estouravam 674px além da
 * viewport do aparelho de referência: sobravam militar e data de abertura, e
 * progresso e dias restantes — o motivo de abrir a tela — ficavam atrás de
 * rolagem horizontal. Aqui o alvo de toque é a linha inteira e nenhum dado da
 * tabela sai de cena: tipo e módulo viram badges, as datas viram um intervalo
 * e as três colunas de dias viram uma trinca rotulada.
 */
export function ComissCard({ comiss }: ComissCardProps) {
   const user = comiss.user;
   const { previsto, computado, restante, restanteNegativo } =
      deriveComissDias(comiss);

   return (
      <Link
         href={`/cegep/comiss/${comiss.id}`}
         /* Espinha da linha (borda esquerda do proprio bloco, nao um filho
            absoluto), codificando o MODULO como na tabela — com o fechado
            sobrepondo. Ver `spineColor`. */
         className={clsx(
            "focus-visible:outline-primary-600 block border-l-4 px-4 py-3 outline-none focus-visible:outline-[2px] focus-visible:-outline-offset-2 focus-visible:[outline-style:solid] active:bg-slate-50",
            spineColor(comiss)
         )}
      >
         <div className="flex items-center gap-2">
            <span
               className="min-w-0 flex-1 truncate font-semibold text-slate-800 uppercase"
               title={`${user?.p_g ?? ""} ${user?.nome_guerra ?? ""}`.trim()}
            >
               {user?.p_g} {user?.nome_guerra}
            </span>
            <TipoComissChip periodo={!!comiss.dias_cumprir} />
            <HiChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
         </div>

         <div className="mt-1.5 flex items-center gap-2">
            <span className="shrink-0 font-mono text-xs whitespace-nowrap text-slate-500">
               {isoDateToString(comiss.data_ab)} –{" "}
               {isoDateToString(comiss.data_fc)}
            </span>
            {/* `w-full` no wrapper: o trilho do Progress e um filho com largura
                propria, e sozinho num flex ele colapsava para zero. */}
            <div className="min-w-0 flex-1">
               <Progress
                  progress={comiss.completude}
                  color={progressColor(comiss)}
                  size="sm"
                  textLabel={`Completude ${comiss.completude}%`}
                  className="w-full"
               />
            </div>
            <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-600 tabular-nums">
               {comiss.completude}%
            </span>
         </div>

         <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
            {/* Mesma hierarquia da tabela: referência, cumprido, e o restante
                em destaque — é ele que diz se ainda há o que fazer. */}
            <CardDias label="Previsto" valor={previsto} peso="referencia" />
            <CardDias label="Computado" valor={computado} peso="cumprido" />
            <CardDias
               label="Restante"
               valor={restante}
               peso="acao"
               negativo={restanteNegativo}
            />
            <span className="ml-auto flex shrink-0 items-center gap-1">
               <span>Módulo</span>
               <ModuloComissChip modulo={comiss.modulo} />
            </span>
         </div>
      </Link>
   );
}

/** Peso visual de cada um dos três números, espelhando o da tabela. */
const PESO_DIAS = {
   referencia: "font-normal text-slate-500",
   cumprido: "font-medium text-slate-700",
   acao: "font-bold text-slate-900",
} as const;

function CardDias({
   label,
   valor,
   peso,
   negativo = false,
}: {
   label: string;
   valor: string;
   peso: keyof typeof PESO_DIAS;
   negativo?: boolean;
}) {
   return (
      /* `whitespace-nowrap`: no comparativo o valor e `~ 53`, e o espaco antes
         do numero era ponto de quebra — a linha virava duas. */
      <span className="flex items-baseline gap-1 whitespace-nowrap">
         <span>{label}</span>
         <span
            className={clsx(
               "text-sm tabular-nums",
               negativo ? "font-bold text-red-600" : PESO_DIAS[peso]
            )}
         >
            {valor}
         </span>
      </span>
   );
}
