import type { CenarioCorId } from "services/routes/cegep/propostas";

export interface CenarioCor {
   id: CenarioCorId;
   /** Rótulo curto da cor (usado em `title`/leitor de tela). */
   rotulo: string;
   /** Ponto de legenda / identidade da linha. Mesmo tom do `barSegment`. */
   dot: string;
   /**
    * Segmento da barra de orçamento (sem texto por cima). Tom `600`, um degrau
    * mais escuro que o `500` original: na barra empilhada, ao lado do verde de
    * "pago" e do amarelo de "previsto", o `500` não se distinguia.
    */
   barSegment: string;
   /** Texto na cor sobre fundo branco. */
   text: string;
   /** Fundo tênue para faixas/realces discretos. */
   soft: string;
   /** Anel do cartão selecionado (tom médio, sobre o fundo `soft`). */
   ring: string;
}

/**
 * Paleta fixa dos cenários. As classes são LITERAIS de propósito — o Tailwind
 * não compila `bg-${cor}-500` montado em runtime.
 *
 * Ordem escolhida para fugir das cores já semânticas da tela: verde = pago,
 * amarelo = previsto, `red-*` = perigo e `primary-*` = marca da organização.
 * Por isso os quatro primeiros hues (o caso real: 2–3 cenários) são frios e
 * inequívocos. `amber` do union do service fica **de fora**: dentro da mesma
 * barra ele é indistinguível do amarelo de "previsto". `emerald` entra por
 * último, pelo mesmo motivo em relação ao verde de "pago".
 */
export const CENARIO_PALETTE: readonly CenarioCor[] = [
   {
      id: "sky",
      rotulo: "Azul",
      dot: "bg-sky-600",
      barSegment: "bg-sky-600",
      text: "text-sky-700",
      soft: "bg-sky-50",
      ring: "ring-sky-500",
   },
   {
      id: "violet",
      rotulo: "Roxo",
      dot: "bg-violet-600",
      barSegment: "bg-violet-600",
      text: "text-violet-700",
      soft: "bg-violet-50",
      ring: "ring-violet-500",
   },
   {
      id: "cyan",
      rotulo: "Ciano",
      dot: "bg-cyan-600",
      barSegment: "bg-cyan-600",
      text: "text-cyan-700",
      soft: "bg-cyan-50",
      ring: "ring-cyan-500",
   },
   {
      id: "indigo",
      rotulo: "Índigo",
      dot: "bg-indigo-600",
      barSegment: "bg-indigo-600",
      text: "text-indigo-700",
      soft: "bg-indigo-50",
      ring: "ring-indigo-500",
   },
   {
      id: "rose",
      rotulo: "Rosa",
      dot: "bg-rose-600",
      barSegment: "bg-rose-600",
      text: "text-rose-700",
      soft: "bg-rose-50",
      ring: "ring-rose-500",
   },
   {
      id: "emerald",
      rotulo: "Verde",
      dot: "bg-emerald-600",
      barSegment: "bg-emerald-600",
      text: "text-emerald-700",
      soft: "bg-emerald-50",
      ring: "ring-emerald-500",
   },
] as const;

/**
 * Cor da paleta pelo id. Cai no primeiro hue quando o id não está na paleta —
 * o union do service é superconjunto (inclui `amber`, deliberadamente fora),
 * e um dado antigo nunca pode derrubar a tela.
 */
export function corDoCenario(id: CenarioCorId): CenarioCor {
   return CENARIO_PALETTE.find((c) => c.id === id) ?? CENARIO_PALETTE[0];
}

/**
 * Próxima cor livre da paleta. Esgotadas as seis, recomeça do início (a
 * repetição é preferível a inventar classe que o Tailwind não compilou).
 */
export function proximaCor(usadas: readonly CenarioCorId[]): CenarioCorId {
   const livre = CENARIO_PALETTE.find((c) => !usadas.includes(c.id));
   if (livre) return livre.id;
   return CENARIO_PALETTE[usadas.length % CENARIO_PALETTE.length].id;
}
