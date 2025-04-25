// components/diary-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// 1) Schema
const stageDaySchema = z.object({
  datum: z.date({ required_error: "Kies een datum" }),
  beschrijving: z
    .string()
    .min(10, "Geef ten minste 10 tekens over wat je vandaag deed"),
  afbeelding: z.union([
    z.string().url("Ongeldige URL"),
    z.literal(""),
  ]),
});

export type StageDayData = z.infer<typeof stageDaySchema>;
export type StageDayEntry = StageDayData & { _id: string };

interface DiaryFormProps {
  onSuccess?: (entry: StageDayEntry) => void;
}

export default function DiaryForm({ onSuccess }: DiaryFormProps) {
  const form = useForm<StageDayData>({
    resolver: zodResolver(stageDaySchema),
    defaultValues: {
      datum: undefined,
      beschrijving: "",
      afbeelding: "",
    } as any,
  });

  const onSubmit = async (data: StageDayData) => {
    const res = await fetch("http://localhost:5000/api/stagedays", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created: StageDayEntry = await res.json();
      form.reset();
      onSuccess?.(created);
    } else {
      console.error("Failed to save", await res.text());
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Date picker */}
        <FormField
          control={form.control}
          name="datum"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Datum</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? format(field.value, "PPP")
                        : "Kies een datum"}
                      <CalendarIcon className="ml-auto h-4 w-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Beschrijving */}
        <FormField
          control={form.control}
          name="beschrijving"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beschrijving</FormLabel>
              <FormControl>
                <Input placeholder="Wat heb je vandaag gedaan?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Afbeelding URL */}
        <FormField
          control={form.control}
          name="afbeelding"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Afbeelding (URL, optioneel)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Dag Toevoegen</Button>
      </form>
    </Form>
  );
}
