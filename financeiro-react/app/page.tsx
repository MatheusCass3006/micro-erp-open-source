// Rota raiz: redireciona para /dashboard
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
