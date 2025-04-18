// app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

interface Assignment {
  id: string;
  naam: string;
  beschrijving: string;
  resultaat: number | null;
  feedback: string;
  githubURL: string;
  publicatieURL: string;
  deadline: string;
  weging: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // not logged in → redirect
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  // 2. Once authorized, fetch data
  useEffect(() => {
    if (!authorized) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/assignments`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
        const data: Assignment[] = await res.json();
        setAssignments(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [authorized]);

  // 3. Render loading / error states
  if (authorized === null || loading) {
    return <p className="p-6">Loading…</p>;
  }
  if (error) {
    return <p className="p-6 text-red-600">Error: {error}</p>;
  }

  // 4. Finally, render the table
  return (
    <main className="p-6">
      <Table>
        <TableCaption>A list of your recent assignments.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Naam</TableHead>
            <TableHead>Beschrijving</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Resultaat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((a) => (
            <TableRow key={a.id}>
              <TableCell>{a.naam}</TableCell>
              <TableCell>{a.beschrijving}</TableCell>
              <TableCell>
                {a.resultaat !== null ? "Completed" : "Pending"}
              </TableCell>
              <TableCell className="text-right">
                {a.resultaat !== null ? `${a.resultaat}%` : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
