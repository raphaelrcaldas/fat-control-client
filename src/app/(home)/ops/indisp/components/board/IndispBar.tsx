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
   const Element = bar.indisp ? "button" : "div";
   const dias = bar.to - bar.from;
   const { left, width } = trackSpan(bar.from, bar.to, total, BAR_INSET_PX);
   // Faixa de um dia só cabe o código — e mal. Em 1280 ela mede ~37px, então
   // até o padding disputa espaço com as três letras que são o ÚNICO desempate
   // entre os quatro motivos que dividem o vermelho.
   const apertada = dias < MIN_DIAS_CADEADO;

   return (
      <Element
         type={bar.indisp ? "button" : undefined}
         onClick={bar.indisp ? onOpen : undefined}
         title={bar.range ? `${bar.label} · ${bar.range}` : bar.label}
         /* Faixa curta mostra só o código, então o nome acessível não pode
            depender do texto visível. */
         aria-label={[
            bar.label,
            bar.range,
            bar.effect === "aviso" ? "aviso operacional" : "",
            bar.effect === "bloqueio" ? "bloqueio operacional" : "",
            /* Sinal de origem, não de tranca: o gestor abre e corrige pelo
               client. O cadeado diz que o motivo nasce fora da escala
               (aeromédica, férias, licença), não que o campo está travado. */
            bar.locked ? "motivo fora da gestão da escala" : "",
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
         <code
            className={clsx(
               "shrink-0 font-mono font-bold tracking-wider",
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
            <span className="min-w-0 truncate">{bar.label}</span>
         )}
         {dias >= MIN_DIAS_PERIODO && bar.range && (
            <span
               className={clsx(
                  "ml-auto font-mono font-medium",
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
