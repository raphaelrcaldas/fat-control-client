import clsx from "clsx";

interface ComissSubheaderProps {
   /** Contexto à esquerda (texto/título curto da aba ativa). */
   children: React.ReactNode;
   /** Ações à direita (botões/seletores da aba ativa). */
   actions?: React.ReactNode;
   /**
    * Mantém contexto e ações na MESMA linha já no mobile, em vez de empilhar
    * abaixo de `sm`. Só para abas cujas ações são botões estreitos (ou
    * só-ícone no celular); abas com `<select>` de largura cheia continuam
    * empilhando, senão o controle fica espremido.
    */
   compact?: boolean;
}

/**
 * Faixa de ações logo abaixo das abas. Moldura sóbria padronizada entre as
 * abas (Registros / Gestão Fiscal): contexto à esquerda, ações à direita.
 * Cada aba continua dona do seu estado — só injeta o conteúdo aqui.
 */
export function ComissSubheader({
   children,
   actions,
   compact = false,
}: ComissSubheaderProps) {
   return (
      <div
         className={clsx(
            "flex gap-3 rounded border border-slate-200 bg-white px-4 py-3 shadow-sm",
            compact
               ? "items-center justify-between"
               : "flex-col sm:flex-row sm:items-center sm:justify-between"
         )}
      >
         <div className="min-w-0">{children}</div>
         {actions && (
            <div className="flex items-center gap-2 sm:shrink-0">{actions}</div>
         )}
      </div>
   );
}
