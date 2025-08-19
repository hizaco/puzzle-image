export type Point = { x: number; y: number };
export type Piece = {
  id: string;
  pos: Point;       // position actuelle (px)
  target: Point;    // position cible (px)
  selected?: boolean;
  locked?: boolean; // déjà bien placée
};

export function distance(a: Point, b: Point) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function shouldSnap(piece: Piece, thresholdPx: number) {
  return distance(piece.pos, piece.target) <= thresholdPx;
}

export function snapToTarget(piece: Piece) {
  piece.pos = { ...piece.target };
  piece.locked = true;
  return piece;
}

export function movePiece(piece: Piece, delta: Point, bounds?: { w: number; h: number }) {
  let x = piece.pos.x + delta.x;
  let y = piece.pos.y + delta.y;
  if (bounds) {
    x = Math.max(0, Math.min(bounds.w, x));
    y = Math.max(0, Math.min(bounds.h, y));
  }
  piece.pos = { x, y };
  return piece;
}

export function keyboardMove(piece: Piece, key: 'ArrowUp'|'ArrowDown'|'ArrowLeft'|'ArrowRight', step = 5) {
  const delta = { ArrowUp: {x:0,y:-step}, ArrowDown:{x:0,y:step}, ArrowLeft:{x:-step,y:0}, ArrowRight:{x:step,y:0} }[key];
  if (delta) movePiece(piece, delta);
  return piece;
}

export function ghostPreview(piece: Piece, thresholdPx: number) {
  const d = distance(piece.pos, piece.target);
  const opacity = Math.max(0, Math.min(1, 1 - d / (thresholdPx * 3)));
  return { show: d <= thresholdPx * 3, opacity };
}
