export type SafeSearchResult = {
  adult?: string;
  violence?: string;
  racy?: string;
  medical?: string;
  spoof?: string;
  safe: boolean;
  reason?: string;
};

export async function checkImageSafety(imageUrl: string) {
  const res = await fetch(`${process.env.API_BASE_URL}/api/safe-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
  if (!res.ok) throw new Error(`Safe image check failed: ${res.status}`);
  return (await res.json()) as SafeSearchResult;
}
