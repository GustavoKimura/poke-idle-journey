import { Header } from "./Header";
import { MainStage } from "./MainStage";
import { UpgradeSidebar } from "./UpgradeSidebar";
import { useGameLoop } from "../hooks/useGameLoop";

export function GameContainer() {
  useGameLoop();

  return (
    <div className="flex flex-col h-screen w-screen bg-pokeDarkBlue text-white overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <MainStage />
        <UpgradeSidebar />
      </div>
    </div>
  );
}
