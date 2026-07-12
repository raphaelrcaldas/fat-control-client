import fs from "node:fs";
import path from "node:path";

/** Dado cru, para o agente cruzar numeros sem depender da formatacao. */
export function createJsonReporter() {
   return {
      emit({ report, outDir }) {
         fs.writeFileSync(
            path.join(outDir, "report.json"),
            JSON.stringify(report, null, 2),
            "utf8"
         );
      },
   };
}
