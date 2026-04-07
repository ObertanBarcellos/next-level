"use client";

import { useId, useState, type InputHTMLAttributes } from "react";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  labelPosition?: "left" | "right";
  checkedColor?: string;
  uncheckedColor?: string;
  knobColor?: string;
  onCheckedChange?: (checked: boolean) => void;
}

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(" ");
}

export function Switch({
  id,
  label,
  labelPosition = "right",
  checked,
  defaultChecked,
  disabled = false,
  checkedColor = "#2563eb",
  uncheckedColor = "#d4d4d8",
  knobColor = "#ffffff",
  onCheckedChange,
  className,
  ...props
}: SwitchProps) {
  const generatedId = useId();
  const switchId = id ?? generatedId;
  const [internalChecked, setInternalChecked] = useState(Boolean(defaultChecked));
  const isChecked = checked ?? internalChecked;

  const handleChange = (nextChecked: boolean) => {
    if (checked === undefined) {
      setInternalChecked(nextChecked);
    }
    onCheckedChange?.(nextChecked);
  };

  const labelNode = label ? <span className="text-sm font-medium text-zinc-700">{label}</span> : null;

  return (
    <label
      htmlFor={switchId}
      className={joinClassNames(
        "inline-flex w-fit select-none items-center gap-2",
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        className
      )}
    >
      {labelPosition === "left" ? labelNode : null}

      <input
        id={switchId}
        type="checkbox"
        role="switch"
        checked={isChecked}
        disabled={disabled}
        className="peer sr-only"
        onChange={(event) => handleChange(event.target.checked)}
        {...props}
      />

      <span
        aria-hidden="true"
        className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-400 peer-focus-visible:ring-offset-2"
        style={{
          backgroundColor: isChecked ? checkedColor : uncheckedColor,
        }}
      >
        <span
          className="absolute left-1 h-5 w-5 rounded-full shadow-sm transition-transform duration-200"
          style={{
            backgroundColor: knobColor,
            transform: isChecked ? "translateX(20px)" : "translateX(0)",
          }}
        />
      </span>

      {labelPosition === "right" ? labelNode : null}
    </label>
  );
}
