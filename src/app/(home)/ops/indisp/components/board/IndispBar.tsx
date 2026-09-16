import clsx from "clsx";
import { HiChevronLeft, HiChevronRight, HiLockClosed } from "react-icons/hi";
import { IndispBar as IndispBarModel } from "./utils/indispBars";
import {
   BAR_INSET_PX,
   laneTop,
   MIN_DIAS_CADEADO,
   MIN_DIAS_PERIODO,
   MIN_DIAS_ROTULO,
   TEXTO_DADO,
   TEXTO_VARREDURA,
   trackSpan,
} from "./utils/indispBoardLayout";

interface IndispBarProps {
   bar: IndispBarModel;
   /** Total de colunas da janela — a faixa se posiciona em % dela. */
   total: number;
   selected: boolean;
   onOpen: () => void;
}

/**
 * Uma faixa: o período inteiro como um objeto só, rotulado uma vez.
 *
 * É o que dispensou a legenda — o motivo vem escrito, o cadeado diz que o
 * escalante não altera aquilo, e a cor virou reforço em vez de ser a única
 * informação disponível.
 */
export function IndispBar({ bar, total, selected, onOpen }: IndispBarProps) {
   // Derivada também abre: não para editar (não há registro), mas para dizer
   // de onde veio e como se resolve — ver `IndispDerivada`.
   const abrivel = bar.indisp !== null || bar.restricao !== null;
   const Element = abrivel ? "button" : "div";
   const dias = bar.to - bar.from;
   const { left, width } = trackSpan(bar.from, bar.to, total, BAR_INSET_PX);
   // Faixa de um dia só cabe o código — e mal. Em 1280 ela mede ~37px, então
   // até o padding disputa espaço com as três letras que são o ÚNICO desempate
   // entre os quatro motivos que dividem o vermelho.
   const apertada = dias < MIN_DIAS_CADEADO;

   return (
      <Element
         type={abrivel ? "button" : undefined}
         onClick={abrivel ? onOpen : undefined}
         title={bar.range ? `${bar.label} · ${bar.range}` : bar.label}
         /* Faixa curta mostra só o código, então o nome acessível não pode
            depender do texto visível. */
         aria-label={[
            bar.label,
            bar.range,
            bar.effect === "aviso" ? "aviso operacional" : "",
            bar.effect === "bloqueio" ? "bloqueio operacional" : "",
            /* Só as derivadas: a faixa é calculada de outra fonte e não tem
               registro para editar. Clicar abre a ficha que diz de onde veio
               e leva até lá. */
            bar.locked ? "sem registro para editar, abre a origem" : "",
         ]
            .filter(Boolean)
            .join(" · ")}
         style={{ left, width, top: laneTop(bar.lane), height: "var(--bar-h)" }}
         className={clsx(
            "absolute z-20 flex items-center overflow-hidden text-left leading-none font-semibold whitespace-nowrap shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)] transition-[filter] hover:brightness-95",
            TEXTO_DADO,
            apertada ? "justify-center gap-0.5 px-0.5" : "gap-1.5 px-2",
            // Canto reto no lado em que o período continua fora da janela.
            bar.cutLeft ? "rounded-l-none" : "rounded-l",
            bar.cutRight ? "rounded-r-none" : "rounded-r",
            selected && "ring-2 ring-current ring-inset",
            bar.effect === "aviso" && "border border-dashed border-slate-400",
            bar.bar
         )}
      >
         {bar.cutLeft && <HiChevronLeft aria-hidden className="shrink-0" />}
         {bar.locked && !apertada && (
            <HiLockClosed aria-hidden className="shrink-0" />
         )}
         {/* `leading-none` REPETIDO em cada filho, e não só na faixa: as
             utilidades de tamanho do Tailwind trazem o `line-height` junto
             (aqui o `text-xs` do código resolvia para 10,5px/14px) e
             sobrescrevem o da faixa. Com caixas de alturas diferentes o
             `items-center` centrava as CAIXAS, não os glifos, e o código de
             três letras assentava ~1px fora do rótulo — medido no navegador.

             `items-baseline` parece a correção óbvia e NÃO é: o rótulo usa
             `truncate` (`overflow:hidden`), o que lhe dá baseline própria de
             bloco, e o desvio aumenta em vez de sumir. */}
         <code
            className={clsx(
               "shrink-0 font-mono leading-none font-bold tracking-wider",
               TEXTO_VARREDURA
            )}
         >
            {bar.code}
         </code>
         {/* O limiar é em dias e não sabe o comprimento do rótulo: "Saúde" cabe
             em 3 dias, "CEMAL vencido" não. Truncar o RÓTULO é honesto (lê-se
             "CEMAL venci…"); truncar o código não seria, e por isso ele é
             `shrink-0`. */}
         {dias >= MIN_DIAS_ROTULO && (
            <span className="min-w-0 truncate leading-none">{bar.label}</span>
         )}
         {dias >= MIN_DIAS_PERIODO && bar.range && (
            <span
               className={clsx(
                  "ml-auto font-mono leading-none font-medium",
                  TEXTO_VARREDURA
               )}
            >
               {bar.range}
            </span>
         )}
         {bar.cutRight && (
            <HiChevronRight aria-hidden className="ml-auto shrink-0" />
         )}
      </Element>
   );
}
