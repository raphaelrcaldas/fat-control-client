"use client";

import clsx from "clsx";
import { HiOutlineUser } from "react-icons/hi";
import { MdErrorOutline, MdOutlineFlightTakeoff } from "react-icons/md";
import {
   daysInclusive,
   dateToIso,
   formatDateTime,
   formatPeriodo,
   isoDateToString,
} from "utils/dateHandler";
import { getIndispOption } from "@/constants/ops/indisponibilidades";
import { useIndispModalActions } from "../context/indispModalContext";
import { CrewIndisp, IndispType } from "services/routes/indisps";
import type { RestricaoDerivada } from "services/routes/ops/restricoes";

type IndispDetailsProps = {
   trip: CrewIndisp;
   dateRef: Date;
   filterIndisp: IndispType[];
   restricoesDerivadas: RestricaoDerivada[];
};

/**
 * O que a célula da grade abre.
 *
 * ## Por que tudo passou a ser alinhado à esquerda
 *
 * Nome, dia da semana, data, motivo, período e observação vinham todos
 * centralizados, cada um numa linha de largura diferente: a margem esquerda
 * mudava a cada linha e o olho reancorava seis vezes para ler um cartão só.
 * Texto em bloco tem uma margem de leitura, e ela é a esquerda.
 *
 * ## Por que o cartão deixou de ser todo colorido
 *
 * A superfície inteira pintada com a cor do motivo (`bg-red-100` e afins)
 * gastava a cor mais forte da tela no fundo, e sobrava pouco contraste para o
 * texto. A cor passou para onde ela informa: uma barra lateral (o mesmo
 * recurso do `MissionRow` no cegep — é como este projeto marca categoria em
 * lista) mais um chip com o nome do motivo. A barra ecoa a cor da célula que
 * o usuário acabou de clicar, então a ligação grade → modal fica explícita.
 *
 * ## Por que os avisos usam roxo e slate, e não vermelho e laranja
 *
 * "CEMAL inválido" e "Desadaptado" já têm cor definida na grade e na legenda
 * (`ColorLegend`/`getStatusColor`): **roxo** e **slate**. O modal os pintava
 * de vermelho e laranja, ou seja: clicava-se numa célula roxa e abria-se um
 * alerta vermelho. Aqui eles passam a usar a cor da própria legenda.
 * (Vermelho segue reservado a perigo/erro no sistema — e não é esse o caso:
 * é o mesmo tipo de resposta à pergunta "por que este dia não está verde?",
 * por isso os avisos entram na MESMA pilha das indisponibilidades, e não num
 * bloco separado com `m-2` como antes.)
 */
export default function IndispDetails({
   dateRef,
   trip,
   filterIndisp,
   restricoesDerivadas,
}: IndispDetailsProps) {
   const { openForm } = useIndispModalActions();

   const diaSemana = dateRef.toLocaleDateString("pt-BR", { weekday: "long" });
   const dataFormatada = isoDateToString(dateToIso(dateRef));
   const vazio = filterIndisp.length === 0 && restricoesDerivadas.length === 0;

   return (
      <div className="text-sm">
         <div className="mb-3 border-b border-slate-200 pb-3">
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 uppercase">
               <HiOutlineUser
                  aria-hidden
                  className="size-4 shrink-0 text-slate-400"
               />
               {`${trip.user.posto.short} ${trip.user.nome_guerra}`}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
               {dataFormatada} ·{" "}
               {/* `capitalize` no elemento inteiro escrevia "Quarta-Feira":
                   ele maiusculiza cada palavra, e o hífen conta como
                   separador. Só a primeira letra. */}
               <span className="inline-block first-letter:uppercase">
                  {diaSemana}
               </span>
            </p>
         </div>

         <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {filterIndisp.map((indisp, index) => (
               <IndispBody
                  key={indisp.id ?? index}
                  indisp={indisp}
                  onClick={() => openForm({ trip, indisp })}
               />
            ))}

            {restricoesDerivadas.map((restricao) => (
               <RestricaoDerivadaBody
                  key={`${restricao.origem}-${restricao.codigo}`}
                  restricao={restricao}
               />
            ))}

            {vazio && (
               <p className="py-4 text-center text-gray-500">
                  Sem indisponibilidades
               </p>
            )}
         </div>
      </div>
   );
}

