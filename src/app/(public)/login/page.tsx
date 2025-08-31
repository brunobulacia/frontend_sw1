import LoginForm from '@/components/auth/LoginForm';

export default function Page() {
  return (
    <main className="p-6 flex justify-center items-center flex-col">
      <h1 className="text-xl font-semibold mb-4">Iniciar sesión</h1>
      <LoginForm />
      <p className='mt-4 flex justify-center'>No tienes cuenta? <a href="/register" className='ml-2 hover:underline'> Crear cuenta</a></p>
    </main>
  );
}
