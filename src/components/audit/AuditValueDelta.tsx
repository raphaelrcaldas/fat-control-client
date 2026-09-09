"use client";

/**
 * Soma de caracteres (antigo + novo) a partir da qual o par deixa de ser
 * "antigo → novo" em linha e vira bloco empilhado. Calibrado na medida de
 * leitura real: acima disso o par já não cabe em duas linhas.
 */
const LIMIAR_TEXTO_LONGO = 120;

export interface AuditValueDeltaProps {
   /** Valor anterior; `null`/`undefined` quando o campo está nascendo agora. */
   before?: string | null;
   after: string;
   /** Texto para o valor ausente — cada domínio tem o seu ("(vazio)", "—"). */
   vazio?: string;
}

/**
 * "antigo → novo" de um campo, na convenção de diff do sistema: o que saiu
 * riscado, o que entrou em verde.
 *
 * Campo de texto livre (observação, ordem especial) chega com parágrafos
 * inteiros. Em linha, o valor ANTIGO — riscado, vermelho, muitas vezes em
 * caixa alta — ocupava quatro linhas de ponta a ponta e enterrava o valor
 * novo, que é o que interessa: o evento passava a gritar o que deixou de
 * valer. Acima do limiar os dois viram blocos empilhados, cada um cortado em
 * três linhas com o texto inteiro no `title`. O diff continua completo para
 * quem precisar; o que sai da tela é a repetição.
 */
export function AuditValueDelta({
   before,
   after,
   vazio = "(vazio)",
}: AuditValueDeltaProps) {
   // Campo nascendo (criação, ou opcional preenchido pela primeira vez) não
   // tem "de → para": mostrar "(vazio) → X" é ruído, o valor sozinho basta.
   if (before === undefined || before === null) {
      return <span className="text-green-700 tabular-nums">{after}</span>;
   }

   const antes = before === "" ? vazio : before;
   const depois = after === "" ? vazio : after;

   if (antes.length + depois.length > LIMIAR_TEXTO_LONGO) {
      return (
         <span className="mt-0.5 block space-y-0.5">
            <span
               title={antes}
               className="line-clamp-3 text-red-600 line-through"
            >
               {antes}
            </span>
            <span className="sr-only"> para </span>
            <span title={depois} className="line-clamp-3 text-green-700">
               {depois}
            </span>
         </span>
      );
   }

   return (
      <>
         <span className="text-red-600 tabular-nums line-through">{antes}</span>
         {/* slate-500 (4,76:1) e não slate-400 (2,63:1): a seta é o único
             sinal visual da direção da mudança e precisa cumprir AA */}
         <span aria-hidden className="text-slate-500">
            {" → "}
         </span>
         <span className="sr-only"> para </span>
         <span className="text-green-700 tabular-nums">{depois}</span>
      </>
   );
}
