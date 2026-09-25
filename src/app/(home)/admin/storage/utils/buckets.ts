import type { BucketStats } from "services/routes/storage";

// Módulo dono de cada bucket, para a tela falar a língua de quem opera e não
// só o slug técnico. O nome do bucket é constante de código na API (um por
// domínio); bucket que não estiver aqui aparece só pelo slug.
const ROTULOS: Record<string, string> = {
   aeromedica: "Aeromédica",
   inteligencia: "Inteligência",
   "relatorios-voo": "Relatórios de voo",
};

export function rotuloBucket(nome: string): string | null {
   return ROTULOS[nome] ?? null;
}

/**
 * Maior primeiro: a grade responde "quem está comendo o storage?". Ilegíveis
 * vão para o fim — o tamanho deles é 0 por falta de leitura, não por estarem
 * vazios, e não devem se misturar com os vazios de verdade.
 */
export function ordenarBuckets(buckets: BucketStats[]): BucketStats[] {
   return [...buckets].sort(
      (a, b) =>
         Number(b.readable) - Number(a.readable) ||
         b.total_size - a.total_size ||
         a.name.localeCompare(b.name)
   );
}

/** "12,3%" · "< 0,1%" para uso mínimo, que "0,0%" leria como vazio. */
export function formatPercent(percent: number): string {
   if (percent > 0 && percent < 0.05) return "< 0,1%";
   return `${percent.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
   })}%`;
}
