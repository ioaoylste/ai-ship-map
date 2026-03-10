import { useState, useCallback } from "react";
import { DraggableMap } from "./components/DraggableMap";
import { RPGDialog } from "./components/RPGDialog";
import {
  ShipMapCanvas,
  type NpcEntity,
  getNpcCameraTarget,
} from "./components/ShipMapCanvas";

export default function App() {
  const [targetCenter, setTargetCenter] = useState<{ x: number; y: number } | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogNpc, setDialogNpc] = useState<{
    name: string;
    role: string;
    avatar: string;
    text: string;
  } | null>(null);

  const handleNpcClick = useCallback((npc: NpcEntity) => {
    const target = getNpcCameraTarget(npc);
    setTargetCenter(target);
    setDialogVisible(true);
    setDialogNpc({
      name: npc.name,
      role: npc.role,
      avatar: npc.avatar,
      text: npc.dialog,
    });
  }, []);

  const handleCenterReached = useCallback(() => {
    setTimeout(() => setTargetCenter(null), 600);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogVisible(false);
    setDialogNpc(null);
  }, []);

  return (
    <div className="w-full h-full overflow-hidden">
      <DraggableMap targetCenter={targetCenter} onCenterReached={handleCenterReached}>
        <ShipMapCanvas onNpcClick={handleNpcClick} />
      </DraggableMap>

      <RPGDialog
        visible={dialogVisible}
        npcName={dialogNpc?.name ?? ""}
        npcRole={dialogNpc?.role ?? ""}
        npcAvatar={dialogNpc?.avatar ?? ""}
        text={dialogNpc?.text ?? ""}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
