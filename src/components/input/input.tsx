"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type HTMLInputTypeAttribute, type ReactNode } from "react";

export type InputVariant = "input" | "select" | "autocomplete" | "select2";

export interface InputOption {
  label: string;
  value: string;
}

export interface InputProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  variant?: InputVariant;
  type?: HTMLInputTypeAttribute;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options?: InputOption[];
  selectPlaceholder?: string;
  selectedValues?: string[];
  defaultSelectedValues?: string[];
  onSelectedValuesChange?: (values: string[]) => void;
  noResultsText?: string;
  className?: string;
  fieldClassName?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(" ");
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function Input({
  id,
  name,
  label,
  placeholder,
  helperText,
  required = false,
  disabled = false,
  variant = "input",
  type = "text",
  value,
  defaultValue = "",
  onValueChange,
  options = [],
  selectPlaceholder = "Selecione uma opcao",
  selectedValues,
  defaultSelectedValues = [],
  onSelectedValuesChange,
  noResultsText = "Nenhum resultado encontrado",
  className,
  fieldClassName,
  leadingIcon,
  trailingIcon,
}: InputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [isSelect2Open, setIsSelect2Open] = useState(false);
  const [select2Query, setSelect2Query] = useState("");
  const [internalSelectedValues, setInternalSelectedValues] = useState<string[]>(defaultSelectedValues);
  const selectRef = useRef<HTMLDivElement | null>(null);
  const autocompleteRef = useRef<HTMLDivElement | null>(null);
  const select2Ref = useRef<HTMLDivElement | null>(null);

  const currentValue = value ?? internalValue;
  const currentSelectedValues = selectedValues ?? internalSelectedValues;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const eventTarget = event.target as Node;

      if (autocompleteRef.current && !autocompleteRef.current.contains(eventTarget)) {
        setIsAutocompleteOpen(false);
      }

      if (selectRef.current && !selectRef.current.contains(eventTarget)) {
        setIsSelectOpen(false);
      }

      if (select2Ref.current && !select2Ref.current.contains(eventTarget)) {
        setIsSelect2Open(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const autocompleteOptions = useMemo(() => {
    if (variant !== "autocomplete") {
      return [];
    }

    const normalizedQuery = normalizeText(currentValue);
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => normalizeText(option.label).includes(normalizedQuery));
  }, [currentValue, options, variant]);

  const select2AvailableOptions = useMemo(() => {
    const normalizedQuery = normalizeText(select2Query);
    return options.filter((option) => {
      const matchesQuery = normalizedQuery ? normalizeText(option.label).includes(normalizedQuery) : true;
      const isAlreadySelected = currentSelectedValues.includes(option.value);
      return matchesQuery && !isAlreadySelected;
    });
  }, [currentSelectedValues, options, select2Query]);

  const baseFieldClassName = joinClassNames(
    "h-11 w-full rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 shadow-sm outline-none transition-all",
    "focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500",
    leadingIcon ? "pl-9 pr-3" : "px-3",
    trailingIcon ? "pr-10" : "",
    fieldClassName
  );

  const handleValueChange = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const handleSelect2ValuesChange = (nextValues: string[]) => {
    if (selectedValues === undefined) {
      setInternalSelectedValues(nextValues);
    }

    onSelectedValuesChange?.(nextValues);
  };

  const handleAddSelect2Value = (nextValue: string) => {
    if (!currentSelectedValues.includes(nextValue)) {
      handleSelect2ValuesChange([...currentSelectedValues, nextValue]);
    }
    setSelect2Query("");
  };

  const handleRemoveSelect2Value = (valueToRemove: string) => {
    handleSelect2ValuesChange(currentSelectedValues.filter((selectedValue) => selectedValue !== valueToRemove));
  };

  const renderBaseInput = () => (
    <div className="relative">
      {leadingIcon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">{leadingIcon}</span>
      ) : null}
      <input
        id={id}
        name={name}
        type={type}
        value={currentValue}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={(event) => handleValueChange(event.target.value)}
        className={baseFieldClassName}
      />
      {trailingIcon ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">{trailingIcon}</span>
      ) : null}
    </div>
  );

  const selectedOptionLabel = options.find((option) => option.value === currentValue)?.label ?? "";

  const renderSelect = () => (
    <div ref={selectRef} className="relative">
      {name ? <input type="hidden" name={name} value={currentValue} /> : null}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsSelectOpen((prev) => !prev)}
        className={joinClassNames(baseFieldClassName, "relative cursor-pointer text-left disabled:cursor-not-allowed")}
      >
        <span className={selectedOptionLabel ? "text-zinc-900" : "text-zinc-400"}>
          {selectedOptionLabel || selectPlaceholder}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={joinClassNames(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-transform",
            isSelectOpen && "rotate-180"
          )}
        />
      </button>

      {isSelectOpen ? (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => {
              handleValueChange("");
              setIsSelectOpen(false);
            }}
            className="w-full rounded-md px-2 py-2 text-left text-sm text-zinc-500 transition-colors hover:bg-zinc-100"
          >
            {selectPlaceholder}
          </button>

          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                handleValueChange(option.value);
                setIsSelectOpen(false);
              }}
              className={joinClassNames(
                "w-full rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-zinc-100",
                currentValue === option.value ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-700"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  const renderAutocomplete = () => (
    <div ref={autocompleteRef} className="relative">
      {renderBaseInput()}
      {isAutocompleteOpen ? (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl">
          {autocompleteOptions.length > 0 ? (
            autocompleteOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  handleValueChange(option.label);
                  setIsAutocompleteOpen(false);
                }}
                className="w-full rounded-md px-2 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                {option.label}
              </button>
            ))
          ) : (
            <p className="px-2 py-2 text-sm text-zinc-500">{noResultsText}</p>
          )}
        </div>
      ) : null}
    </div>
  );

  const renderSelect2 = () => (
    <div ref={select2Ref} className="relative">
      <div className="min-h-11 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 shadow-sm transition-all focus-within:border-zinc-400 focus-within:ring-4 focus-within:ring-zinc-200/70">
        <div className="flex flex-wrap items-center gap-2">
          {currentSelectedValues.map((selectedValue) => {
            const selectedOption = options.find((option) => option.value === selectedValue);
            if (!selectedOption) {
              return null;
            }

            return (
              <span
                key={selectedValue}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700"
              >
                {selectedOption.label}
                <button
                  type="button"
                  onClick={() => handleRemoveSelect2Value(selectedValue)}
                  className="text-zinc-500 transition-colors hover:text-zinc-900"
                  aria-label={`Remover ${selectedOption.label}`}
                >
                  x
                </button>
              </span>
            );
          })}

          <input
            value={select2Query}
            onFocus={() => setIsSelect2Open(true)}
            onChange={(event) => {
              setSelect2Query(event.target.value);
              setIsSelect2Open(true);
            }}
            disabled={disabled}
            placeholder={currentSelectedValues.length ? "" : placeholder}
            className="h-7 min-w-[160px] flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          />
        </div>
      </div>

      {isSelect2Open ? (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl">
          {select2AvailableOptions.length > 0 ? (
            select2AvailableOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleAddSelect2Value(option.value)}
                className="w-full rounded-md px-2 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                {option.label}
              </button>
            ))
          ) : (
            <p className="px-2 py-2 text-sm text-zinc-500">{noResultsText}</p>
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className={joinClassNames("flex w-full flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-zinc-700">
          {label}
          {required ? <span className="ml-1 text-red-600">*</span> : null}
        </label>
      ) : null}

      {variant === "input" ? renderBaseInput() : null}
      {variant === "select" ? renderSelect() : null}
      {variant === "autocomplete" ? renderAutocomplete() : null}
      {variant === "select2" ? renderSelect2() : null}

      {helperText ? <p className="text-xs text-zinc-500">{helperText}</p> : null}
    </div>
  );
}
