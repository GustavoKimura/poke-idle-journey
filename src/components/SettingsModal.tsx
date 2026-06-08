import {
  Download,
  Upload,
  AlertTriangle,
  Settings,
  Info,
  Hand,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";
import { useSettingsVM } from "../viewmodels/useSettingsVM";
import { GAME_CONFIG } from "../config/gameConfig";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { useGameStore } from "../store/useGameStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    importInput,
    setImportInput,
    isResetConfirmOpen,
    setIsResetConfirmOpen,
    handleExport,
    handleImport,
    hardReset,
    closeSettings,
  } = useSettingsVM(onClose);

  const isHoldToClickEnabled = useGameStore(
    (state) => state.isHoldToClickEnabled,
  );
  const isSoundEnabled = useGameStore((state) => state.isSoundEnabled);
  const isVfxEnabled = useGameStore((state) => state.isVfxEnabled);

  const toggleHoldToClick = useGameStore((state) => state.toggleHoldToClick);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const toggleVfx = useGameStore((state) => state.toggleVfx);

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeSettings}
      title="Settings"
      icon={<Settings size={28} />}
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-blue-400 font-bold uppercase tracking-wider text-sm border-b border-white/10 pb-2 flex items-center gap-2">
            <Info size={16} />
            How to Play
          </h3>
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-100 space-y-3">
            <p>
              <strong className="text-green-400">Party System:</strong> Open
              your Pokédex and equip up to {GAME_CONFIG.MAX_PARTY_SIZE} Pokémon.
              Each active party member grants a massive +
              {GAME_CONFIG.PARTY_MEMBER_MULTIPLIER * 100}% global multiplier!
            </p>
            <p>
              <strong className="text-blue-300">Offline Earnings:</strong> Close
              the game and return later! Your trainers will continue to collect
              PokeDollars automatically (triggers after{" "}
              {GAME_CONFIG.OFFLINE_MIN_SECONDS} seconds offline).
            </p>
            <p>
              <strong className="text-pokeYellow">Prestige System:</strong>{" "}
              Reach Pokémon #{GAME_CONFIG.PRESTIGE_MIN_ID} to unlock Prestige.
              This resets your money, upgrades, and caught Pokémon, but rewards
              you with Rare Candies based on how far you got! Each Candy
              permanently increases your global multiplier by +100%. Reaching
              Pokémon #{GAME_CONFIG.MAX_POKEMON_ID} gives a massive bonus!
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-green-400 font-bold uppercase tracking-wider text-sm border-b border-white/10 pb-2 flex items-center gap-2">
            <Hand size={16} />
            Accessibility & Performance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant={isSoundEnabled ? "primary" : "ghost"}
              fullWidth
              onClick={toggleSound}
            >
              {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              Sound: {isSoundEnabled ? "ON" : "OFF"}
            </Button>
            <Button
              variant={isVfxEnabled ? "primary" : "ghost"}
              fullWidth
              onClick={toggleVfx}
            >
              {isVfxEnabled ? (
                <Sparkles size={20} />
              ) : (
                <Sparkles size={20} className="opacity-50" />
              )}
              Visual FX: {isVfxEnabled ? "ON" : "OFF"}
            </Button>
            <Button
              variant={isHoldToClickEnabled ? "primary" : "ghost"}
              fullWidth
              onClick={toggleHoldToClick}
              className="sm:col-span-2"
            >
              Hold-to-Click: {isHoldToClickEnabled ? "ON" : "OFF"}
            </Button>
            <p className="text-xs text-gray-400 mt-2 text-center sm:col-span-2">
              Enable "Hold-to-Click" to hold down the mouse to automatically
              click and prevent RSI. Turn off "Visual FX" to disable screen
              shake and floating numbers if the game is lagging.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-pokeYellow font-bold uppercase tracking-wider text-sm border-b border-white/10 pb-2">
            Save Management
          </h3>
          <Button variant="ghost" fullWidth onClick={handleExport}>
            <Download size={20} />
            Export Save to Clipboard
          </Button>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste save code here..."
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-pokeYellow"
            />
            <Button variant="primary" onClick={handleImport}>
              <Upload size={20} />
              Import
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-pokeRed font-bold uppercase tracking-wider text-sm border-b border-white/10 pb-2">
            Danger Zone
          </h3>

          {!isResetConfirmOpen ? (
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsResetConfirmOpen(true)}
            >
              <AlertTriangle size={20} />
              Hard Reset Game
            </Button>
          ) : (
            <div className="bg-pokeRed/20 border border-pokeRed rounded-xl p-4 text-center space-y-4">
              <p className="text-white font-bold">
                Are you absolutely sure? This will delete EVERYTHING!
              </p>
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setIsResetConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="danger" fullWidth onClick={hardReset}>
                  Confirm Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
