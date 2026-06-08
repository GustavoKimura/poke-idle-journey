import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  maxWidth?: "md" | "lg" | "4xl" | "7xl";
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  icon,
  headerRight,
  maxWidth = "lg",
  children,
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    md: "max-w-md",
    lg: "max-w-lg",
    "4xl": "max-w-4xl",
    "7xl": "max-w-7xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6">
      <div
        className={`bg-gradient-to-b from-pokeDarkBlue to-black border-2 border-white/20 rounded-3xl w-full ${maxWidthClasses[maxWidth]} shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]`}
      >
        <div className="p-4 sm:p-6 flex justify-between items-center border-b border-white/10 bg-black/20 shrink-0">
          <div className="flex items-center gap-3">
            {icon && <span className="text-gray-400">{icon}</span>}
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white drop-shadow-md">
              {title}
            </h2>
            {headerRight}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-pokeRed transition-colors cursor-pointer"
            >
              <X size={28} />
            </button>
          )}
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
