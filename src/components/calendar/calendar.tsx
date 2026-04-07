"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type CalendarLanguage = "en" | "es" | "pt-br";

const LANGUAGE_TO_LOCALE: Record<CalendarLanguage, string> = {
  en: "en-US",
  es: "es-ES",
  "pt-br": "pt-BR",
};

const FIRST_DAY_BY_LANGUAGE: Record<CalendarLanguage, number> = {
  en: 0,
  es: 1,
  "pt-br": 1,
};

function parseDateInput(value: string, enableTime: boolean) {
  if (!value) {
    return null;
  }

  if (enableTime) {
    const [datePart, timePart] = value.split("T");
    if (!datePart || !timePart) {
      return null;
    }

    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    if ([year, month, day, hours, minutes].some(Number.isNaN)) {
      return null;
    }

    return new Date(year, month - 1, day, hours, minutes);
  }

  const [year, month, day] = value.split("-").map(Number);
  if ([year, month, day].some(Number.isNaN)) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function padValue(value: number) {
  return String(value).padStart(2, "0");
}

function toInputValue(date: Date, enableTime: boolean, timeSource?: string) {
  const year = date.getFullYear();
  const month = padValue(date.getMonth() + 1);
  const day = padValue(date.getDate());

  if (!enableTime) {
    return `${year}-${month}-${day}`;
  }

  const parsedTimeSource = parseDateInput(timeSource ?? "", true);
  const hours = padValue(parsedTimeSource?.getHours() ?? 0);
  const minutes = padValue(parsedTimeSource?.getMinutes() ?? 0);

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function updateTimeInValue(value: string, timeValue: string, enableTime: boolean) {
  if (!enableTime || !value || !timeValue) {
    return value;
  }

  const [datePart] = value.split("T");
  if (!datePart) {
    return value;
  }

  return `${datePart}T${timeValue}`;
}

function getTimeValue(value: string, enableTime: boolean) {
  if (!enableTime || !value.includes("T")) {
    return "00:00";
  }

  const [, timePart] = value.split("T");
  if (!timePart) {
    return "00:00";
  }

  return timePart.slice(0, 5);
}

function formatDateValue(value: string, language: CalendarLanguage, enableTime: boolean) {
  const parsedDate = parseDateInput(value, enableTime);

  if (!parsedDate) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat(LANGUAGE_TO_LOCALE[language], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(enableTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });

  return formatter.format(parsedDate);
}

function isSameDay(a: Date | null, b: Date) {
  if (!a) {
    return false;
  }

  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface CalendarCell {
  date: Date;
  inCurrentMonth: boolean;
}

function buildCalendarCells(year: number, month: number, firstDayOfWeek: number) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() - firstDayOfWeek + 7) % 7;
  const startDate = new Date(year, month, 1 - startOffset);

  const cells: CalendarCell[] = [];
  for (let index = 0; index < 42; index += 1) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + index);
    cells.push({ date: cellDate, inCurrentMonth: cellDate.getMonth() === month });
  }

  return cells;
}

interface CalendarCardProps {
  id: string;
  language: CalendarLanguage;
  value: string;
  onDateChange: (nextValue: string) => void;
  enableTime: boolean;
  minDateValue?: string;
}

