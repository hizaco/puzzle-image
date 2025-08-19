export async function createHintsCheckout(userId: string, quantity = 1) {
  const res = await fetch(`${process.env.API_BASE_URL}/api/payments/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, quantity }),
  });
  if (!res.ok) throw new Error('Checkout failed');
  const { url } = await res.json();
  return url as string;
}
