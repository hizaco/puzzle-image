// Webhook Stripe: crédite des indices après paiement
import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' });

// NOTE: Firestore admin côté serveur si tu veux écrire en dehors du client.
// Ici, on expose un webhook simple; adapte avec Firebase Admin SDK si nécessaire.
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ credential: applicationDefault() });
}
const db = getFirestore();

export const config = {
  api: { bodyParser: false }, // important pour la vérification de signature
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }
  const sig = req.headers['stripe-signature'] as string;
  let buf = Buffer.from([]);
  await new Promise<void>((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => {
      buf = Buffer.concat(chunks);
      resolve();
    });
  });
  try {
    const event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const quantity = Number(session.metadata?.quantity || '1');
      if (userId) {
        // Exemple: +3 indices par unité achetée
        await db.collection('users').doc(userId).set(
          { hints: (await db.collection('users').doc(userId).get()).data()?.hints ?? 0 },
          { merge: true }
        );
        await db.collection('users').doc(userId).update({ hints: FirebaseFirestore.FieldValue.increment(quantity * 3) });
      }
    }
    res.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook error', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
