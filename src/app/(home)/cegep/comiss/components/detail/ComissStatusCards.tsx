interface ComissStatusCardsProps {
   status: string;
   modulo: boolean;
   dep: boolean;
}

export function ComissStatusCards({
   status,
   modulo,
   dep,
}: ComissStatusCardsProps) {
   return (
      <div className="grid grid-cols-3 gap-4">
         <StatusCard
            label="Status"
            valor={status}
            borderClass="border-slate-200"
         />
         <StatusCard
            label="Modulo"
            valor={modulo ? "Sim" : "Nao"}
            borderClass="border-gray-200"
         />
         <StatusCard
            label="Dependente"
            valor={dep ? "Sim" : "Nao"}
            borderClass="border-gray-200"
         />
      </div>
   );
}

function StatusCard({
   label,
   valor,
   borderClass,
}: {
   label: string;
   valor: string;
   borderClass: string;
}) {
   return (
      <div
         className={`flex items-center justify-center gap-2 rounded border ${borderClass} bg-white p-4 shadow-sm`}
      >
         <span className="text-sm text-gray-600">{label}:</span>
         <span className="text-sm font-semibold text-gray-900 uppercase">
            {valor}
         </span>
      </div>
   );
}
