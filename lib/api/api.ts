export async function api<RequestBody = any, ResponseBody = any>(
    path: string,
    options: RequestInit & { body?: RequestBody } = {}
  ): Promise<ResponseBody> {
    // Grab token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    const res = await fetch(path, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || res.statusText);
    }
  
    return (await res.json()) as ResponseBody;
  }