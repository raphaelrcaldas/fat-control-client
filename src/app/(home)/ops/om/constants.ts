// Re-export de constants/ops/ordens-missao
export {
   TIPOS_MISSAO as tiposMissao,
   type TipoMissao,
} from "@/constants/ops/ordens-missao/tipos";

export {
   STATUS_OPTIONS as statusOptions,
   STATUS_CONFIG as statusConfig,
   type StatusType,
   getStatusConfig,
} from "@/constants/ops/ordens-missao/status";

export {
   ESQUADROES as esquadroes,
   type Esquadrao,
} from "@/constants/ops/ordens-missao/esquadroes";

export {
   MATRICULAS_AERONAVES as matriculasAeronaves,
   type MatriculaAeronave,
   formatMatricula,
} from "@/constants/ops/ordens-missao/aeronaves";
