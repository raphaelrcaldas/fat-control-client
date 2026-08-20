import type { StatusPaop } from "services/routes/instrucao/paops";

/**
 * Cor e rótulo de cada situação do plano. Classes cravadas porque o Tailwind
 * não compila nome de cor montado em runtime.
 */
export const STATUS_META: Record<
   StatusPaop,
   { label: string; badge: string; dot: string }
> = {
   rascunho: {
      label: "Rascunho",
      badge: "bg-amber-100 text-amber-800 border-amber-500/60",
      dot: "bg-amber-500",
   },
   vigente: {
      label: "Vigente",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-500/60",
      dot: "bg-emerald-500",
   },
   encerrado: {
      label: "Encerrado",
      badge: "bg-slate-100 text-slate-700 border-slate-400/60",
      dot: "bg-slate-400",
   },
};
