// Brasões estáticos por sigla de organização.
//
// Os brasões deixaram de vir do bucket (URL pública do storage) e passaram a
// ser servidos como assets estáticos do próprio frontend (client/public).
// Conteúdo institucional que muda raramente — evita dependência de storage,
// endpoint e cache de URL. Para adicionar/trocar um brasão: coloque os dois
// arquivos em `public/brasoes/<sigla>.{jpg,png}` e registre a sigla aqui.
//
// São DOIS arquivos porque os dois consumidores pedem coisas diferentes:
//
// - `png`: o escudo recortado, com fundo transparente. É o que a UI mostra. O
//   JPEG original vem do escaneado com o papel branco em volta (cantos
//   superiores, faixa sob a ponta do escudo e uma sombra cinza), que aparece
//   como um retângulo claro em qualquer superfície que não seja branca — e
//   gritaria no tema escuro.
// - `jpg`: o mesmo brasão em JPEG 150x200 (proporção 3:4), formato exigido pela
//   moldura do template da OM (`om.docx` substitui `word/media/image1.jpeg`
//   pelos bytes deste arquivo). PNG ali quebraria o documento.
const BRASOES: Record<string, { ui: string; docx: string }> = {
   "11gt": { ui: "/brasoes/11gt.png", docx: "/brasoes/11gt.jpg" },
   "12gt": { ui: "/brasoes/12gt.png", docx: "/brasoes/12gt.jpg" },
};

/** Caminho do brasão da org para exibição na UI, ou null quando não há brasão. */
export function brasaoUrl(sigla: string | null | undefined): string | null {
   if (!sigla) return null;
   return BRASOES[sigla]?.ui ?? null;
}

/** Caminho do brasão em JPEG 150x200, formato que o `om.docx` exige. */
export function brasaoDocxUrl(sigla: string | null | undefined): string | null {
   if (!sigla) return null;
   return BRASOES[sigla]?.docx ?? null;
}
