import { useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MAP_WIDTH, MAP_HEIGHT } from "./ShipMapCanvas";

const DRAG_BOUNDS = 1600;

interface DraggableMapProps {
  children: React.ReactNode;
  targetCenter: { x: number; y: number } | null;
  onCenterReached: () => void;
}

export function DraggableMap({ children, targetCenter, onCenterReached }: DraggableMapProps) {
  const [scale, setScale] = useState(1);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { damping: 28, stiffness: 200 });
  const ySpring = useSpring(y, { damping: 28, stiffness: 200 });

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setScale((prev) => {
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      return Math.min(2, Math.max(0.5, prev + delta));
    });
  }, []);

  useEffect(() => {
    if (!targetCenter) return;
    const targetX = MAP_WIDTH / 2 - targetCenter.x;
    const targetY = MAP_HEIGHT / 2 - targetCenter.y;
    const clampedX = Math.max(-DRAG_BOUNDS, Math.min(DRAG_BOUNDS, targetX));
    const clampedY = Math.max(-DRAG_BOUNDS, Math.min(DRAG_BOUNDS, targetY));
    x.set(clampedX);
    y.set(clampedY);
    onCenterReached();
  }, [targetCenter?.x, targetCenter?.y]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="fixed inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      style={{ touchAction: "none" }}
    >
      <motion.div
        className="absolute origin-center"
        style={{
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
          left: "50%",
          top: "50%",
          x: xSpring,
          y: ySpring,
          scale,
          translateX: "-50%",
          translateY: "-50%",
        }}
        drag
        dragConstraints={{
          left: -DRAG_BOUNDS,
          right: DRAG_BOUNDS,
          top: -DRAG_BOUNDS,
          bottom: DRAG_BOUNDS,
        }}
        dragElastic={0.05}
        dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
