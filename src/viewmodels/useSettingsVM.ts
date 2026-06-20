import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { get, set } from "idb-keyval";

export function useSettingsVM(onClose: () => void) {
  const storeHardReset = useGameStore((state) => state.hardReset);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [importInput, setImportInput] = useState("");

  const handleExport = async () => {
    let saveString = await get("poke-idle-storage");
    if (!saveString) {
      saveString = localStorage.getItem("poke-idle-storage");
    }
    if (!saveString) return;
    const base64Save = btoa(encodeURIComponent(saveString));
    navigator.clipboard.writeText(base64Save);
    alert("Save copied to clipboard!");
  };

  const handleImport = async () => {
    try {
      if (!importInput.trim()) return;
      const decodedSave = decodeURIComponent(atob(importInput));
      JSON.parse(decodedSave);
      await set("poke-idle-storage", decodedSave);
      window.location.reload();
    } catch {
      alert("Invalid save code!");
    }
  };

  const closeSettings = () => {
    onClose();
    setIsResetConfirmOpen(false);
    setImportInput("");
  };

  const hardReset = () => {
    storeHardReset();
    closeSettings();
  };

  return {
    importInput,
    setImportInput,
    isResetConfirmOpen,
    setIsResetConfirmOpen,
    handleExport,
    handleImport,
    hardReset,
    closeSettings,
  };
}
