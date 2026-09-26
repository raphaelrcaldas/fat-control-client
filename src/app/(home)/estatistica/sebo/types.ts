export type InfoColumn =
   "cemal" | "tovn" | "imae" | "crm" | "val_pass" | "val_visa" | "cvi" | "ptai";

export interface InfoColumnConfig {
   key: InfoColumn;
   /** Rótulo curto no cabeçalho / chip de seleção. */
   label: string;
   /** Texto completo usado no tooltip da célula. */
   tooltipLabel: string;
   /** Coluna disponível apenas quando a função selecionada é Piloto. */
   pilotOnly?: boolean;
}

export interface SeboStats {
   media: string;
   mediaRaw: number;
   max: string;
   min: string;
}
