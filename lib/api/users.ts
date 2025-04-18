const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllUsers(token: string) {
  const res = await fetch(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}
