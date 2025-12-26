export const tiposMissao = ["Transporte Aerologístico", "Lançamento de PQD"];

export const statusOptions = [
   "Rascunho",
   "Elaborada",
   "Finalizada",
   "Revisada",
];

export const esquadroes = ["1GT1", "2GT2", "1ETA", "2ETA"];

export const matriculasAeronaves = [2853, 2857, 2859, 2860];

export const statusConfig = {
   Rascunho: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-300",
   },
   Elaborada: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-300",
   },
   Finalizada: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-300",
   },
   Revisada: {
      bg: "bg-violet-100",
      text: "text-violet-700",
      border: "border-violet-300",
   },
} as const;
