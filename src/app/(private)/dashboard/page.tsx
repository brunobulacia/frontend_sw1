import LogoutButton from "@/components/auth/LogoutButton";

export default function Page() {
  return (
    <main className="p-6 flex justify-center items-center flex-col">
      <h1 className="text-xl font-semibold mb-4">Dashboard Protegido</h1>
      <LogoutButton />
    </main>
  );
}
