"use client";
import { CircleAlert, Info, ShieldCheck, Sparkles } from "lucide-react";
import { Tooltip } from "@/src/components/tooltip";

export default function TooltipPage() {
  return (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col gap-4 overflow-auto p-4">
      <header className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Tooltip</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Componente moderno com conteúdo em <code className="rounded bg-zinc-100 px-1 py-0.5">ReactNode</code>, tema
          <code className="ml-1 rounded bg-zinc-100 px-1 py-0.5">light</code> por padrão e opção
          <code className="ml-1 rounded bg-zinc-100 px-1 py-0.5">dark</code>.
        </p>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Apenas texto</h2>
        <p className="mt-1 text-sm text-zinc-600">Conteúdos simples em diferentes posições, sem alterar cursor do gatilho.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tooltip content="Topo (padrão)">
            <button type="button" className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Top
            </button>
          </Tooltip>
          <Tooltip content="Abaixo do botão" side="bottom">
            <button type="button" className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Bottom
            </button>
          </Tooltip>
          <Tooltip content="À esquerda do botão" side="left">
            <button type="button" className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Left
            </button>
          </Tooltip>
          <Tooltip content="À direita do botão" side="right">
            <button type="button" className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Right
            </button>
          </Tooltip>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Conteúdo completo em React</h2>
        <p className="mt-1 text-sm text-zinc-600">
          O conteúdo pode ser um card completo com título, descrição e listas, no tema light ou dark.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Tooltip
            side="right"
            content={
              <div className="min-w-[290px]">
                <p className="text-base font-semibold text-zinc-900">Status das integrações</p>
                <div className="mt-2 h-px bg-zinc-200" />
                <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                  <li className="flex items-center justify-between"><span>ERP</span><span className="font-medium text-emerald-700">Conectado</span></li>
                  <li className="flex items-center justify-between"><span>CRM</span><span className="font-medium text-emerald-700">Conectado</span></li>
                  <li className="flex items-center justify-between"><span>Gateway de pagamento</span><span className="font-medium text-amber-700">Sincronizando</span></li>
                  <li className="flex items-center justify-between"><span>E-mail transacional</span><span className="font-medium text-red-700">Falha</span></li>
                </ul>
                <p className="mt-2 text-sm font-semibold text-slate-600">2 alertas pendentes</p>
                <div className="mt-3 h-px bg-zinc-200" />
                <p className="mt-2 text-xs italic text-zinc-500">
                  Clique em integrações para revisar logs e retestar conexões com erro.
                </p>
              </div>
            }
          >
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:-translate-y-0.5 hover:bg-zinc-50"
            >
              <CircleAlert size={16} />
              Mostrar status de integrações (light)
            </button>
          </Tooltip>

          <Tooltip
            theme="dark"
            side="bottom"
            maxWidth={380}
            content={
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-300" />
                  <p className="text-sm font-semibold">Recomendação de segurança</p>
                </div>
                <p className="text-sm text-zinc-300">
                  Ative validação em duas etapas para reduzir tentativas de acesso indevido.
                </p>
                <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-300">
                  <li>Aplicar para administradores.</li>
                  <li>Requer backup code na ativação.</li>
                  <li>Auditar logins semanalmente.</li>
                </ul>
              </div>
            }
          >
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:-translate-y-0.5 hover:bg-zinc-50"
            >
              <Sparkles size={16} />
              Mostrar tooltip completo (dark)
            </button>
          </Tooltip>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Exemplo com ícone</h2>
        <p className="mt-1 text-sm text-zinc-600">O cursor não é alterado pelo Tooltip; ele respeita o estilo original do gatilho.</p>
        <div className="mt-4">
          <Tooltip content="Informações gerais sobre esse indicador." side="right">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <Info size={16} />
              Indicador de risco
            </button>
          </Tooltip>
        </div>
      </section>
    </div>
  );
}

