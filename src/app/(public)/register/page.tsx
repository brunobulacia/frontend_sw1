import RegisterForm from '@/components/auth/RegisterForm';

export default function Page() {
  return (
    <main className="p-6 flex justify-center items-center flex-col">
      <h1 className="text-xl font-semibold mb-4">Crear cuenta</h1>
      <RegisterForm />
      <p className='mt-4'>Ya tienes cuenta? <a href="/login" className="ml-2 hover:underline" >Iniciar sesión</a></p>
    </main>
  );
}
