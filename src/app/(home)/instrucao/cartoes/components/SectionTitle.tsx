export default function SectionTitle({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <p className="mb-3 text-[11px] font-semibold tracking-widest text-gray-600 uppercase">
         {children}
      </p>
   );
}
