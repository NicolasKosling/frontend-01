// app/lib/api/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function api<RequestBody = any, ResponseBody = any>(
  path: string,
  // Omit the built-in body from RequestInit, then re-add it as any
  options: Omit<RequestInit, "body"> & { body?: RequestBody } = {}
): Promise<ResponseBody> {
  // Grab token
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Build full URL
  const url = `${BASE_URL}${path}`;

  // Merge headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Extract our custom body, and JSON-stringify
  const { body, ...rest } = options;

  const res = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return (await res.json()) as ResponseBody;
}
