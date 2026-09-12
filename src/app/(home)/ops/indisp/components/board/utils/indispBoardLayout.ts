/**
 * Fonte ÚNICA das medidas da grade.
 *
 * Barra de mês, régua de dias e linhas são três elementos irmãos que precisam
 * casar coluna a coluna. Enquanto cada um declarava a própria largura, bastava
 * um padding a mais num deles para a régua sair deslocada das faixas — foi
 * assim que o protótipo ganhou 20px de desalinhamento. Todos leem daqui.
 */

/** Coluna do trigrama — a única largura fixa; a trilha ocupa o resto. */
export const TRIG_COL = "w-(--trig-w) shrink-0";

/**
 * Altura da faixa via variável CSS, não via constante JS.
 *
 * A faixa é o alvo clicável da grade, e alvo cresce no dedo e encolhe no
 * mouse: 24px cumpre o mínimo WCAG do ponteiro fino, e no toque vai a 34px —
 * NÃO a 44px, porque uma linha de três pistas a 44px estoura a tela; a linha
 * inteira, que é o alvo do trigrama, chega aos 44 (5*2 + 34).
 * Como as alturas entram em `style` inline — que não aceita media query — a
 * escolha vive numa variável que o `pointer-coarse` troca, e os cálculos
 * abaixo são `calc()` em cima dela.
 */
export const LANE_VARS =
   "[--trig-w:44px] sm:[--trig-w:52px] [--bar-h:24px] [--lane-gap:4px] [--row-pad:4px] pointer-coarse:[--bar-h:34px] pointer-coarse:[--row-pad:5px]";

/** Altura da linha em função de quantas pistas ela precisa empilhar. */
export function rowHeight(lanes: number): string {
   return `calc(var(--row-pad) * 2 + ${lanes} * var(--bar-h) + ${lanes - 1} * var(--lane-gap))`;
}

/** Distância do topo da linha até a pista `lane`. */
export function laneTop(lane: number): string {
   return `calc(var(--row-pad) + ${lane} * (var(--bar-h) + var(--lane-gap)))`;
}

/** Respiro lateral da faixa, para duas vizinhas não se encostarem. */
export const BAR_INSET_PX = 2;

/**
 * Posição horizontal em % da trilha — a trilha é fluida, não tem px fixo.
 * `inset` afasta a faixa das vizinhas sem quebrar o alinhamento com a régua.
 */
export function trackSpan(
   from: number,
   to: number,
   total: number,
   inset = 0
): { left: string; width: string } {
   const left = (from / total) * 100;
   const width = ((to - from) / total) * 100;
   if (!inset) return { left: `${left}%`, width: `${width}%` };
   return {
      left: `calc(${left}% + ${inset}px)`,
      width: `calc(${width}% - ${inset * 2}px)`,
   };
}

/**
 * ESCALA TIPOGRÁFICA DA GRADE — dois degraus, não seis.
 *
 * A grade chegou a ter 8,5 / 9 / 10 / 10,5 / 11 e 11,5px espremidos numa faixa
 * de 3px. Hierarquia se lê por degrau: com 0,5px de diferença o olho não
 * ranqueia nada, só registra "tudo pequeno e tudo parecido". Os papéis são
 * dois, então os tamanhos são dois — o que separa dentro de cada degrau é
 * PESO, CAIXA e COR, não meio pixel a mais:
 *
 * - `TEXTO_VARREDURA` (`text-xs`, 10,5px) — rótulo de apoio: mês, TRIP,
 *   sigla do dia, código e período da faixa, separador de alunos. Sempre em
 *   caixa alta com tracking aberto.
 * - `TEXTO_DADO` (`text-sm`, 12,25px) — número do dia, trigrama e motivo.
 *   Os dois papéis usam tokens e acompanham a preferência de fonte do usuário.
 *
 * As constantes carregam SÓ o tamanho, de propósito: peso, caixa e cor ficam
 * no ponto de uso, porque é neles que a diferença dentro de um degrau mora (o
 * período da faixa é `font-medium` opaco, o código é `font-bold` — mesmo
 * tamanho, papéis distintos).
 *
 * Fora da grade valem os tokens normais (`text-sm` no chrome, `text-base` no
 * título do painel). O masthead segue o padrão canônico do projeto (eyebrow de
 * 10px + h1), que é compartilhado com todas as telas e não se mexe aqui.
 */
export const TEXTO_VARREDURA = "text-xs";
export const TEXTO_DADO = "text-sm";

/** Largura de N colunas na trilha — mês, régua e skeleton medem por aqui. */
export function colWidth(days: number, total: number): string {
   return `${(days / total) * 100}%`;
}

/**
 * Quanto texto a faixa comporta, medido em DIAS e não em px: o número de
 * colunas acompanha a largura da tela (ver `useVisibleDays`), então a largura
 * de um dia fica aproximadamente constante entre breakpoints.
 */
export const MIN_DIAS_ROTULO = 3;

/**
 * Abaixo disso a faixa NÃO leva cadeado.
 *
 * Numa faixa de 1 dia (~35px) o cadeado, o gap e o padding somavam 47px de
 * conteúdo: o código de 3 letras era cortado e "REP" virava "REI" — uma
 * legenda que mente é pior que legenda nenhuma, e o código é o único
 * desempate entre os quatro motivos que dividem o vermelho. O cadeado
 * sobrevive no `aria-label` e no `title`.
 */
export const MIN_DIAS_CADEADO = 2;
export const MIN_DIAS_PERIODO = 6;
