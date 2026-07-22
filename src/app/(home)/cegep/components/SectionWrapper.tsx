interface SectionWrapperProps {
   title: string;
   /** Ação discreta no canto superior direito (ex: link "+ Adicionar"). */
   action?: React.ReactNode;
   children: React.ReactNode;
}

export function SectionWrapper({
   title,
   action,
   children,
}: SectionWrapperProps) {
   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
               <div className="bg-primary-600 h-4 w-1 rounded-full"></div>
               {title}
            </h3>
            {action}
         </div>
         {children}
      </div>
   );
}
