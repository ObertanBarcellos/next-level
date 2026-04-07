"use client";

import { useState } from "react";
import { Calendar, type CalendarLanguage, DateRangePicker } from "@/src/components/calendar/calendar";

const LANGUAGE_OPTIONS: Array<{ value: CalendarLanguage; label: string }> = [
  { value: "pt-br", label: "Portugues (Brasil)" },
  { value: "en", label: "English" },
  { value: "es", label: "Espanol" },
];

export default function CalendarPage() {
  const [language, setLanguage] = useState<CalendarLanguage>("pt-br");
  const [enableTime, setEnableTime] = useState(false);
  const [singleDate, setSingleDate] = useState("");
  const [rangeDate, setRangeDate] = useState({ start: "", end: "" });

  return (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col gap-5 overflow-auto p-5">
      <header className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Calendar e Date Range</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Componentes com layout aprimorado para selecao de data unica e intervalo em input unico, com localizacao por idioma.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">Props de exibicao</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm text-zinc-800">
            <span className="mb-1 block font-medium">language</span>
            <select
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={language}
              onChange={(event) => setLanguage(event.target.value as CalendarLanguage)}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800">
            <input
              type="checkbox"
              checked={enableTime}
              onChange={(event) => setEnableTime(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            Habilitar selecao de horas e minutos
          </label>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Calendar
          id="single-date"
          label="Calendar (data unica)"
          language={language}
          enableTime={enableTime}
          value={singleDate}
          onChange={setSingleDate}
          helperText="Use a prop enableTime para alternar entre date e datetime-local."
        />

        <DateRangePicker
          idPrefix="date-range"
          label="Date range (input unico)"
          language={language}
          enableTime={enableTime}
          value={rangeDate}
          onChange={setRangeDate}
          helperText="Clique em Pick para abrir o painel e selecionar inicio/fim no mesmo campo principal."
        />
      </section>
    </div>
  );
}
