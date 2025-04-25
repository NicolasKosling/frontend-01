// app/(dashboard)/detail/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Assignment {
  _id: string;
  naam: string;
  beschrijving: string;
  resultaat: number | null;
  feedback: string;
  githubURL: string | null;
  publicatieURL: string | null;
  deadline: string;
  weging: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AssignmentDetailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [githubURL, setGithubURL] = useState("");
  const [publicatieURL, setPublicatieURL] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Geen opdracht geselecteerd");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${API_URL}/api/assignments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 404) throw new Error("Opdracht niet gevonden");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Assignment) => {
        setAssignment(data);
        // prefill form for submission, if you like:
        setGithubURL(data.githubURL || "");
        setPublicatieURL(data.publicatieURL || "");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!assignment) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/assignments/${assignment._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ githubURL, publicatieURL }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setAssignment(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;
  if (!assignment) return <p className="p-6">Geen opdracht geladen.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button
        className="text-sm text-blue-600"
        onClick={() => router.back()}
      >
        ← Terug
      </button>

      <h1 className="text-2xl font-semibold">{assignment.naam}</h1>
      <p>
        <strong>Beschrijving:</strong> {assignment.beschrijving}
      </p>
      <p>
        <strong>Deadline:</strong>{" "}
        {new Date(assignment.deadline).toLocaleDateString()}
      </p>

      {assignment.resultaat !== null ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Resultaat & feedback</h2>
          <p>
            <strong>Score:</strong> {assignment.resultaat}%
          </p>
          <p>
            <strong>Feedback:</strong> {assignment.feedback}
          </p>
          {assignment.githubURL && (
            <p>
              <strong>GitHub:</strong>{" "}
              <a
                href={assignment.githubURL}
                className="text-current hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Repo bekijken
              </a>
            </p>
          )}
          {assignment.publicatieURL && (
            <p>
              <strong>Publicatie:</strong>{" "}
              <a
                href={assignment.publicatieURL}
                className="text-current hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Live bekijken
              </a>
            </p>
          )}
        </section>
      ) : (
        <section>
          <h2 className="text-xl font-semibold mb-4">Opdracht indienen</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">GitHub URL</label>
              <Input
                type="url"
                value={githubURL}
                onChange={(e) => setGithubURL(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Publicatie URL</label>
              <Input
                type="url"
                value={publicatieURL}
                onChange={(e) => setPublicatieURL(e.target.value)}
                placeholder="https://publicatie.example.com/..."
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Versturen…" : "Verstuur opdracht"}
            </Button>
          </form>
        </section>
      )}
    </div>
  );
}
