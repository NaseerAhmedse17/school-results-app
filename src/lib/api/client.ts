/** Parse JSON from a fetch Response (client or server). */
export async function readJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}
