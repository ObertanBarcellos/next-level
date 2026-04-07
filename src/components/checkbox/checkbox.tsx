"use client";

import { Check } from "lucide-react";
import { useId, useState, type InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  labelPosition?: "left" | "right";
  checkedColor?: string;
  uncheckedColor?: string;
  checkmarkColor?: string;
  onCheckedChange?: (checked: boolean) => void;
}

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(" ");
}

export function Checkbox({
  id,
  label,
  labelPosition = "right",
  checked,
  defaultChecked,
  disabled = false,
  checkedColor = "#2563eb",
  uncheckedColor = "#d4d4d8",
  checkmarkColor = "#ffffff",
  onCheckedChange,
  className,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
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
      htmlFor={checkboxId}
      className={joinClassNames(
        "inline-flex w-fit select-none items-center gap-2",
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        className
      )}
    >
      {labelPosition === "left" ? labelNode : null}

      <input
        id={checkboxId}
        type="checkbox"
        checked={isChecked}
        disabled={disabled}
        className="peer sr-only"
        onChange={(event) => handleChange(event.target.checked)}
        {...props}
      />

      <span
        aria-hidden="true"
        className="inline-flex h-5 w-5 items-center justify-center rounded border transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-400 peer-focus-visible:ring-offset-2"
        style={{
          backgroundColor: isChecked ? checkedColor : "#ffffff",
          borderColor: isChecked ? checkedColor : uncheckedColor,
        }}
      >
        {isChecked ? <Check size={14} color={checkmarkColor} strokeWidth={3} /> : null}
      </span>

      {labelPosition === "right" ? labelNode : null}
    </label>
  );
}
