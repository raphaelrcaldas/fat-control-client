import { Spinner } from "flowbite-react";

interface LoadingOverlayProps {
   message?: string;
}

export default function LoadingOverlay({
   message = "Saindo...",
}: LoadingOverlayProps) {
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
         <div className="flex flex-col items-center gap-4 rounded bg-white p-8 shadow-2xl">
            <Spinner size="xl" color="primary" />
            <p className="text-lg font-medium text-gray-700">{message}</p>
         </div>
      </div>
   );
}
