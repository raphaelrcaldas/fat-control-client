import { Badge } from "flowbite-react";
import unidades_bagl from "../../../../public/infoFAB/infoOMs";

export function ActiveBadge(active) {
   return (
      <Badge className="justify-center" color={active ? "success" : "failure"}>
         {active ? "ATIVO" : "INATIVO"}
      </Badge>
   );
}

export function FuncBadge({ funcao }) {
   let color;
   switch (funcao) {
      case "pil":
         color = "info";
         break;

      case "mc":
         color = "success";
         break;

      case "lm":
         color = "dark";
         break;

      case "tf":
         color = "indigo";
         break;

      case "os":
         color = "warning";
         break;

      case "oe":
         color = "failure";
         break;
   }

   return (
      <Badge
         color={color}
         className="m-1 w-14 justify-center p-1 text-nowrap uppercase"
      >
         {funcao}
      </Badge>
   );
}

export function OperBadge({ oper }) {
   let color;
   switch (oper) {
      case "al":
         color = "success";
         break;

      case "op":
         color = "warning";
         break;

      case "pb":
         color = "warning";
         break;

      case "po":
         color = "warning";
         break;

      case "in":
         color = "info";
         break;
   }

   return (
      <Badge
         color={color}
         className="m-1 w-14 justify-center p-1 text-nowrap uppercase"
      >
         {oper}
      </Badge>
   );
}

export function BadgeUAE({ children }) {
   const color = unidades_bagl[children].color;

   return (
      <Badge className="w-fit text-nowrap" color={color} size="sm">
         {unidades_bagl[children].value}
      </Badge>
   );
}
