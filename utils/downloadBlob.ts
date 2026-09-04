/**
 * Dispara o download de um Blob e revoga a URL após o download iniciar.
 * Revogar imediatamente após `a.click()` pode cancelar o download em alguns
 * navegadores, então a revogação é adiada.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
   const blobUrl = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = blobUrl;
   a.download = fileName;
   a.click();
   setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
}
