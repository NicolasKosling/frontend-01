// app/(dashboard)/teachers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Student {
  _id: string;
  voornaam: string;
  achternaam: string;
  email: string;
  isDocent?: boolean; // include role flag when fetching all users
}

interface Subject {
  _id: string;
  name: string;
}

interface ClassGroup {
  _id: string;
  naam: string;
  opleiding: string;
}

interface Course {
  _id: string;
  name: string;
  subjects: Subject[];
  students: Student[];
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const courseSchema = z.object({
  name: z.string().min(2, "Vul een cursusnaam in"),
});
type NewCourseInput = z.infer<typeof courseSchema>;

const subjectSchema = z.object({
  name: z.string().min(2, "Vul een vaknaam in"),
});
type NewSubjectInput = z.infer<typeof subjectSchema>;

const cohortSchema = z.object({
  naam: z.string().min(2, "Vul een cohortnaam in"),
  opleiding: z.string().min(2, "Vul opleiding in"),
});
type NewCohortInput = z.infer<typeof cohortSchema>;

export default function TeacherDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [cohorts, setCohorts] = useState<ClassGroup[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const courseForm = useForm<NewCourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: { name: "" },
  });
  const subjectForm = useForm<NewSubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: "" },
  });
  const cohortForm = useForm<NewCohortInput>({
    resolver: zodResolver(cohortSchema),
    defaultValues: { naam: "", opleiding: "" },
  });

  // Load teacher's courses
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.status === 401) throw new Error("Not authenticated");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Course[]) => {
        setCourses(data);
        if (data.length && !selectedCourse) {
          setSelectedCourse(data[0]);
        }
      })
      .catch(err => {
        console.error(err);
        if (err.message === "Not authenticated") {
          router.replace("/login");
        }
      })
      .finally(() => setLoading(false));

    // Fetch all students for Add Student dialog
    fetch(`${API}/api/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(res => res.json())
      .then((users: Student[]) => {
        setAllStudents(users.filter(u => !u.isDocent));
      })
      .catch(console.error);
  }, [router]);

  // Load cohorts when course changes
  useEffect(() => {
    if (!selectedCourse) {
      setCohorts([]);
      return;
    }
    const token = localStorage.getItem("token");
    fetch(`${API}/api/classes?courseId=${selectedCourse._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setCohorts)
      .catch(console.error);
  }, [selectedCourse]);

  // Handlers
  async function onCreateCourse(data: NewCourseInput) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: data.name }),
    });
    if (res.ok) {
      const course: Course = await res.json();
      setCourses(prev => [...prev, course]);
      setSelectedCourse(course);
      courseForm.reset();
    }
  }

  async function onCreateSubject(data: NewSubjectInput) {
    if (!selectedCourse) return;
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${API}/api/courses/${selectedCourse._id}/subjects`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: data.name }),
      }
    );
    if (res.ok) {
      const subject: Subject = await res.json();
      setSelectedCourse(c => c ? { ...c, subjects: [...c.subjects, subject] } : c);
      subjectForm.reset();
    }
  }

  async function onCreateCohort(data: NewCohortInput) {
    if (!selectedCourse) return;
    const token = localStorage.getItem("token");
    const payload = {
      naam: data.naam,
      opleiding: data.opleiding,
      courseId: selectedCourse._id,
    };
    const res = await fetch(`${API}/api/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const cg: ClassGroup = await res.json();
      setCohorts(prev => [...prev, cg]);
      cohortForm.reset();
    }
  }

  async function onAddStudent(studentId: string) {
    if (!selectedCourse) return;
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${API}/api/courses/${selectedCourse._id}/students`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId }),
      }
    );
    if (res.ok) {
      setSelectedCourse(c => c ? { ...c, students: [...c.students, allStudents.find(u=>u._id===studentId)!] } : c);
    }
  }

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <main className="px-6 py-8 space-y-8">
      <nav className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {selectedCourse ? selectedCourse.name : "Teacher Dashboard"}
        </h1>
        <div className="space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>{selectedCourse ? "New Course" : "Create Course"}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Course</DialogTitle>
                <DialogDescription>Give your course a name</DialogDescription>
              </DialogHeader>
              <Form {...courseForm}>
                <form onSubmit={courseForm.handleSubmit(onCreateCourse)} className="space-y-4">
                  <FormField control={courseForm.control} name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      {courses.length > 1 && (
        <section>
          <Table>
            <TableCaption>Select a course</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead># Subjects</TableHead>
                <TableHead># Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map(c => (
                <TableRow key={c._id} onClick={()=>setSelectedCourse(c)} className={c._id===selectedCourse?._id ? "bg-muted" : ""}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.subjects.length}</TableCell>
                  <TableCell>{c.students.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      {selectedCourse && (
        <>
          {/* Subjects & Cohorts omitted for brevity */}

          {/* Enrolled Students */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Enrolled Students</h2>
              {/* Add Students */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Student</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Student</DialogTitle>
                    <DialogDescription>Select a student to enroll</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {allStudents.map(u => (
                      <div key={u._id} className="flex justify-between items-center">
                        <span>{u.voornaam} {u.achternaam} ({u.email})</span>
                        {selectedCourse.students.some(s=>s._id===u._id)
                          ? <span>✔️</span>
                          : <Button size="sm" onClick={()=>onAddStudent(u._id)}>+</Button>
                        }
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button onClick={()=>{/* just close */}}>Done</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableCaption>Students in this course</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedCourse.students.map(s => (
                  <TableRow key={s._id}>
                    <TableCell>{s.voornaam} {s.achternaam}</TableCell>
                    <TableCell>{s.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </>
      )}
    </main>
  );
}
