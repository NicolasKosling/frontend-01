// app/(dashboard)/diary/page.tsx
"use client";

import { useState, useEffect } from "react";
import DiaryForm, { StageDayEntry as RawEntry, StageDayData } from "@/components/diary-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export interface StageDayEntry {
  _id: string;
  datum: Date;
  beschrijving: string;
  afbeelding?: string;
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<StageDayEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/stagedays", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data: RawEntry[]) => {
        const parsed = data.map((e) => ({ ...e, datum: new Date(e.datum) }));
        setEntries(parsed.sort((a, b) => b.datum.getTime() - a.datum.getTime()));
      })
      .catch(console.error);
  }, []);

  const handleNewEntry = (e: RawEntry) => {
    const entry: StageDayEntry = { ...e, datum: new Date(e.datum) };
    setEntries((prev) =>
      [entry, ...prev]
        .slice()
        .sort((a, b) => b.datum.getTime() - a.datum.getTime())
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze dag wilt verwijderen?")) return;
    const res = await fetch(`http://localhost:5000/api/stagedays/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } else {
      console.error("Delete failed", await res.text());
    }
  };

  // 1) PUT to update
  const handleUpdate = async (id: string, data: StageDayData) => {
    const res = await fetch(`http://localhost:5000/api/stagedays/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated: RawEntry = await res.json();
      const updatedEntry: StageDayEntry = {
        ...updated,
        datum: new Date(updated.datum),
      };
      setEntries((prev) =>
        prev
          .map((e) => (e._id === id ? updatedEntry : e))
          .sort((a, b) => b.datum.getTime() - a.datum.getTime())
      );
      setEditingId(null);
    } else {
      console.error("Update failed", await res.text());
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-semibold">Stage Dagboek</h1>
      <DiaryForm onSuccess={handleNewEntry} />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Vorige Dagen</h2>
        <ul className="space-y-4">
          {entries.map((e) =>
            editingId === e._id ? (
              // 2) Inline edit form
              <li key={e._id} className="p-4 border rounded-lg">
                <EditForm
                  entry={e}
                  onCancel={() => setEditingId(null)}
                  onSave={(data) => handleUpdate(e._id, data)}
                />
              </li>
            ) : (
              <li key={e._id} className="p-4 border rounded-lg space-y-2">
                <time className="block text-sm text-muted-foreground">
                  {e.datum.toLocaleDateString()}
                </time>
                <p>{e.beschrijving}</p>
                {e.afbeelding && (
                  <img
                    src={e.afbeelding}
                    alt="Dag afbeelding"
                    className="max-h-48 rounded"
                  />
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(e._id)}
                  >
                    Bewerken
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(e._id)}
                  >
                    Verwijder
                  </Button>
                </div>
              </li>
            )
          )}
        </ul>
      </section>
    </div>
  );
}

// 3) Inline edit form component
function EditForm({
  entry,
  onCancel,
  onSave,
}: {
  entry: StageDayEntry;
  onCancel: () => void;
  onSave: (data: StageDayData) => void;
}) {
  const { datum, beschrijving, afbeelding } = entry;
  const [formData, setFormData] = useState<StageDayData>({
    datum,
    beschrijving,
    afbeelding: afbeelding || "",
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(ev) => {
        ev.preventDefault();
        onSave(formData);
      }}
    >
      <label className="block">
        Datum
        <input
          type="date"
          value={format(formData.datum, "yyyy-MM-dd")}
          onChange={(e) =>
            setFormData((f) => ({ ...f, datum: new Date(e.target.value) }))
          }
          className="mt-1 block w-full border p-1"
        />
      </label>
      <label className="block">
        Beschrijving
        <textarea
          value={formData.beschrijving}
          onChange={(e) =>
            setFormData((f) => ({ ...f, beschrijving: e.target.value }))
          }
          className="mt-1 block w-full border p-1"
        />
      </label>
      <label className="block">
        Afbeelding (URL)
        <input
          type="text"
          value={formData.afbeelding}
          onChange={(e) =>
            setFormData((f) => ({ ...f, afbeelding: e.target.value }))
          }
          className="mt-1 block w-full border p-1"
        />
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Opslaan
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Annuleren
        </Button>
      </div>
    </form>
  );
}
