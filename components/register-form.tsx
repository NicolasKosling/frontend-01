"use client";

import React, { use, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DivProps = Omit<React.ComponentProps<"div">, "onSubmit">;

interface RegisterFormProps {
  onSubmit: (
    voornaam: string,
    achternaam: string,
    email: string,
    telefoonnummer: string,
    password: string
  ) => Promise<void>;
}

export function RegisterForm({
  className,
  onSubmit,
  ...props
}: DivProps & RegisterFormProps) {
  const [voornaam, setVoornaam] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoonnummer, setTelefoonnummer] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // simple client‐side password match check
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(voornaam, achternaam, email, telefoonnummer, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="voornaam">First Name</Label>
              <Input
                id="voornaam"
                type="text"
                required
                value={voornaam}
                onChange={(e) => setVoornaam(e.target.value)}
              />
              <label htmlFor="achternaam">Last Name</label>
              <Input
                id="achternaam"
                type="text"
                required
                value={achternaam}
                onChange={(e) => setAchternaam(e.target.value)}
              />
              <label htmlFor="telefoonnummer">Phone Number (optional)</label>
              <Input
                id="telefoonnummer"
                type="tel"
                value={telefoonnummer}
                onChange={(e) => setTelefoonnummer(e.target.value)}
              />
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering…" : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
