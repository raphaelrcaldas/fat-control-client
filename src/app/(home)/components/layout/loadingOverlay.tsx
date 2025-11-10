import { Spinner } from "flowbite-react";

interface LoadingOverlayProps {
   message?: string;
}

export default function LoadingOverlay({ message = "Saindo..." }: LoadingOverlayProps) {
   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
         <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-2xl">
            <Spinner size="xl" color="failure" />
            <p className="text-gray-700 font-medium text-lg">{message}</p>
         </div>
      </div>
   );
}
