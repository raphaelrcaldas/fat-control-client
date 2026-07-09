import type {
   DiariaValorPublic,
   GrupoCidadePublic,
   GrupoPgPublic,
} from "services/routes/admin/diarias";

// Re-export types from service for convenience
export type { DiariaValorPublic, GrupoCidadePublic, GrupoPgPublic };

/**
 * Form data structure for creating/editing diarias
 */
export interface DiariaFormData {
   valor: string;
   data_inicio: string;
   data_fim: string;
   grupo_cid: number;
   grupo_pg: number;
}

/**
 * Initial/empty form data
 */
export const INITIAL_FORM_DATA: DiariaFormData = {
   valor: "",
   data_inicio: "",
   data_fim: "",
   grupo_cid: 1,
   grupo_pg: 1,
};

/**
 * Props for components that need cidade grouping
 */
export interface CidadesByGrupoMap {
   cidadesByGrupo: Map<number, GrupoCidadePublic[]>;
}

/**
 * Common action handlers for diaria items
 */
export interface DiariaActionHandlers {
   onEdit: (valor: DiariaValorPublic) => void;
   onDelete: (id: number) => void;
}
