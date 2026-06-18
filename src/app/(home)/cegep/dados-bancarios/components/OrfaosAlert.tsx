import { Alert, Button } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";

interface OrfaosAlertProps {
   count: number;
   onReview: () => void;
}

export function OrfaosAlert({ count, onReview }: OrfaosAlertProps) {
   if (count <= 0) return null;

   return (
      <Alert color="warning" icon={HiExclamation} withBorderAccent>
         <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
               Existem <strong>{count}</strong> registro(s) de dados bancários
               de militares desativados que podem ser limpos.
            </span>
            <Button color="yellow" size="xs" onClick={onReview}>
               Revisar e limpar
            </Button>
         </div>
      </Alert>
   );
}
