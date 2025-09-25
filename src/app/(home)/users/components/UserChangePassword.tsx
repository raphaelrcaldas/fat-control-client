import { useState } from "react";
import { changePassword } from "services/routes/users";
import { useToast } from "src/context/toast";

export default function UserChangePassword({ userId }: { userId: number }) {
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const { push } = useToast();

   async function handleChange(e: React.FormEvent) {
      e.preventDefault();
      if (!password || password.length < 6) {
         push({
            message: "A senha deve ter pelo menos 6 caracteres",
            type: "error",
         });
         return;
      }
      setLoading(true);
      try {
         await changePassword(JSON.stringify({ user_id: userId, password }));
         push({ message: "Senha alterada com sucesso!", type: "success" });
         setPassword("");
      } catch (err: any) {
         push({
            message: err?.message || "Erro ao alterar senha",
            type: "error",
         });
      } finally {
         setLoading(false);
      }
   }

   return (
      <form onSubmit={handleChange} className='max-w-xs mx-auto space-y-4'>
         <label className='block text-sm font-medium text-gray-700'>
            Nova senha
         </label>
         <input
            type='password'
            className='w-full border rounded p-2'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
         />
         <button
            type='submit'
            className='w-full bg-blue-600 text-white rounded p-2 mt-2 disabled:opacity-60'
            disabled={loading}
         >
            {loading ? "Salvando..." : "Alterar Senha"}
         </button>
      </form>
   );
}
