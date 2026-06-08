import { Header } from "./Header";
import { MainStage } from "./MainStage";
import { UpgradeSidebar } from "./UpgradeSidebar";
import { PokedexModal } from "./PokedexModal";
import { OfflineModal } from "./OfflineModal";
import { useGameLoop } from "../hooks/useGameLoop";

export function GameContainer() {
  useGameLoop();

  return (
    <div className="flex flex-col h-screen w-screen bg-pokeDarkBlue text-white overflow-hidden relative">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <MainStage />
        <UpgradeSidebar />
      </div>
      <PokedexModal />
      <OfflineModal />
    </div>
  );
}
