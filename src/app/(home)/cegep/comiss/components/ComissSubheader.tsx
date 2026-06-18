interface ComissSubheaderProps {
   /** Contexto à esquerda (texto/título curto da aba ativa). */
   children: React.ReactNode;
   /** Ações à direita (botões/seletores da aba ativa). */
   actions?: React.ReactNode;
}

/**
 * Faixa de ações logo abaixo das abas. Moldura sóbria padronizada entre as
 * abas (Registros / Gestão Fiscal): contexto à esquerda, ações à direita.
 * Cada aba continua dona do seu estado — só injeta o conteúdo aqui.
 */
export function ComissSubheader({ children, actions }: ComissSubheaderProps) {
   return (
      <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
         <div className="min-w-0">{children}</div>
         {actions && (
            <div className="flex items-center gap-2 sm:shrink-0">{actions}</div>
         )}
      </div>
   );
}
