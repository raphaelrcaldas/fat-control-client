interface SpinnerProps {
   size?: "xs" | "sm" | "md" | "lg" | "xl";
   color?: "red" | "blue" | "green" | "gray" | "white";
   className?: string;
}

const sizeMap = {
   xs: "h-4 w-4 border",
   sm: "h-6 w-6 border",
   md: "h-8 w-8 border-2",
   lg: "h-10 w-10 border-2",
   xl: "h-12 w-12 border-2",
};

const colorMap = {
   red: "border-red-600",
   blue: "border-blue-600",
   green: "border-green-600",
   gray: "border-gray-600",
   white: "border-white",
};

export function Spinner({
   size = "md",
   color = "red",
   className = "",
}: SpinnerProps) {
   return (
      <div
         className={`animate-spin rounded-full ${sizeMap[size]} ${colorMap[color]} border-t-transparent ${className}`}
         role="status"
         aria-label="Carregando"
      />
   );
}
