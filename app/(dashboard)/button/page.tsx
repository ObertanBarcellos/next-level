"use client";

import { ArrowRight, Bell, Download, Heart, Plus, Settings } from "lucide-react";
import { Button } from "@/src/components/button/button";

const tones = ["neutral", "blue", "emerald", "amber", "red", "violet"] as const;

export default function ButtonPage() {
  return (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col gap-4 p-4">
      <header className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Button</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Componente base com suporte para button, outline, icon, icon+texto e icon sem borda/background.
        </p>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">Solid Button</h2>
        <div className="flex flex-wrap items-center gap-2">
          {tones.map((tone) => (
            <Button key={tone} tone={tone}>
              {tone}
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">Outline Button</h2>
        <div className="flex flex-wrap items-center gap-2">
          {tones.map((tone) => (
            <Button key={tone} variant="outline" tone={tone}>
              {tone}
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">Icon Button</h2>
        <div className="flex flex-wrap items-center gap-2">
          {tones.map((tone) => (
            <Button key={tone} variant="icon" tone={tone} icon={<Heart size={16} />} aria-label={`Favoritar com cor ${tone}`} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">Icon + Text Button</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="icon-text" tone="blue" icon={<Download size={16} />}>
            Download
          </Button>
          <Button variant="icon-text" tone="emerald" icon={<Plus size={16} />}>
            Criar
          </Button>
          <Button variant="icon-text" tone="amber" icon={<Bell size={16} />}>
            Notificar
          </Button>
          <Button variant="icon-text" tone="violet" icon={<Settings size={16} />} iconPosition="right">
            Configurar
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">Icon Plain (sem borda e sem background)</h2>
        <div className="flex flex-wrap items-center gap-4">
          {tones.map((tone) => (
            <Button
              key={tone}
              variant="icon-plain"
              tone={tone}
              icon={<ArrowRight size={18} />}
              aria-label={`Acao somente icone na cor ${tone}`}
              className="text-lg"
            />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">Customizacao</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button tone="neutral" className="rounded-full px-6">
            Rounded custom
          </Button>
          <Button tone="red" fullWidth className="max-w-xs">
            Full width max-w-xs
          </Button>
        </div>
      </section>
    </div>
  );
}
