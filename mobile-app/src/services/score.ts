import { getFirestore, doc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';

const db = getFirestore();

export function computeScore(params: {
  seconds: number;
  wastedMoves: number;
  difficulty: number; // 1=facile, 2=moyen, 3=difficile
  hintsUsed: number;
}) {
  const base = 1000;
  const penaltyTime = params.seconds * (params.difficulty * 1.2);
  const penaltyMoves = params.wastedMoves * 2;
  const penaltyHints = params.hintsUsed * 50;
  const bonus = params.difficulty * 100;
  return Math.max(0, Math.round(base - penaltyTime - penaltyMoves - penaltyHints + bonus));
}

export async function saveScore(userId: string, value: number, meta: Record<string, any> = {}) {
  await addDoc(collection(db, 'scores'), {
    userId,
    value,
    meta,
    createdAt: Date.now(),
  });
  await updateDoc(doc(db, 'users', userId), { totalScore: increment(value) });
}
