interface SectionWrapperProps {
   title: string;
   children: React.ReactNode;
}

export function SectionWrapper({ title, children }: SectionWrapperProps) {
   return (
      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
         <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
            <div className="h-4 w-1 rounded-full bg-blue-500"></div>
            {title}
         </h3>
         {children}
      </div>
   );
}
