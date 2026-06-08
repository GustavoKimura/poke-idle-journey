import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost" | "glass" | "outline";
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-widest transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-pokeYellow text-black hover:scale-105 shadow-[0_0_15px_rgba(255,222,0,0.4)] disabled:bg-black/50 disabled:text-gray-500 disabled:border disabled:border-white/10 disabled:shadow-none disabled:hover:scale-100",
    danger:
      "bg-pokeRed text-white hover:bg-red-600 shadow-[0_0_15px_rgba(238,21,21,0.5)] border border-pokeRed",
    ghost: "bg-black/40 text-white hover:bg-white/10 border border-white/10",
    glass:
      "bg-black/20 text-gray-400 hover:text-pokeYellow hover:border-pokeYellow border-2 border-white/10 hover:bg-pokeYellow/10",
    outline:
      "bg-transparent text-pokeRed border border-pokeRed hover:bg-pokeRed hover:text-white",
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const paddingStyle = "py-3 px-6";

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${paddingStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
