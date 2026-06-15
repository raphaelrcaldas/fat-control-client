import { Select, TextInput } from "flowbite-react";
import SectionTitle from "./SectionTitle";
import Field from "./Field";

const NIVEL_OPTIONS = ["", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

interface LangFieldGroupProps {
   title: string;
   levelName: string;
   levelValue: string;
   validadeName: string;
   validadeValue: string;
   onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
}

export default function LangFieldGroup({
   title,
   levelName,
   levelValue,
   validadeName,
   validadeValue,
   onChange,
}: LangFieldGroupProps) {
   return (
      <div className="rounded border border-slate-200 bg-gray-50 p-4 shadow-sm">
         <SectionTitle>{title}</SectionTitle>
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id={levelName} label="Nível">
               <Select
                  id={levelName}
                  name={levelName}
                  value={levelValue}
                  onChange={onChange}
                  sizing="sm"
               >
                  {NIVEL_OPTIONS.map((opt) => (
                     <option key={opt} value={opt}>
                        {opt === "" ? "—" : opt}
                     </option>
                  ))}
               </Select>
            </Field>
            <Field id={validadeName} label="Validade">
               <TextInput
                  id={validadeName}
                  name={validadeName}
                  type="date"
                  value={validadeValue}
                  onChange={onChange}
                  sizing="sm"
               />
            </Field>
         </div>
      </div>
   );
}
