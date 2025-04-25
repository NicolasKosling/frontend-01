// app/(dashboard)/page.tsx
"use client";

import Link from "next/link";
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
  _id: string;
  course: string;
  naam: string;
  beschrijving: string;
  resultaat: number | null;
  feedback: string;
  githubURL: string;
  publicatieURL: string;
  deadline: string;
  weging: number;
}

interface User {
  _id: string;
  voornaam: string;
  achternaam: string;
  email: string;
  isDocent: boolean;
  classGroupId?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DashboardHome() {
  const router = useRouter();

  // 1) User state
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // 2) Assignments state (for students)
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch logged-in user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) throw new Error("Not authenticated");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((u: User) => setUser(u))
      .catch((e) => setUserError(e.message))
      .finally(() => setUserLoading(false));
  }, [router]);

  // After we know the user, redirect or load assignments
  useEffect(() => {
    if (userLoading || userError) return;

    if (!user) return; // redirecting to login

    if (user.isDocent) {
      // teachers go to /teachers
      router.replace("/teachers");
      return;
    }

    // students fetch their assignments
    fetch(`${API_URL}/api/assignments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          throw new Error("Not authorized");
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Assignment[]) => setAssignments(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, userLoading, userError, router]);

  // Render states
  if (userLoading) return <p className="p-6">Loading user…</p>;
  if (userError) return <p className="p-6 text-red-600">Error: {userError}</p>;
  if (!user) return null; // going to login

  if (loading) return <p className="p-6">Loading assignments…</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  // Split upcoming vs completed
  const upcoming = assignments.filter((a) => a.resultaat === null);
  const completed = assignments.filter((a) => a.resultaat !== null);
  const linkClass = "text-current no-underline hover:underline";

  return (
    <main className="px-6 pb-6 space-y-8">
      {/* Page Title */}
      <nav className="w-full">
        <div className="flex justify-center pt-2">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
        </div>
      </nav>

      {/* Upcoming Assignments */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Upcoming Assignments</h2>
        <Table>
          <TableCaption>Not yet submitted</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Naam</TableHead>
              <TableHead>Beschrijving</TableHead>
              <TableHead className="text-right">Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {upcoming.map((a) => (
              <TableRow key={a._id}>
                <TableCell>{a.course}</TableCell>
                <TableCell>
                  <Link href={`/detail?id=${a._id}`} className={linkClass}>
                    {a.naam}
                  </Link>
                </TableCell>
                <TableCell>{a.beschrijving}</TableCell>
                <TableCell className="text-right">
                  {new Date(a.deadline).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* Completed Assignments */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Submitted / Completed</h2>
        <Table>
          <TableCaption>Graded and pending grades</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Naam</TableHead>
              <TableHead>Beschrijving</TableHead>
              <TableHead className="text-right">Resultaat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completed.map((a) => (
              <TableRow key={a._id}>
                <TableCell>{a.course}</TableCell>
                <TableCell>
                  <Link href={`/detail?id=${a._id}`} className={linkClass}>
                    {a.naam}
                  </Link>
                </TableCell>
                <TableCell>{a.beschrijving}</TableCell>
                <TableCell className="text-right">
                  {a.resultaat !== null ? `${a.resultaat}%` : "Pending"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </main>
  );
}
