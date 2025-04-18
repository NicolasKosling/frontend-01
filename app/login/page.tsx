// app/login/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    // Provide full path to debug; you can revert to env var once it's working
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || `HTTP ${res.status} – ${res.statusText}`);
    }

    const { token } = await res.json();
    localStorage.setItem("token", token);
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}
