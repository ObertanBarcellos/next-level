"use client";

import { useState } from "react";
import { Checkbox } from "@/src/components/checkbox/checkbox";
import { Switch } from "@/src/components/switch/switch";

export default function SwitchCheckboxPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [compactSwitchEnabled, setCompactSwitchEnabled] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(true);
  const [compactCheckboxEnabled, setCompactCheckboxEnabled] = useState(false);

  return (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col gap-5 overflow-auto p-5">
      <header className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Switch e Checkbox</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Componentes de selecao com visual customizavel, suporte a label opcional e posicionamento do texto.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">Switch</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <Switch
              label="Notificacoes"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              checkedColor="#16a34a"
            />
            <p className="mt-2 text-xs text-zinc-500">{notificationsEnabled ? "Ativado" : "Desativado"}</p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <Switch
              label="Modo escuro"
              labelPosition="left"
              checked={darkModeEnabled}
              onCheckedChange={setDarkModeEnabled}
              checkedColor="#7c3aed"
              uncheckedColor="#cbd5e1"
              knobColor="#ffffff"
            />
            <p className="mt-2 text-xs text-zinc-500">{darkModeEnabled ? "Ativado" : "Desativado"}</p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <Switch
              checked={compactSwitchEnabled}
              onCheckedChange={setCompactSwitchEnabled}
              checkedColor="#0891b2"
              aria-label="Ativar modo escuro"
            />
            <p className="mt-2 text-xs text-zinc-500">{compactSwitchEnabled ? "Ativado" : "Desativado"} (sem label)</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">Checkbox</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <Checkbox
              label="Aceito os termos de uso"
              checked={termsAccepted}
              onCheckedChange={setTermsAccepted}
              checkedColor="#0ea5e9"
            />
            <p className="mt-2 text-xs text-zinc-500">{termsAccepted ? "Aceito" : "Pendente"}</p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <Checkbox
              label="Receber comunicacoes de marketing"
              labelPosition="left"
              checked={marketingAccepted}
              onCheckedChange={setMarketingAccepted}
              checkedColor="#f59e0b"
              uncheckedColor="#a1a1aa"
              checkmarkColor="#111827"
            />
            <p className="mt-2 text-xs text-zinc-500">{marketingAccepted ? "Inscrito" : "Nao inscrito"}</p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <Checkbox
              checked={compactCheckboxEnabled}
              onCheckedChange={setCompactCheckboxEnabled}
              checkedColor="#db2777"
              aria-label="Aceitar comunicacoes"
            />
            <p className="mt-2 text-xs text-zinc-500">{compactCheckboxEnabled ? "Marcado" : "Desmarcado"} (sem label)</p>
          </div>
        </div>
      </section>
    </div>
  );
}
