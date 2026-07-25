export type SortField = "militar" | "cemal" | "tovn" | "imae";
export type SortDirection = "asc" | "desc";
export type TripFilter = "all" | "trip" | "naoTrip";
// Os cinco do meio são os próprios `DateStatus` — o filtro seleciona pelo
// farol da linha (`getWorstStatus`). `sem_ata` é outro eixo: documento
// anexado, não validade de data.
export type StatusFilter =
   "all" | "expired" | "critical" | "warning" | "valid" | "empty" | "sem_ata";
