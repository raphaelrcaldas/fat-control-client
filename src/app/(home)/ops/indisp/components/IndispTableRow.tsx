import clsx from "clsx";
import { CrewIndispList } from "services/routes/indisps";
import { datasIguais } from "utils/dateHandler";
import { getColumnVisibilityClass } from "../utils/columnVisibility";
import { IndispCell } from "./IndispCell";
import { TripIndisp } from "./TripIndisp";

interface IndispTableRowProps {
   dates: Date[];
   tripData: CrewIndispList;
   today: Date;
}

export function IndispTableRow({
   dates,
   tripData,
   today,
}: IndispTableRowProps) {
   return (
      <tr>
         <th scope="row" className="grid justify-items-center p-px">
            <TripIndisp trip={tripData.trip} indisps={tripData.indisps} />
         </th>
         {dates.map((day, index) => {
            const checkToday = datasIguais(day, today);

            return (
               <td
                  key={index}
                  className={clsx("px-1", getColumnVisibilityClass(index), {
                     "border-x-2 border-blue-500 bg-blue-300": checkToday,
                  })}
               >
                  <div className="flex h-full w-full items-center justify-center">
                     <IndispCell dateRef={day} tripData={tripData} />
                  </div>
               </td>
            );
         })}
      </tr>
   );
}
