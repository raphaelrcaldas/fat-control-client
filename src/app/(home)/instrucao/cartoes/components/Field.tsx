import { Label } from "flowbite-react";

export default function Field({
   id,
   label,
   children,
}: {
   id: string;
   label: string;
   children: React.ReactNode;
}) {
   return (
      <div className="flex flex-col gap-1">
         <Label htmlFor={id}>{label}</Label>
         {children}
      </div>
   );
}
