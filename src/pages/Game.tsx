import { Header } from "../components/Header";
import { MainStage } from "../components/MainStage";
import { UpgradeSidebar } from "../components/UpgradeSidebar";
import { PokedexModal } from "../components/PokedexModal";
import { OfflineModal } from "../components/OfflineModal";
import { AchievementsModal } from "../components/AchievementsModal";
import { useGameLoop } from "../hooks/useGameLoop";

export function Game() {
  useGameLoop();

  return (
    <div className="flex flex-col h-screen w-screen bg-pokeDarkBlue text-white overflow-hidden relative">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <MainStage />
        <UpgradeSidebar />
      </div>
      <PokedexModal />
      <AchievementsModal />
      <OfflineModal />
    </div>
  );
}
