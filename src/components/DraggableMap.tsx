import { useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MAP_WIDTH, MAP_HEIGHT } from "./ShipMapCanvas";

const DRAG_BOUNDS = 1600;

interface DraggableMapProps {
  children: React.ReactNode;
  targetCenter: { x: number; y: number } | null;
  targetZoom?: number | null;
  shakePulse?: number;
  onCenterReached: () => void;
}

export function DraggableMap({ children, targetCenter, targetZoom, shakePulse = 0, onCenterReached }: DraggableMapProps) {
  const [scale, setScale] = useState(1);
  const [shake, setShake] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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
    if (!targetCenter && targetZoom == null) return;

    if (targetCenter) {
      const targetX = MAP_WIDTH / 2 - targetCenter.x;
      const targetY = MAP_HEIGHT / 2 - targetCenter.y;
      const clampedX = Math.max(-DRAG_BOUNDS, Math.min(DRAG_BOUNDS, targetX));
      const clampedY = Math.max(-DRAG_BOUNDS, Math.min(DRAG_BOUNDS, targetY));
      x.set(clampedX);
      y.set(clampedY);
      onCenterReached();
    }

    if (targetZoom != null) {
      setScale(Math.min(2.2, Math.max(0.6, targetZoom)));
    }
  }, [targetCenter?.x, targetCenter?.y, targetZoom]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (shakePulse <= 0) return;

    let ticks = 0;
    const timer = window.setInterval(() => {
      ticks += 1;
      setShake({
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8,
      });
      if (ticks >= 7) {
        window.clearInterval(timer);
        setShake({ x: 0, y: 0 });
      }
    }, 56);

    return () => {
      window.clearInterval(timer);
      setShake({ x: 0, y: 0 });
    };
  }, [shakePulse]);

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
          height: MAP_HEIGHT + 120,
          left: "50%",
          top: "50%",
          x: xSpring,
          y: ySpring,
          scale,
          marginLeft: shake.x,
          marginTop: shake.y,
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
