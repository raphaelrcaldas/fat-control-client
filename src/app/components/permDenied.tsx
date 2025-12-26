export default function PermDenied() {
   return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
         <h1 className="text-2xl font-bold text-gray-700">Acesso Negado</h1>
         <p className="text-base uppercase">
            Você não tem permissão para acessar esta página.
         </p>
      </div>
   );
}
