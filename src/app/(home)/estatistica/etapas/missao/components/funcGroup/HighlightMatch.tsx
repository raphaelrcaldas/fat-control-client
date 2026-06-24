// Destaca o trecho do texto que casa com o termo buscado
export function HighlightMatch({ text, term }: { text: string; term: string }) {
   const trimmed = term.trim();
   if (!trimmed) return <>{text}</>;

   const idx = text.toLowerCase().indexOf(trimmed.toLowerCase());
   if (idx === -1) return <>{text}</>;

   return (
      <>
         {text.slice(0, idx)}
         <span className="font-bold text-gray-900">
            {text.slice(idx, idx + trimmed.length)}
         </span>
         {text.slice(idx + trimmed.length)}
      </>
   );
}
