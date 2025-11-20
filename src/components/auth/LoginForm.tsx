"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios/client";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";  

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const sp = useSearchParams();
  const { refresh } = useAuth();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await api.post("/auth/login", { email, password });
      await refresh();
      const redirectParam = sp.get("redirect");
      const destination =
        redirectParam && redirectParam !== "/" ? redirectParam : "/dashboard";
      router.replace(destination);
    } catch (err: any) {
      setError(
        err?.data?.error || err?.data?.message || "Credenciales invalidas"
      );
    }
  };

  useEffect(() => {
    const query = sp.toString();
    const urlParams = new URLSearchParams(query);
    const codeParam = urlParams.get("code");

    if (codeParam) {
      console.log("Authorization code from GitHub:", codeParam);
      
      const handleGitHubAuth = async () => {
        try {
          // 1. Intercambiar código por token de acceso
          const tokenResponse = await axios.get(`${BACKEND_URL}/api/oauth/github/getAccessToken/${codeParam}`);
          console.log("Token response:", tokenResponse.data);
          
          const accessToken = tokenResponse.data.access_token;
          if (!accessToken) {
            throw new Error("No access token received");
          }

          // 2. Autenticar en nuestro sistema usando el token de GitHub
          const authResponse = await api.post("/auth/github", { 
            accessToken: accessToken 
          });
          
          console.log("Auth response:", authResponse.data);

          // 3. Refrescar el estado de autenticación
          await refresh();

          // 4. Redirigir al dashboard
          const redirectParam = sp.get("redirect");
          const destination = redirectParam && redirectParam !== "/" ? redirectParam : "/dashboard";
          router.replace(destination);

        } catch (error) {
          console.error("Error during GitHub authentication:", error);
          setError("Error al autenticar con GitHub. Inténtalo de nuevo.");
        }
      };

      handleGitHubAuth();
    }
  }, [sp, refresh, router]);

  const handleGitHubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID_GITHUB;
    console.log("GitHub login clicked");
    console.log("Client ID:", clientId);
    router.push(
      `https://github.com/login/oauth/authorize?client_id=${clientId}`
    );  
  };

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-4 mb-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white/80"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition hover:border-white/30 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            placeholder="nombre@empresa.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-white/80"
          >
            Contraseña
          </label>
          <input
            id="password"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition hover:border-white/30 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
            {error}
          </p>
        )}

        <button
          className="w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-300"
          type="submit"
        >
          Ingresar
        </button>
      </form>
      <button
        className="w-full rounded-xl bg-gray-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-gray-400 mb-4"
        onClick={handleGitHubLogin}
      >
        Ingresar con GitHub
      </button>
    </div>
  );
}
