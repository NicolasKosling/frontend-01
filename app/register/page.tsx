// app/register/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/register-form";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (
    voornaam: string,
    achternaam: string,
    email: string,
    telefoonnummer: string,
    password: string
  ) => {
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voornaam,
        achternaam,
        email,
        telefoonnummer,
        password,
      }),
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
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
}
