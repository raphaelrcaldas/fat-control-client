import type { RelatorioMensal } from "services/routes/estatistica/relatorioMensal";

export const metricasMensais = {
   tvoo: 120,
   diurno: 60,
   noturno: 30,
   nvg: 30,
   sem_regime: 0,
   pousos: 2,
   etapas: 1,
   ultimo_voo: "2026-05-10",
};
export const metricasVazias = {
   tvoo: 0,
   diurno: 0,
   noturno: 0,
   nvg: 0,
   sem_regime: 0,
   pousos: 0,
   etapas: 0,
   ultimo_voo: null,
};
export const relatorioMensalFixture: RelatorioMensal = {
   ano: 2026,
   mes: 5,
   tripulante: {
      id: 7,
      user_id: 8,
      p_g: "2º Sgt",
      nome_guerra: "Fulano",
      nome_completo: "Fulano da Silva",
      trig: "FUL",
   },
   aeronaves: {
      total: metricasMensais,
      acumulado_ano: { ...metricasMensais, tvoo: 600 },
      acumulado_geral: { ...metricasMensais, tvoo: 30000 },
      por_aeronave_funcao: [
         { ...metricasMensais, modelo: "kc-390", func: "lm" },
      ],
      etapas: [
         {
            id: 1,
            data: "2026-05-10",
            missao_id: 15,
            missao: null,
            anv: "2870",
            modelo: "kc-390",
            origem: "SBGL",
            destino: "SBBR",
            dep: "10:00:00",
            arr: "12:00:00",
            tvoo: 120,
            diurno: 60,
            noturno: 30,
            nvg: 30,
            sem_regime: 0,
            pousos: 2,
            funcoes: [
               { func: "lm", nome: "Loadmaster", func_bordo: "AC" },
               { func: "ml", nome: "Mestre de lançamento", func_bordo: "IN" },
            ],
         },
      ],
   },
   simuladores: {
      total: metricasVazias,
      acumulado_ano: metricasVazias,
      acumulado_geral: metricasVazias,
      por_aeronave_funcao: [],
      etapas: [],
   },
};
