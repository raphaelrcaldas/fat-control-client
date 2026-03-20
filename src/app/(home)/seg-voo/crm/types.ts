export type DateStatus = "valid" | "warning" | "critical" | "expired" | "empty";
export type SortField = "militar" | "validade";
export type SortDirection = "asc" | "desc";
export type StatusFilter =
   | "all"
   | "expired"
   | "critical"
   | "warning"
   | "valid";
