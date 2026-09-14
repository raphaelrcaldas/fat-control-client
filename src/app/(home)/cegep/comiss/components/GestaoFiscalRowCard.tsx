import Link from "next/link";
import clsx from "clsx";
import { Progress } from "flowbite-react";
import { HiChevronRight } from "react-icons/hi";
import { formatDateFull, isoStrToDate } from "@/../utils/dateHandler";
import { realCurrency } from "utils/financeiro";
import type { ComissList } from "services/routes/cegep/comiss";
import { StatusComissChip } from "./comissChips";
import { progressColor } from "../comissDerivacoes";

interface GestaoFiscalRowCardProps {
   comiss: ComissList;
   /** Ano fiscal exibido: decide qual parcela recai sobre o exercício. */
   ano: number;
   impacto: number;
}

/**
 * Linha da lista no mobile da aba Gestão Fiscal.
 *
 * A tabela de oito colunas pedia 949px num aparelho de 360px: sobravam militar
 * e abertura, e o impacto — a razão de a tela existir — ficava atrás do
 * arrasto. Aqui o impacto é o número em destaque e nenhuma coluna sai de cena.
 */
export function GestaoFiscalRowCard({
   comiss,
   ano,
   impacto,
}: GestaoFiscalRowCardProps) {
   const user = comiss.user;
   const anoAb = isoStrToDate(comiss.data_ab).getFullYear();
   const anoFc = comiss.data_fc
      ? isoStrToDate(comiss.data_fc).getFullYear()
      : null;
   const nome = `${user?.p_g ?? ""} ${user?.nome_guerra ?? ""}`.trim();

   return (
      <Link
         href={`/cegep/comiss/${comiss.id}`}
         /* Espinha da linha, como na aba Registros: aqui ela marca se o
            comissionamento ainda está aberto no exercício. */
         className={clsx(
            "focus-visible:outline-primary-600 block border-l-4 px-4 py-3 outline-none focus-visible:outline-[2px] focus-visible:-outline-offset-2 focus-visible:[outline-style:solid] active:bg-slate-50",
            comiss.status === "aberto"
               ? "border-l-emerald-500"
               : "border-l-slate-300"
         )}
      >
         <div className="flex items-center gap-2">
            <span
               className="min-w-0 flex-1 truncate font-semibold text-slate-800 uppercase"
               title={nome}
            >
               {nome}
            </span>
            <StatusComissChip status={comiss.status} />
            <HiChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
         </div>

         <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xs text-slate-500">Impacto {ano}</span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
               {realCurrency(impacto)}
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-1.5">
               <Progress
                  progress={comiss.completude}
                  size="sm"
                  color={progressColor(comiss)}
                  textLabel={`Completude ${comiss.completude}%`}
                  className="w-16"
               />
               <span className="w-9 text-right text-xs font-medium text-slate-600 tabular-nums">
                  {comiss.completude}%
               </span>
            </span>
         </div>

         {/* Abertura e fechamento com o valor de cada ponta. A parcela que NÃO
             recai sobre o exercício exibido fica em cinza — por cor e peso, e
             não por `opacity`, que derrubaria o contraste abaixo de AA. */}
         <div className="mt-1.5 flex items-center gap-4 text-xs whitespace-nowrap">
            <PontaFiscal
               label="Ab."
               data={formatDateFull(comiss.data_ab)}
               valor={realCurrency(comiss.valor_aj_ab)}
               dentroDoExercicio={anoAb === ano}
            />
            <PontaFiscal
               label="Fc."
               data={comiss.data_fc ? formatDateFull(comiss.data_fc) : "—"}
               valor={
                  comiss.valor_aj_fc > 0
                     ? realCurrency(comiss.valor_aj_fc)
                     : "—"
               }
               dentroDoExercicio={anoFc === ano}
            />
         </div>
      </Link>
   );
}

function PontaFiscal({
   label,
   data,
   valor,
   dentroDoExercicio,
}: {
   label: string;
   data: string;
   valor: string;
   /** A ponta recai sobre o exercício exibido (e por isso fica em destaque). */
   dentroDoExercicio: boolean;
}) {
   return (
      <span className="flex items-baseline gap-1">
         <span className="text-slate-500">{label}</span>
         <span
            className={clsx(
               "font-mono",
               dentroDoExercicio ? "text-slate-600" : "text-slate-500"
            )}
         >
            {data}
         </span>
         <span
            className={clsx(
               "tabular-nums",
               dentroDoExercicio
                  ? "font-medium text-slate-700"
                  : "font-normal text-slate-500"
            )}
         >
            {valor}
         </span>
      </span>
   );
}
