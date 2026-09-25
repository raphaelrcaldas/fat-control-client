const UNIDADES = ["B", "KB", "MB", "GB", "TB"];

/**
 * Tamanho em bytes para leitura humana, em pt-BR: "512 B", "28,9 KB",
 * "1,0 GB". Base 1024, uma casa decimal a partir de KB.
 */
export function formatSize(bytes: number): string {
   if (bytes < 1024) return `${bytes} B`;
   let valor = bytes;
   let i = 0;
   // 1023,95 KB arredondaria para "1.024,0 KB": sobe de unidade antes.
   while (valor >= 1023.95 && i < UNIDADES.length - 1) {
      valor /= 1024;
      i++;
   }
   return `${valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
   })} ${UNIDADES[i]}`;
}
