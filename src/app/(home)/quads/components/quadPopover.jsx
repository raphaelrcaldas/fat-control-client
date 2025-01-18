
import { Button, Popover } from "flowbite-react";
import { isoDateToString } from "../../../../../utils/dateHandler";

export function QuadPopover({ quad }) {
  let dateStr;
  let color;
  if (quad.value == null) {
    dateStr = 'LASTRO'
    color = 'bg-gray-500 enabled:hover:bg-gray-600'
  } else {
    dateStr = isoDateToString(quad.value)
    color = 'bg-blue-700 enabled:hover:bg-blue-800'
  }


  return (
    <Popover
      aria-labelledby="default-popover"
      content={
        <div className="text-sm text-gray-500">
          <div className="border-b border-gray-200 bg-gray-100 px-3 py-2">
            <h3 id="default-popover" className="font-semibold text-gray-900 text-center">{dateStr}</h3>
          </div>
          <div className="px-3 py-2">
            <p>{quad.description}</p>
          </div>
        </div>
      }
    >
      <Button pill className={`w-20 p-0 ${color}`}>{dateStr}</Button>
    </Popover>
  );
}
