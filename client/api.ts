export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch("/api" + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => {
    throw new Error("Cannot reach the kitchen. Try again.");
  });
  if (response.status === 401 && !path.startsWith("/users/")) {
    window.dispatchEvent(new Event("session-expired"));
  }
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}
