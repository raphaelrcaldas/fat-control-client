// Formata um tamanho em bytes para uma string legível (B / KB / MB).
export function formatSize(bytes: number): string {
   if (bytes === 0) return "0 B";
   const mb = bytes / (1024 * 1024);
   if (mb >= 1) return `${mb.toFixed(1)} MB`;
   const kb = bytes / 1024;
   if (kb >= 1) return `${kb.toFixed(1)} KB`;
   return `${bytes} B`;
}