function CalendarCard({ id, language, value, onDateChange, enableTime, minDateValue }: CalendarCardProps) {
  const selectedDate = parseDateInput(value, enableTime);
  const minDate = parseDateInput(minDateValue ?? "", enableTime);
  const locale = LANGUAGE_TO_LOCALE[language];

  const initialDate = selectedDate ?? new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [selectedDate?.getFullYear(), selectedDate?.getMonth()]);

  const firstDayOfWeek = FIRST_DAY_BY_LANGUAGE[language];
  const calendarCells = useMemo(
    () => buildCalendarCells(viewYear, viewMonth, firstDayOfWeek),
    [viewYear, viewMonth, firstDayOfWeek]
  );

  const monthFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { month: "long" }), [locale]);
  const weekdayFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short" }), [locale]);

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, monthIndex) => ({
        value: monthIndex,
        label: monthFormatter.format(new Date(2024, monthIndex, 1)),
      })),
    [monthFormatter]
  );

  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, index) => {
        const baseDate = new Date(2024, 0, 7 + ((firstDayOfWeek + index) % 7));
        return weekdayFormatter.format(baseDate);
      }),
    [weekdayFormatter, firstDayOfWeek]
  );

  const canSelectDate = (date: Date) => {
    if (!minDate) {
      return true;
    }
    return date >= new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
  };

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((currentYear) => currentYear - 1);
      return;
    }

    setViewMonth((currentMonth) => currentMonth - 1);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((currentYear) => currentYear + 1);
      return;
    }

    setViewMonth((currentMonth) => currentMonth + 1);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 31 }).map((_, index) => currentYear - 15 + index);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-inner">
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="rounded-lg border border-zinc-200 p-2 text-zinc-700 transition hover:bg-zinc-100"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <select
          value={viewMonth}
          onChange={(event) => setViewMonth(Number(event.target.value))}
          className="h-9 flex-1 rounded-lg border border-zinc-300 bg-white px-2 text-sm text-zinc-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {monthOptions.map((monthOption) => (
            <option key={monthOption.value} value={monthOption.value}>
              {monthOption.label}
            </option>
          ))}
        </select>
        <select
          value={viewYear}
          onChange={(event) => setViewYear(Number(event.target.value))}
          className="h-9 w-24 rounded-lg border border-zinc-300 bg-white px-2 text-sm text-zinc-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {yearOptions.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={goToNextMonth}
          className="rounded-lg border border-zinc-200 p-2 text-zinc-700 transition hover:bg-zinc-100"
          aria-label="Proximo mes"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdayLabels.map((weekdayLabel) => (
          <span key={weekdayLabel} className="py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            {weekdayLabel}
          </span>
        ))}
        {calendarCells.map((cell) => {
          const isSelected = isSameDay(selectedDate, cell.date);
          const isToday = isSameDay(new Date(), cell.date);
          const isDisabled = !canSelectDate(cell.date);

          return (
            <button
              key={`${cell.date.toISOString()}-${id}`}
              type="button"
              disabled={isDisabled}
              onClick={() => onDateChange(toInputValue(cell.date, enableTime, value))}
              className={[
                "h-9 rounded-lg text-sm transition",
                cell.inCurrentMonth ? "text-zinc-800" : "text-zinc-400",
                isSelected ? "bg-blue-600 font-semibold text-white shadow-sm" : "hover:bg-zinc-100",
                isToday && !isSelected ? "border border-blue-200 bg-blue-50" : "",
                isDisabled ? "cursor-not-allowed opacity-40 hover:bg-transparent" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CalendarProps {
  id?: string;
  label?: string;
  language?: CalendarLanguage;
  enableTime?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  helperText?: string;
  compact?: boolean;
}

export function Calendar({
  id = "calendar",
  label = "Calendar",
  language = "pt-br",
  enableTime = false,
  value,
  onChange,
  helperText,
  compact = false,
}: CalendarProps) {
  const [internalValue, setInternalValue] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const calendarWrapperRef = useRef<HTMLDivElement | null>(null);
  const inputValue = value ?? internalValue;

  const formattedValue = useMemo(
    () => formatDateValue(inputValue, language, enableTime),
    [inputValue, language, enableTime]
  );

  const handleChange = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (!calendarWrapperRef.current?.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isPickerOpen]);

  return (
    <div
      ref={calendarWrapperRef}
      className={compact ? "relative" : "relative rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-5 shadow-sm"}
    >
      {!compact ? (
        <div className="mb-4 flex items-center justify-between">
          <label htmlFor={id} className="block text-sm font-semibold text-zinc-800">
            {label}
          </label>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
            {enableTime ? "date + time" : "date"}
          </span>
        </div>
      ) : null}

      <button
        id={id}
        type="button"
        onClick={() => setIsPickerOpen((previousState) => !previousState)}
        className={
          compact
            ? "flex h-8 w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-2.5 text-left text-xs text-zinc-900 outline-none transition hover:bg-zinc-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            : "flex h-11 w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-3.5 text-left text-sm text-zinc-900 outline-none transition hover:bg-zinc-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        }
      >
        <span className={formattedValue ? "font-medium text-zinc-900" : "text-zinc-400"}>
          {formattedValue || (enableTime ? "Selecionar data e hora" : "Selecionar data")}
        </span>
        <span className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-700">{isPickerOpen ? "Fechar" : "Abrir"}</span>
      </button>

      {isPickerOpen ? (
        <div className="absolute left-0 top-full z-[300] mt-2 w-full min-w-[320px] rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl">
          <CalendarCard
            id={id}
            language={language}
            value={inputValue}
            onDateChange={(nextValue) => {
              handleChange(nextValue);
              if (!enableTime) {
                setIsPickerOpen(false);
              }
            }}
            enableTime={enableTime}
          />
          {enableTime ? (
            <div className="mt-3">
              <label htmlFor={`${id}-time`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Hora
              </label>
              <input
                id={`${id}-time`}
                type="time"
                value={getTimeValue(inputValue, true)}
                onChange={(event) => handleChange(updateTimeInValue(inputValue, event.target.value, true))}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {!compact && helperText ? <p className="mt-2 text-xs text-zinc-500">{helperText}</p> : null}
      {!compact ? (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm text-blue-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Formatted value</p>
          <p className="mt-1 font-medium">{formattedValue || "-"}</p>
        </div>
      ) : null}
    </div>
  );
}

export interface DateRangeValue {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  idPrefix?: string;
  label?: string;
  language?: CalendarLanguage;
  enableTime?: boolean;
  value?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  onClear?: () => void;
  helperText?: string;
  compact?: boolean;
}

export function DateRangePicker({
  idPrefix = "date-range",
  label = "Date range",
  language = "pt-br",
  enableTime = false,
  value,
  onChange,
  onClear,
  helperText,
  compact = false,
}: DateRangePickerProps) {
  const [internalValue, setInternalValue] = useState<DateRangeValue>({ start: "", end: "" });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeField, setActiveField] = useState<keyof DateRangeValue>("start");
  const rangeWrapperRef = useRef<HTMLDivElement | null>(null);
  const currentValue = value ?? internalValue;

  const formattedStart = useMemo(
    () => formatDateValue(currentValue.start, language, enableTime),
    [currentValue.start, language, enableTime]
  );
  const formattedEnd = useMemo(
    () => formatDateValue(currentValue.end, language, enableTime),
    [currentValue.end, language, enableTime]
  );
  const formattedRange = formattedStart && formattedEnd ? `${formattedStart} - ${formattedEnd}` : "";
  const formattedSelectionLabel = formattedRange || formattedStart || formattedEnd || "";
  const hasSelectedRange = Boolean(currentValue.start || currentValue.end);

  const hasInvalidRange = Boolean(currentValue.start && currentValue.end && currentValue.end < currentValue.start);

  const handleFieldChange = (field: keyof DateRangeValue, fieldValue: string) => {
    const nextValue: DateRangeValue = { ...currentValue, [field]: fieldValue };
    if (field === "start" && nextValue.end) {
      const nextStartDate = parseDateInput(nextValue.start, enableTime);
      const nextEndDate = parseDateInput(nextValue.end, enableTime);
      if (nextStartDate && nextEndDate && nextEndDate < nextStartDate) {
        nextValue.end = "";
      }
    }

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  };

  const handleClear = () => {
    const clearedValue = { start: "", end: "" };
    if (value === undefined) {
      setInternalValue(clearedValue);
    }
    onChange?.(clearedValue);
    onClear?.();
    setIsPickerOpen(false);
  };

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (!rangeWrapperRef.current?.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isPickerOpen]);

  return (
    <div
      ref={rangeWrapperRef}
      className={compact ? "relative" : "relative rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-5 shadow-sm"}
    >
      {!compact ? (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-800">{label}</h3>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
            {enableTime ? "range + time" : "range"}
          </span>
        </div>
      ) : null}

      <div className="flex items-center gap-1.5">
        <button
          id={`${idPrefix}-single-input`}
          type="button"
          onClick={() => setIsPickerOpen((previousState) => !previousState)}
          className={
            compact
              ? "flex h-8 w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-2.5 text-left text-xs text-zinc-900 outline-none transition hover:bg-zinc-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              : "flex h-11 w-full items-center justify-between rounded-xl border border-zinc-300 bg-white px-3.5 text-left text-sm text-zinc-900 outline-none transition hover:bg-zinc-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          }
        >
          <span className={formattedSelectionLabel ? "font-medium text-zinc-900" : "text-zinc-400"}>
            {formattedSelectionLabel || (enableTime ? "Selecionar intervalo com hora" : "Selecionar intervalo")}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-700">{isPickerOpen ? "Fechar" : "Abrir"}</span>
        </button>
        {compact ? (
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasSelectedRange}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white text-xs font-bold text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Limpar filtro de data"
            title="Limpar filtro"
          >
            ×
          </button>
        ) : null}
      </div>

      {isPickerOpen ? (
        <div
          className={
            compact
              ? "absolute left-0 top-full z-[300] mt-2 w-[360px] max-w-[90vw] rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl"
              : "absolute left-0 top-full z-[300] mt-2 w-full min-w-[340px] rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl"
          }
        >
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveField("start")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeField === "start" ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => setActiveField("end")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeField === "end" ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              Fim
            </button>
          </div>

          <CalendarCard
            id={`${idPrefix}-${activeField}`}
            language={language}
            value={currentValue[activeField]}
            onDateChange={(nextValue) => handleFieldChange(activeField, nextValue)}
            enableTime={enableTime}
            minDateValue={activeField === "end" ? currentValue.start : undefined}
          />

          {enableTime ? (
            <div className="mt-3">
              <label
                htmlFor={`${idPrefix}-${activeField}-time`}
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600"
              >
                Hora ({activeField === "start" ? "inicio" : "fim"})
              </label>
              <input
                id={`${idPrefix}-${activeField}-time`}
                type="time"
                value={getTimeValue(currentValue[activeField], true)}
                onChange={(event) =>
                  handleFieldChange(activeField, updateTimeInValue(currentValue[activeField], event.target.value, true))
                }
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {!compact && helperText ? <p className="mt-2 text-xs text-zinc-500">{helperText}</p> : null}
      {!compact ? (
        <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2.5 text-sm text-violet-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Formatted range</p>
          <p className="mt-1 font-medium">{formattedRange || "-"}</p>
        </div>
      ) : null}
      {hasInvalidRange ? <p className="mt-2 text-xs font-medium text-red-600">A data final nao pode ser menor do que a inicial.</p> : null}
      {!compact ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-zinc-600 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-900"
          >
            Limpar intervalo
          </button>
        </div>
      ) : null}
    </div>
  );
}
