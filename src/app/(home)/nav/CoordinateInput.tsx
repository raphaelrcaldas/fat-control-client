"use client";
import { useState, useEffect } from "react";
import { Label, TextInput, Select } from "flowbite-react";

interface CoordinateInputProps {
   id: string;
   label: string;
   type: "latitude" | "longitude";
   value: number;
   onChange: (value: number) => void;
   required?: boolean;
}

type FormatType = "DD" | "DMS" | "DMM";

export default function CoordinateInput({
   id,
   label,
   type,
   value,
   onChange,
   required = false,
}: CoordinateInputProps) {
   const [format, setFormat] = useState<FormatType>("DMS");

   // Estado para DD (Decimal Degrees)
   const [decimal, setDecimal] = useState<string>("");

   // Estado para DMS (Degrees Minutes Seconds)
   const [degrees, setDegrees] = useState<string>("");
   const [minutes, setMinutes] = useState<string>("");
   const [seconds, setSeconds] = useState<string>("");
   const [direction, setDirection] = useState<string>(
      type === "latitude" ? "S" : "W"
   );

   // Estado para DMM (Degrees Decimal Minutes)
   const [dmmDegrees, setDmmDegrees] = useState<string>("");
   const [dmmMinutes, setDmmMinutes] = useState<string>("");
   const [dmmDirection, setDmmDirection] = useState<string>(
      type === "latitude" ? "S" : "W"
   );

   // Inicializa os valores quando o componente monta ou value muda
   useEffect(() => {
      if (value !== 0) {
         updateFieldsFromDecimal(value);
      }
   }, [value]);

   const updateFieldsFromDecimal = (decimalValue: number) => {
      // Atualiza DD
      setDecimal(decimalValue.toFixed(6));

      // Converte para DMS
      const absolute = Math.abs(decimalValue);
      const deg = Math.floor(absolute);
      const minutesDecimal = (absolute - deg) * 60;
      const min = Math.floor(minutesDecimal);
      const sec = ((minutesDecimal - min) * 60).toFixed(2);

      setDegrees(deg.toString());
      setMinutes(min.toString());
      setSeconds(sec);

      // DMM
      setDmmDegrees(deg.toString());
      setDmmMinutes(minutesDecimal.toFixed(4));

      // Direção
      const dir =
         type === "latitude"
            ? decimalValue >= 0
               ? "N"
               : "S"
            : decimalValue >= 0
              ? "E"
              : "W";
      setDirection(dir);
      setDmmDirection(dir);
   };

   // Conversão DD para decimal
   const handleDecimalChange = (val: string) => {
      setDecimal(val);
      const num = parseFloat(val);
      if (!isNaN(num)) {
         onChange(num);
         updateFieldsFromDecimal(num);
      }
   };

   // Conversão DMS para decimal
   const handleDMSChange = (newDirection?: string) => {
      const deg = parseInt(degrees) || 0;
      const min = parseInt(minutes) || 0;
      const sec = parseFloat(seconds) || 0;
      const dir = newDirection !== undefined ? newDirection : direction;

      if (min >= 60 || sec >= 60) return;

      let decimalValue = Math.abs(deg) + min / 60 + sec / 3600;

      if (dir === "S" || dir === "W") {
         decimalValue = -decimalValue;
      }

      onChange(decimalValue);
      setDecimal(decimalValue.toFixed(6));
      setDmmDegrees(Math.abs(deg).toString());
      setDmmMinutes((min + sec / 60).toFixed(4));
      setDmmDirection(dir);
   };

   // Conversão DMM para decimal
   const handleDMMChange = (newDirection?: string) => {
      const deg = parseInt(dmmDegrees) || 0;
      const min = parseFloat(dmmMinutes) || 0;
      const dir = newDirection !== undefined ? newDirection : dmmDirection;

      if (min >= 60) return;

      let decimalValue = Math.abs(deg) + min / 60;

      if (dir === "S" || dir === "W") {
         decimalValue = -decimalValue;
      }

      onChange(decimalValue);
      setDecimal(decimalValue.toFixed(6));

      // Atualiza DMS também
      const minFloor = Math.floor(min);
      const sec = ((min - minFloor) * 60).toFixed(2);
      setDegrees(Math.abs(deg).toString());
      setMinutes(minFloor.toString());
      setSeconds(sec);
      setDirection(dir);
   };

   const directionOptions =
      type === "latitude"
         ? [
              { value: "N", label: "Norte (N)" },
              { value: "S", label: "Sul (S)" },
           ]
         : [
              { value: "E", label: "Leste (E)" },
              { value: "W", label: "Oeste (W)" },
           ];

   return (
      <div className="space-y-2">
         <div className="flex items-center justify-between">
            <Label>
               {label}
               {required && " *"}
            </Label>
            <div className="flex gap-1 text-xs">
               <button
                  type="button"
                  onClick={() => setFormat("DD")}
                  className={`rounded px-2 py-1 ${
                     format === "DD"
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
               >
                  DD
               </button>
               <button
                  type="button"
                  onClick={() => setFormat("DMS")}
                  className={`rounded px-2 py-1 ${
                     format === "DMS"
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
               >
                  DMS
               </button>
               <button
                  type="button"
                  onClick={() => setFormat("DMM")}
                  className={`rounded px-2 py-1 ${
                     format === "DMM"
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
               >
                  DMM
               </button>
            </div>
         </div>

         {/* Formato DD (Decimal Degrees) */}
         {format === "DD" && (
            <TextInput
               id={id}
               type="text"
               value={decimal}
               onChange={(e) => handleDecimalChange(e.target.value)}
               placeholder={type === "latitude" ? "-15.869722" : "-47.920556"}
               required={required}
               autoComplete="off"
            />
         )}

         {/* Formato DMS (Degrees Minutes Seconds) */}
         {format === "DMS" && (
            <div className="space-y-2">
               <div className="grid grid-cols-4 gap-2">
                  <div>
                     <TextInput
                        type="number"
                        value={degrees}
                        onChange={(e) => {
                           setDegrees(e.target.value);
                        }}
                        onBlur={() => handleDMSChange()}
                        placeholder="15"
                        min="0"
                        max={type === "latitude" ? "90" : "180"}
                        required={required}
                        sizing="sm"
                        addon="°"
                     />
                  </div>
                  <div>
                     <TextInput
                        type="number"
                        value={minutes}
                        onChange={(e) => {
                           setMinutes(e.target.value);
                        }}
                        onBlur={() => handleDMSChange()}
                        placeholder="52"
                        min="0"
                        max="59"
                        required={required}
                        sizing="sm"
                        addon="'"
                     />
                  </div>
                  <div>
                     <TextInput
                        type="number"
                        value={seconds}
                        onChange={(e) => {
                           setSeconds(e.target.value);
                        }}
                        onBlur={() => handleDMSChange()}
                        placeholder="11.00"
                        min="0"
                        max="59.99"
                        step="0.01"
                        required={required}
                        sizing="sm"
                        addon='"'
                     />
                  </div>
                  <div>
                     <Select
                        value={direction}
                        onChange={(e) => {
                           setDirection(e.target.value);
                           handleDMSChange(e.target.value);
                        }}
                        required={required}
                        sizing="sm"
                     >
                        {directionOptions.map((opt) => (
                           <option key={opt.value} value={opt.value}>
                              {opt.label}
                           </option>
                        ))}
                     </Select>
                  </div>
               </div>
               <p className="text-xs text-gray-500">
                  Decimal: {decimal || "0.000000"}
               </p>
            </div>
         )}

         {/* Formato DMM (Degrees Decimal Minutes) */}
         {format === "DMM" && (
            <div className="space-y-2">
               <div className="grid grid-cols-3 gap-2">
                  <div>
                     <TextInput
                        type="number"
                        value={dmmDegrees}
                        onChange={(e) => {
                           setDmmDegrees(e.target.value);
                        }}
                        onBlur={() => handleDMMChange()}
                        placeholder="15"
                        min="0"
                        max={type === "latitude" ? "90" : "180"}
                        required={required}
                        sizing="sm"
                        addon="°"
                     />
                  </div>
                  <div>
                     <TextInput
                        type="number"
                        value={dmmMinutes}
                        onChange={(e) => {
                           setDmmMinutes(e.target.value);
                        }}
                        onBlur={() => handleDMMChange()}
                        placeholder="52.1833"
                        min="0"
                        max="59.9999"
                        step="0.0001"
                        required={required}
                        sizing="sm"
                        addon="'"
                     />
                  </div>
                  <div>
                     <Select
                        value={dmmDirection}
                        onChange={(e) => {
                           setDmmDirection(e.target.value);
                           handleDMMChange(e.target.value);
                        }}
                        required={required}
                        sizing="sm"
                     >
                        {directionOptions.map((opt) => (
                           <option key={opt.value} value={opt.value}>
                              {opt.label}
                           </option>
                        ))}
                     </Select>
                  </div>
               </div>
               <p className="text-xs text-gray-500">
                  Decimal: {decimal || "0.000000"}
               </p>
            </div>
         )}
      </div>
   );
}
