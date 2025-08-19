// Crée une session Stripe Checkout pour acheter des indices
import Stripe from 'stripe';

type Req = any;
type Res = any;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' });

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { userId, quantity = 1 } = req.body as { userId: string; quantity?: number };
    if (!userId) {
      res.status(400).json({ error: 'userId required' });
      return;
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        { price: process.env.STRIPE_PRICE_ID_HINTS as string, quantity },
      ],
      success_url: `${process.env.APP_BASE_URL}/paiement/succes`,
      cancel_url: `${process.env.APP_BASE_URL}/paiement/annule`,
      metadata: { userId, quantity: String(quantity) },
    });
    res.status(200).json({ url: session.url });
  } catch (e: any) {
    console.error('Stripe checkout error', e);
    res.status(500).json({ error: 'Checkout failed' });
  }
}
