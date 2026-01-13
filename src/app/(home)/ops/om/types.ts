// Tipos específicos de UI para filtros e paginação
// Demais tipos devem ser importados diretamente de services/routes/om/ordens

export interface FiltrosOrdem {
   busca: string;
   status: string[];
   dataInicio: string;
   dataFim: string;
   etiquetas_ids: number[];
}

export interface PaginationState {
   page: number;
   perPage: number;
   total: number;
   pages: number;
}
