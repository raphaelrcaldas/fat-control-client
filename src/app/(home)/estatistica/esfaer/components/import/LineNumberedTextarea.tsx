"use client";

import { useCallback, useRef } from "react";

interface LineNumberedTextareaProps {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   rows?: number;
}

/**
 * Textarea com calha de numeração de linhas sincronizada por scroll.
 * Widget genérico de responsabilidade única.
 */
export function LineNumberedTextarea({
   value,
   onChange,
   placeholder,
   rows = 8,
}: LineNumberedTextareaProps) {
   const gutterRef = useRef<HTMLDivElement>(null);
   const textareaRef = useRef<HTMLTextAreaElement>(null);

   const lineCount = Math.max(value.split("\n").length, 1);

   const syncScroll = useCallback(() => {
      if (gutterRef.current && textareaRef.current) {
         gutterRef.current.scrollTop = textareaRef.current.scrollTop;
      }
   }, []);

   return (
      <div className="flex overflow-hidden rounded border border-slate-200">
         <div
            ref={gutterRef}
            className="overflow-hidden bg-gray-100 pt-2 pb-[calc(0.5rem+20px)] text-right font-mono text-xs leading-relaxed text-gray-400 select-none"
         >
            {Array.from({ length: lineCount }, (_, i) => (
               <div key={i} className="px-2">
                  {i + 1}
               </div>
            ))}
         </div>
         <textarea
            ref={textareaRef}
            placeholder={placeholder}
            aria-label="Dados de esforço aéreo separados por TAB"
            wrap="off"
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            className="min-w-0 flex-1 resize-none border-0 py-2 font-mono text-xs leading-relaxed whitespace-pre focus:ring-0"
         />
      </div>
   );
}
