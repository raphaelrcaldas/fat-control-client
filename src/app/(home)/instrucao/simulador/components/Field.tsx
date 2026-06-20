import { Label } from "flowbite-react";

interface FieldProps {
   id?: string;
   label: string;
   children: React.ReactNode;
}

export default function Field({ id, label, children }: FieldProps) {
   return (
      <div className="flex flex-col gap-1">
         <Label htmlFor={id}>{label}</Label>
         {children}
      </div>
   );
}
