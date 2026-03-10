export const ROOM_CONFIG = {
  welcome: { x: 200, y: 180, name: "全息迎宾厅", layer: "App层", glow: "blue" as const },
  bridge: { x: 700, y: 300, name: "中央舰桥", layer: "Model层", glow: "purple" as const },
  refinery: { x: 1200, y: 200, name: "燃料提炼厂", layer: "Data层", glow: "green" as const },
  agent: { x: 1200, y: 500, name: "自动化特勤舱", layer: "Agent层", glow: "cyan" as const },
  engine: { x: 200, y: 550, name: "底层动力室", layer: "Hardware层", glow: "red" as const },
};

const R = { w: 110, h: 80 };
export const PIPE_CONNECTIONS = [
  { from: [ROOM_CONFIG.welcome.x + R.w, ROOM_CONFIG.welcome.y + R.h], to: [ROOM_CONFIG.bridge.x + R.w, ROOM_CONFIG.bridge.y + R.h] },
  { from: [ROOM_CONFIG.bridge.x + R.w, ROOM_CONFIG.bridge.y + R.h], to: [ROOM_CONFIG.refinery.x + R.w, ROOM_CONFIG.refinery.y + R.h] },
  { from: [ROOM_CONFIG.bridge.x + R.w, ROOM_CONFIG.bridge.y + R.h], to: [ROOM_CONFIG.agent.x + R.w, ROOM_CONFIG.agent.y + R.h] },
  { from: [ROOM_CONFIG.bridge.x + R.w, ROOM_CONFIG.bridge.y + R.h], to: [ROOM_CONFIG.engine.x + R.w, ROOM_CONFIG.engine.y + R.h] },
  { from: [ROOM_CONFIG.welcome.x + R.w, ROOM_CONFIG.welcome.y + R.h], to: [ROOM_CONFIG.engine.x + R.w, ROOM_CONFIG.engine.y + R.h] },
  { from: [ROOM_CONFIG.refinery.x + R.w, ROOM_CONFIG.refinery.y + R.h], to: [ROOM_CONFIG.agent.x + R.w, ROOM_CONFIG.agent.y + R.h] },
];
