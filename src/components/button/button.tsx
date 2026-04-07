import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "solid" | "outline" | "icon" | "icon-text" | "icon-plain";
export type ButtonTone = "neutral" | "blue" | "emerald" | "amber" | "red" | "violet" | "white";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "text-xs h-8 px-3 gap-1.5",
  md: "text-sm h-9 px-4 gap-2",
  lg: "text-sm h-10 px-5 gap-2",
};

const ICON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

const TONE_CLASSES: Record<ButtonTone, Record<ButtonVariant, string>> = {
  neutral: {
    solid: "bg-zinc-900 text-white hover:bg-zinc-800",
    outline: "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100",
    icon: "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100",
    "icon-text": "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100",
    "icon-plain": "text-zinc-700 hover:opacity-80",
  },
  blue: {
    solid: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border-blue-200 bg-white text-blue-700 hover:bg-blue-50",
    icon: "border-blue-200 bg-white text-blue-700 hover:bg-blue-50",
    "icon-text": "border-blue-200 bg-white text-blue-700 hover:bg-blue-50",
    "icon-plain": "text-blue-600 hover:opacity-80",
  },
  emerald: {
    solid: "bg-emerald-600 text-white hover:bg-emerald-700",
    outline: "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50",
    icon: "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50",
    "icon-text": "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50",
    "icon-plain": "text-emerald-600 hover:opacity-80",
  },
  amber: {
    solid: "bg-amber-500 text-white hover:bg-amber-600",
    outline: "border-amber-200 bg-white text-amber-700 hover:bg-amber-50",
    icon: "border-amber-200 bg-white text-amber-700 hover:bg-amber-50",
    "icon-text": "border-amber-200 bg-white text-amber-700 hover:bg-amber-50",
    "icon-plain": "text-amber-600 hover:opacity-80",
  },
  red: {
    solid: "bg-red-600 text-white hover:bg-red-700",
    outline: "border-red-200 bg-white text-red-700 hover:bg-red-50",
    icon: "border-red-200 bg-white text-red-700 hover:bg-red-50",
    "icon-text": "border-red-200 bg-white text-red-700 hover:bg-red-50",
    "icon-plain": "text-red-600 hover:opacity-80",
  },
  violet: {
    solid: "bg-violet-600 text-white hover:bg-violet-700",
    outline: "border-violet-200 bg-white text-violet-700 hover:bg-violet-50",
    icon: "border-violet-200 bg-white text-violet-700 hover:bg-violet-50",
    "icon-text": "border-violet-200 bg-white text-violet-700 hover:bg-violet-50",
    "icon-plain": "text-violet-600 hover:opacity-80",
  },
  white: {
    solid: "bg-white text-zinc-900 hover:bg-zinc-100",
    outline: "border-white/20 bg-white/5 text-white hover:bg-white/10",
    icon: "border-white/20 bg-white/5 text-white hover:bg-white/10",
    "icon-text": "border-white/20 bg-white/5 text-white hover:bg-white/10",
    "icon-plain": "text-white hover:opacity-80",
  },
};

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(" ");
}

export function Button({
  variant = "solid",
  tone = "neutral",
  size = "md",
  icon,
  iconPosition = "left",
  fullWidth = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isOnlyIcon = variant === "icon" || (variant === "icon-plain" && !children);
  const toneClasses = TONE_CLASSES[tone][variant];

  return (
    <button
      type={type}
      className={joinClassNames(
        "inline-flex shrink-0 items-center justify-center rounded-md border font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "icon-plain" ? "border-transparent bg-transparent p-0 shadow-none" : "",
        isOnlyIcon ? ICON_SIZE_CLASSES[size] : SIZE_CLASSES[size],
        toneClasses,
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {icon && iconPosition === "left" ? <span className="inline-flex items-center">{icon}</span> : null}
      {children ? <span className="inline-flex items-center">{children}</span> : null}
      {icon && iconPosition === "right" ? <span className="inline-flex items-center">{icon}</span> : null}
    </button>
  );
}
