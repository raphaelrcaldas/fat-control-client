import { LastIndispsFrame } from "./LastIndispsFrame";

const ROWS = 15;

export function LastIndispsSkeleton() {
   return (
      <LastIndispsFrame isLoading>
         {Array.from({ length: ROWS }, (_, i) => (
            <div
               key={i}
               aria-hidden
               className="col-span-5 grid animate-pulse grid-cols-subgrid items-center justify-items-center border-b border-slate-100 px-1.5 py-1.5 motion-reduce:animate-none"
            >
               <div className="h-3 w-5 rounded bg-slate-200" />
               <div className="h-7 w-8 rounded bg-slate-200" />
               <div className="h-3 w-16 rounded bg-slate-100" />
               <div className="h-3 w-16 rounded bg-slate-100" />
               <div className="h-3 w-3 rounded bg-slate-100" />
            </div>
         ))}
      </LastIndispsFrame>
   );
}
