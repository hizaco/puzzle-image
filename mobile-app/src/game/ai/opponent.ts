// IA simple: corrige la prochaine tuile incorrecte toutes les N ms.
// Elle ne “voit” que l’ordre des tuiles (array d’index) pour s’adapter à PuzzleBoard.
export type AIOptions = {
  intervalMs?: number;    // vitesse IA
  randomness?: number;    // 0..1, délai aléatoire supplémentaire
  onPlace?: (fixedIndex: number) => void; // callback quand une tuile est corrigée
};

export function runAIBot(
  setOrder: (fn: (prev: number[]) => number[]) => void,
  opts: AIOptions = {}
) {
  const interval = opts.intervalMs ?? 1200;
  let stopped = false;

  async function loop() {
    while (!stopped) {
      let solved = false;

      setOrder((prev) => {
        // Déjà résolu ?
        if (prev.every((v, i) => v === i)) {
          solved = true;
          return prev;
        }
        const next = prev.slice();
        // Trouve la première case incorrecte i et met la bonne tuile à i
        const i = next.findIndex((v, idx) => v !== idx);
        const targetIdx = next.indexOf(i);
        if (i >= 0 && targetIdx >= 0) {
          [next[i], next[targetIdx]] = [next[targetIdx], next[i]];
          opts.onPlace?.(i);
        }
        return next;
      });

      if (solved) break;

      let wait = interval;
      if (opts.randomness) {
        wait += Math.floor(Math.random() * interval * opts.randomness);
      }
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  loop();
  return () => {
    stopped = true;
  };
}
