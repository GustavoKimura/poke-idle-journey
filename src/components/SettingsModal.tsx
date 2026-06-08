import { useState } from "react";
import {
  Download,
  Upload,
  AlertTriangle,
  X,
  Settings,
  Info,
} from "lucide-react";
import { useGameStore } from "../store/useGameStore";

export function SettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const hardReset = useGameStore((state) => state.hardReset);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [importInput, setImportInput] = useState("");

  if (!isOpen) return null;

  const handleExport = () => {
    const saveString = localStorage.getItem("poke-idle-storage");
    if (!saveString) return;
    const base64Save = btoa(encodeURIComponent(saveString));
    navigator.clipboard.writeText(base64Save);
    alert("Save copied to clipboard!");
  };

  const handleImport = () => {
    try {
      if (!importInput.trim()) return;
      const decodedSave = decodeURIComponent(atob(importInput));
      JSON.parse(decodedSave);
      localStorage.setItem("poke-idle-storage", decodedSave);
      window.location.reload();
    } catch (_) {
      console.log(_);
      alert("Invalid save code!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-b from-pokeDarkBlue to-black border-2 border-white/20 rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 flex justify-between items-center border-b border-white/10 bg-black/20 shrink-0">
          <div className="flex items-center gap-3">
            <Settings className="text-gray-400" size={28} />
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">
              Settings
            </h2>
          </div>
          <button
            onClick={() => {
              onClose();
              setIsResetConfirmOpen(false);
            }}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={28} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <h3 className="text-blue-400 font-bold uppercase tracking-wider text-sm border-b border-white/10 pb-2 flex items-center gap-2">
              <Info size={16} />
              How to Play
            </h3>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-100 space-y-3">
              <p>
                <strong className="text-blue-300">Offline Earnings:</strong>{" "}
                Close the game and return later! Your trainers will continue to
                collect PokeDollars automatically (triggers after 5 seconds
                offline).
              </p>
              <p>
                <strong className="text-pokeYellow">Prestige System:</strong>{" "}
                Reach and capture Pokémon #151 to unlock Prestige. This resets
                your money, upgrades, and caught Pokémon, but rewards you with{" "}
                <strong className="text-pink-400">1 Rare Candy</strong>, which
                permanently increases your global multiplier by +100%!
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-pokeYellow font-bold uppercase tracking-wider text-sm border-b border-white/10 pb-2">
              Save Management
            </h3>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase bg-black/40 border border-white/10 hover:bg-white/10 text-white transition-all cursor-pointer"
            >
              <Download size={20} />
              Export Save to Clipboard
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste save code here..."
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-pokeYellow"
              />
              <button
                onClick={handleImport}
                className="px-6 py-3 rounded-xl font-bold uppercase bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <Upload size={20} />
                Import
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-pokeRed font-bold uppercase tracking-wider text-sm border-b border-white/10 pb-2">
              Danger Zone
            </h3>

            {!isResetConfirmOpen ? (
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase border border-pokeRed text-pokeRed hover:bg-pokeRed hover:text-white transition-all cursor-pointer"
              >
                <AlertTriangle size={20} />
                Hard Reset Game
              </button>
            ) : (
              <div className="bg-pokeRed/20 border border-pokeRed rounded-xl p-4 text-center space-y-4">
                <p className="text-white font-bold">
                  Are you absolutely sure? This will delete EVERYTHING!
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="flex-1 py-2 rounded-lg font-bold uppercase bg-black/40 text-white hover:bg-black/60 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={hardReset}
                    className="flex-1 py-2 rounded-lg font-bold uppercase bg-pokeRed text-white hover:bg-red-600 shadow-[0_0_15px_rgba(238,21,21,0.5)] transition-all cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
