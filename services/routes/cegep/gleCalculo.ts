/**
 * Forma da apuração de GLE devolvida pelo backend.
 *
 * Só tipos: a apuração não tem rota própria — ela chega dentro da missão
 * salva (`gleMissoes.ts`), que é quem o backend recalcula a cada leitura.
 */

export interface DiaCalculado {
   data: string;
   horas: string;
   fator: string;
   /** Dia zerado pela antisobreposição — já pago em outro trecho. */
   duplicado: boolean;
}

export interface TrechoCalculado {
   loc_esp_id: number;
   cidade: string;
   uf: string;
   grupo: number;
   chegada: string;
   afastamento: string;
   dias_contados: number;
   multiplicador: string;
   dias: DiaCalculado[];
}
