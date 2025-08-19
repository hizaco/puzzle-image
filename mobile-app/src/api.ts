const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type CreatePuzzleResponse = {
  puzzle_id: string;
  difficulty: number;
  tiles: string[];
  share_url: string;
};

export async function moderate(file: File | Blob): Promise<{ allowed: boolean; reasons: string[] }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE_URL}/api/moderate`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Moderation failed");
  return res.json();
}

export async function createPuzzle(file: File | Blob, difficulty: number): Promise<CreatePuzzleResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("difficulty", String(difficulty));
  const res = await fetch(`${API_BASE_URL}/api/puzzle`, { method: "POST", body: form });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt);
  }
  return res.json();
}

export async function getPuzzle(puzzleId: string): Promise<CreatePuzzleResponse> {
  const res = await fetch(`${API_BASE_URL}/api/puzzle/${puzzleId}`);
  if (!res.ok) throw new Error("Puzzle not found");
  return res.json();
}
