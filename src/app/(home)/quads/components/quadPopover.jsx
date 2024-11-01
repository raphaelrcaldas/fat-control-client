
import { Button, Popover } from "flowbite-react";

export function QuadPopover({ value, info }) {
  let dateStr;
  let color;
  if (value == 0) {
    dateStr = 'LASTRO'
    color = 'bg-gray-500 enabled:hover:bg-gray-600'
  } else {
    const options = {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    }

    dateStr = new Date(value).toLocaleDateString('pt-br', options);
    color = 'bg-blue-700 enabled:hover:bg-blue-800'
  }


  return (
    // <Popover
    //   trigger="hover"
    //   aria-labelledby="default-popover"
    //   content={
    //     <div className="text-sm text-gray-500">
    //       <div className="border-b border-gray-200 bg-gray-100 px-3 py-2">
    //         <h3 id="default-popover" className="font-semibold text-gray-900 text-center">{dateStr}</h3>
    //       </div>
    //       <div className="px-3 py-2">
    //         <p>{info}</p>
    //       </div>
    //     </div>
    //   }
    // >
    // ----> BOTÃO AQUI <-----
    // </Popover>
      <Button pill className={`w-20 p-0 ${color}`}>{dateStr}</Button>
  );
}