function RestricaoDerivadaBody({
   restricao,
}: {
   restricao: RestricaoDerivada;
}) {
   if (restricao.origem === "cemal") {
      return (
         <Aviso
            icon={MdErrorOutline}
            texto={
               restricao.codigo === "cemal_ausente"
                  ? "CEMAL não informado"
                  : "CEMAL inválido"
            }
            className="border-purple-200 bg-purple-50 text-purple-800 before:bg-purple-600"
         />
      );
   }

   return (
      <Aviso
         icon={MdOutlineFlightTakeoff}
         texto="Desadaptado"
         className="border-slate-300 bg-slate-50 text-slate-700 before:bg-slate-600"
      />
   );
}

/** Base comum dos blocos: barra lateral colorida e o recuo que a acomoda. */
const BLOCO =
   "relative overflow-hidden rounded border py-2.5 pr-3 pl-4 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']";

function Aviso({
   icon: Icon,
   texto,
   className,
}: {
   icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
   texto: string;
   className: string;
}) {
   return (
      <div className={clsx(BLOCO, className)}>
         <p className="flex items-center gap-2 text-sm font-bold uppercase">
            <Icon aria-hidden className="size-4 shrink-0" />
            {texto}
         </p>
      </div>
   );
}

type IndispBodyProps = {
   indisp: IndispType;
   onClick: () => void;
};

function IndispBody({ indisp, onClick }: IndispBodyProps) {
   const indispProps = getIndispOption(indisp.mtv);
   // "DD/MM → DD/MM/YY" (`formatPeriodo`) é o formato de período que o client
   // já usa; a duração ao lado é o dado que faltava e que ninguém obtinha sem
   // fazer a conta de cabeça. Em fonte tabular, os dígitos ficam um sob o
   // outro entre cartões e o olho compara períodos sem reler.
   const periodo = formatPeriodo(indisp.date_start, indisp.date_end);
   const dias = daysInclusive(indisp.date_start, indisp.date_end);
   const lancadaEm = formatDateTime(indisp.created_at);
   const resp = indisp.user_created;

   return (
      <button
         type="button"
         onClick={onClick}
         className={clsx(
            "block w-full cursor-pointer border-slate-200 bg-white text-left transition-shadow hover:shadow",
            BLOCO,
            indispProps?.color.bar
         )}
      >
         <span
            className={clsx(
               "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide text-gray-900 uppercase",
               indispProps?.color.bg,
               indispProps?.color.border
            )}
         >
            {indispProps?.label ?? indisp.mtv}
         </span>

         <p className="mt-1.5 font-mono text-sm font-semibold tracking-tight text-gray-900 tabular-nums">
            {periodo}
            {dias !== null && (
               <span className="ml-2 font-sans text-xs font-normal text-gray-500">
                  {dias} {dias === 1 ? "dia" : "dias"}
               </span>
            )}
         </p>

         {indisp.obs && (
            <p className="mt-1 leading-relaxed whitespace-pre-line text-gray-700">
               {indisp.obs}
            </p>
         )}

         {/* Quem lançou aparece SEMPRE: esta grade é de outra pessoa, e a
             autoria é justamente o que não se sabe. O `#id` fica na mesma
             linha de metadados — antes ele flutuava sobre o canto do cartão
             (`absolute top-1 left-2`) e colidia com o conteúdo. */}
         <p className="mt-1.5 text-[11px] text-gray-500">
            {resp && (
               <span className="font-medium uppercase">
                  {resp.posto.short} {resp.nome_guerra}
               </span>
            )}
            {resp && lancadaEm && " · "}
            {lancadaEm}
            {indisp.id != null && (
               <span className="text-gray-400"> · #{indisp.id}</span>
            )}
         </p>
      </button>
   );
}
