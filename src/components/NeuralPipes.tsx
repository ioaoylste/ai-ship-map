import { PIPE_CONNECTIONS } from "../config/rooms";

export function NeuralPipes() {
  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 0 }}>
      <defs>
        <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.5)" />
          <stop offset="100%" stopColor="rgba(168,85,247,0.5)" />
        </linearGradient>
        <filter id="pipeGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {PIPE_CONNECTIONS.map((conn, i) => (
        <line
          key={i}
          x1={conn.from[0]}
          y1={conn.from[1]}
          x2={conn.to[0]}
          y2={conn.to[1]}
          stroke="url(#pipeGrad)"
          strokeWidth="2"
          strokeOpacity="0.7"
          filter="url(#pipeGlow)"
        />
      ))}
    </svg>
  );
}
