// Brasões estáticos por sigla de organização.
//
// Os brasões deixaram de vir do bucket (URL pública do storage) e passaram a
// ser servidos como assets estáticos do próprio frontend (client/public).
// Conteúdo institucional que muda raramente — evita dependência de storage,
// endpoint e cache de URL. Para adicionar/trocar um brasão: coloque o arquivo
// em `public/brasoes/<sigla>.<ext>` e registre a sigla aqui.
const BRASOES: Record<string, string> = {
   "11gt": "/brasoes/11gt.jpg",
   "12gt": "/brasoes/12gt.jpg",
};

/** Caminho do brasão estático da org, ou null quando não há brasão. */
export function brasaoUrl(sigla: string | null | undefined): string | null {
   if (!sigla) return null;
   return BRASOES[sigla] ?? null;
}
