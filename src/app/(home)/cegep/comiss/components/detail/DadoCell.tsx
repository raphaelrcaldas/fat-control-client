/**
 * Célula de dado rotulado das seções do detalhe (documento, classificação).
 *
 * Existia duplicada byte a byte como `DocCell` e `StatusCell`, em arquivos
 * diferentes — o primeiro ajuste de padding em um deixaria as duas seções com
 * alturas distintas na mesma tela.
 *
 * O valor vem antes do rótulo porque é ele que se procura: o rótulo só diz
 * qual campo é, e a leitura de cima para baixo encontra o dado primeiro.
 */
export function DadoCell({ valor, label }: { valor: string; label: string }) {
   return (
      <div className="rounded bg-slate-50 px-3 py-2 text-center">
         <span
            className="block truncate text-base font-semibold text-gray-900 uppercase"
            title={valor}
         >
            {valor}
         </span>
         <span className="text-xs tracking-wide text-gray-500 uppercase">
            {label}
         </span>
      </div>
   );
}
