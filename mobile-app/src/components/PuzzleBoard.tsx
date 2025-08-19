import React, { useMemo, useState, useRef, useEffect } from "react";
import { View, Image, StyleSheet, Dimensions, PanResponder, Animated } from "react-native";

type Props = {
  tiles: string[];   // URLs des tuiles
  grid: number;      // ex: 3 pour 3x3
  onSolved?: () => void;
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// order: à l'index i du plateau, quelle tuile (tileIndex) est affichée
export default function PuzzleBoard({ tiles, grid, onSolved }: Props) {
  const size = Math.min(Dimensions.get("window").width - 24, 480);
  const tileSize = size / grid;

  const [order, setOrder] = useState<number[]>(() => shuffle([...tiles.keys()]));
  const isSolved = useMemo(() => order.every((v, i) => v === i), [order]);

  // Déclenche une seule fois par cycle
  const hasNotifiedRef = useRef(false);
  useEffect(() => {
    if (isSolved && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      onSolved?.();
    }
    if (!isSolved) {
      hasNotifiedRef.current = false;
    }
  }, [isSolved]);

  const positionOfIndex = (i: number) => {
    const r = Math.floor(i / grid);
    const c = i % grid;
    return { left: c * tileSize, top: r * tileSize };
  };

  const indexFromPosition = (left: number, top: number) => {
    const cx = Math.min(size - 1, Math.max(0, left + tileSize / 2));
    const cy = Math.min(size - 1, Math.max(0, top + tileSize / 2));
    const col = Math.min(grid - 1, Math.max(0, Math.floor(cx / tileSize)));
    const row = Math.min(grid - 1, Math.max(0, Math.floor(cy / tileSize)));
    return row * grid + col;
  };

  const onDrop = (fromIndex: number, absoluteLeft: number, absoluteTop: number, tileIndex: number) => {
    // Snap vers la "bonne" case si proche
    const desiredIndex = tileIndex; // la tuile tileIndex est correcte quand elle est à l'index 'tileIndex'
    const desiredPos = positionOfIndex(desiredIndex);
    const dx = (absoluteLeft + tileSize / 2) - (desiredPos.left + tileSize / 2);
    const dy = (absoluteTop + tileSize / 2) - (desiredPos.top + tileSize / 2);
    const dist = Math.hypot(dx, dy);

    let toIndex = indexFromPosition(absoluteLeft, absoluteTop);
    const snapThresholdPx = tileSize * 0.4;

    if (dist <= snapThresholdPx) {
      toIndex = desiredIndex;
    }

    setOrder(prev => {
      if (toIndex === fromIndex) return prev;
      const next = prev.slice();
      const movingTile = next[fromIndex];
      next[fromIndex] = next[toIndex];
      next[toIndex] = movingTile;
      return next;
    });
  };

  return (
    <View style={[styles.board, { width: size, height: size }]}>
      {order.map((tileIndex, boardIndex) => (
        <DraggableTile
          key={`${tileIndex}-${boardIndex}-${order.join(",")}`}
          uri={tiles[tileIndex]}
          boardIndex={boardIndex}
          tileIndex={tileIndex}
          tileSize={tileSize}
          getCellPosition={positionOfIndex}
          onDrop={onDrop}
        />
      ))}
    </View>
  );
}

function DraggableTile({
  uri,
  boardIndex,
  tileIndex,
  tileSize,
  getCellPosition,
  onDrop,
}: {
  uri: string;
  boardIndex: number;
  tileIndex: number;
  tileSize: number;
  getCellPosition: (i: number) => { left: number; top: number };
  onDrop: (fromIndex: number, left: number, top: number, tileIndex: number) => void;
}) {
  const { left, top } = getCellPosition(boardIndex);
  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dragging = useRef(false);
  const zScale = useRef(new Animated.Value(0)).current;

  const resetPosition = () => {
    Animated.spring(translate, { toValue: { x: 0, y: 0 }, useNativeDriver: true, bounciness: 8 }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragging.current = true;
        Animated.spring(zScale, { toValue: 1, useNativeDriver: true }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: translate.x, dy: translate.y }], { useNativeDriver: true }),
      onPanResponderRelease: (_, gesture) => {
        dragging.current = false;
        Animated.spring(zScale, { toValue: 0, useNativeDriver: true }).start();
        const absLeft = left + gesture.dx;
        const absTop = top + gesture.dy;
        onDrop(boardIndex, absLeft, absTop, tileIndex);
        resetPosition();
      },
      onPanResponderTerminate: () => {
        dragging.current = false;
        Animated.spring(zScale, { toValue: 0, useNativeDriver: true }).start();
        resetPosition();
      },
    })
  ).current;

  const scale = zScale.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.tile,
        {
          width: tileSize,
          height: tileSize,
          left,
          top,
          transform: [{ translateX: translate.x }, { translateY: translate.y }, { scale }],
          elevation: dragging.current ? 3 : 0,
        },
      ]}
    >
      <Image source={{ uri }} style={{ width: "100%", height: "100%" }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  board: {
    position: "relative",
    backgroundColor: "#222",
    borderRadius: 8,
    overflow: "hidden",
  },
  tile: {
    position: "absolute",
    borderWidth: 0.5,
    borderColor: "#333",
    borderRadius: 2,
    backgroundColor: "#000",
  },
});
