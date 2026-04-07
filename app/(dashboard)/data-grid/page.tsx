"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DataGrid,
  type DataGridColumn,
  type DataGridLocale,
  type DataGridRef,
} from "@/src/components/data-grid/data-grid";
import { DataGridControls } from "@/src/components/data-grid/data-grid-controls";
import { DataGridPaginationTooltipContent } from "@/src/components/data-grid/data-grid-pagination-tooltip";
import { DateRangePicker, type CalendarLanguage, type DateRangeValue } from "@/src/components/calendar/calendar";
import { Button } from "@/src/components/button/button";
import { Bell, CircleCheck, List, Lock, Shield, TriangleAlert } from "lucide-react";
import { useToast } from "@/src/components/toast";

interface GridRow {
  id: number;
  avatarUrl: string;
  name: string;
  email: string;
  createdAt: string;
  score: number;
  role: string;
  team: string;
  capabilities: Array<"shield" | "lock" | "bell">;
  active: boolean;
}

const GRID_LOCALE_TO_CALENDAR_LANGUAGE: Record<DataGridLocale, CalendarLanguage> = {
  pt: "pt-br",
  en: "en",
  es: "es",
};

function isDateRangeFilter(value: unknown): value is DateRangeValue {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.start === "string" && typeof candidate.end === "string";
}

export default function DataGridPage() {
  const dataGridRef = useRef<DataGridRef | null>(null);
  const [locale, setLocale] = useState<DataGridLocale>("pt");
  const [enablePagination, setEnablePagination] = useState(true);
  const toast = useToast();

  const rows = useMemo<GridRow[]>(
    () =>
      Array.from({ length: 100000 }, (_, index) => ({
        id: index + 1,
        avatarUrl: `https://i.pravatar.cc/80?img=${(index % 70) + 1}`,
        name: `Usuario ${index + 1}`,
        email: `usuario${index + 1}@empresa.com`,
        createdAt: new Date(2025, (index * 7) % 12, ((index * 3) % 28) + 1).toISOString().slice(0, 10),
        score: 500 + ((index * 37) % 9200),
        role: index % 2 === 0 ? "Admin" : "Editor",
        team: `Time ${(index % 12) + 1}`,
        capabilities: [
          "shield",
          ...(index % 2 === 0 ? (["lock"] as const) : []),
          ...(index % 3 === 0 ? (["bell"] as const) : []),
        ],
        active: index % 4 !== 0,
      })),
    []
  );

  const columns = useMemo<DataGridColumn<GridRow>[]>(
    () => [
      {
        id: "id",
        header: "ID",
        width: 120,
        minWidth: 90,
        type: "number",
        filterable: true,
        getValue: (row) => row.id,
      },
      {
        id: "avatar",
        header: "Avatar",
        width: 130,
        type: "image",
        getValue: (row) => ({
          src: row.avatarUrl,
          alt: `Avatar de ${row.name}`,
        }),
      },
      {
        id: "name",
        header: "Nome",
        width: 280,
        minWidth: 200,
        type: "text",
        filterable: true,
        getValue: (row) => row.name,
      },
      {
        id: "email",
        header: "Email",
        width: 380,
        minWidth: 260,
        type: "text",
        filterable: true,
        getValue: (row) => row.email,
      },
      {
        id: "createdAt",
        header: "Cadastro",
        width: 240,
        minWidth: 220,
        type: "text",
        getValue: (row) => row.createdAt,
        renderFilter: ({ value, setValue }) => (
          <DateRangePicker
            idPrefix="created-at-filter"
            label="Periodo de cadastro"
            language={GRID_LOCALE_TO_CALENDAR_LANGUAGE[locale]}
            value={isDateRangeFilter(value) ? value : { start: "", end: "" }}
            onChange={(nextValue) => setValue({ start: nextValue.start, end: nextValue.end })}
            onClear={() => setValue(undefined)}
            compact
          />
        ),
        matchesFilter: (row, _rowIndex, filterValue) => {
          if (!isDateRangeFilter(filterValue)) {
            return true;
          }

          const { start, end } = filterValue;
          const hasStart = start.trim().length > 0;
          const hasEnd = end.trim().length > 0;

          if (!hasStart && !hasEnd) {
            return true;
          }

          if (hasStart && row.createdAt < start) {
            return false;
          }

          if (hasEnd && row.createdAt > end) {
            return false;
          }

          return true;
        },
      },
      {
        id: "score",
        header: "Score",
        width: 170,
        type: "number",
        filterable: true,
        getValue: (row) => row.score,
      },
      {
        id: "role",
        header: "Perfil",
        width: 180,
        type: "text",
        filterable: true,
        getValue: (row) => row.role,
      },
      {
        id: "team",
        header: "Time",
        width: 180,
        type: "text",
        filterable: true,
        getValue: (row) => row.team,
      },
      {
        id: "capabilities",
        header: "Capacidades",
        width: 220,
        type: "icon-array",
        getValue: (row) => ({
          icons: row.capabilities.map((capability, index) => {
            if (capability === "shield") {
              return <Shield key={`shield-${index}`} size={14} className="text-emerald-600" />;
            }

            if (capability === "lock") {
              return <Lock key={`lock-${index}`} size={14} className="text-blue-600" />;
            }

            return <Bell key={`bell-${index}`} size={14} className="text-amber-600" />;
          }),
        }),
      },
      {
        id: "status",
        header: "Status",
        width: 220,
        type: "custom",
        renderCell: (row) => (
          <div className="flex items-center justify-start gap-1.5">
            {row.active ? (
              <>
                <CircleCheck size={14} className="text-emerald-600" />
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Ativo
                </span>
              </>
            ) : (
              <>
                <TriangleAlert size={14} className="text-amber-600" />
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Inativo
                </span>
              </>
            )}
          </div>
        ),
      },
    ],
    [locale]
  );

  // Controle de colunas visíveis para integrar com o componente externo
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);

  // Sincroniza ids visíveis ao mudar definição das colunas
  useEffect(() => {
    setVisibleColumnIds((prev) => {
      const nextAll = columns.map((c) => String(c.id));
      // Se ainda não inicializado, ou houve mudança estrutural grande, reseta para todas
      if (prev.length === 0) return nextAll;
      const filtered = prev.filter((id) => nextAll.includes(id));
      return filtered.length > 0 ? filtered : nextAll;
    });
  }, [columns]);

  const visibleColumns = useMemo(
    () => columns.filter((c) => visibleColumnIds.includes(String(c.id))),
    [columns, visibleColumnIds]
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-[1600px] min-h-0 flex-col gap-4 p-4">
      <header className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Data Grid</h1>
            <p className="text-sm text-zinc-500">
              Grid basico com virtualizacao de linhas e ordenacao de colunas por drag and drop no header.
            </p>
          </div>
          <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">{rows.length} linhas</span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Dica: arraste os titulos para reorganizar e use a borda direita do header para redimensionar a coluna.
        </p>
        <p className="mt-1 text-xs text-zinc-500">Use o menu de contexto da linha (botao direito) para testar os toasts.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" tone="neutral" size="sm" onClick={() => dataGridRef.current?.toggleFilters()}>
            Mostrar/ocultar filtros
          </Button>
          <Button type="button" variant="outline" tone="neutral" size="sm" onClick={() => dataGridRef.current?.clearFilters()}>
            Limpar filtros
          </Button>
          <div className="mx-2 h-5 w-px bg-zinc-200" />
          <span className="text-xs font-medium text-zinc-600">Idioma:</span>
          {(["pt", "en", "es"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              onClick={() => setLocale(option)}
              variant={locale === option ? "solid" : "outline"}
              tone="neutral"
              size="sm"
              className="h-7 px-2"
            >
              {option.toUpperCase()}
            </Button>
          ))}
          <div className="mx-2 h-5 w-px bg-zinc-200" />
          {/* Controles externos do DataGrid (pode ser movido para qualquer lugar da página) */}
          <DataGridControls
            columns={columns}
            visibleColumnIds={visibleColumnIds}
            onChangeVisibleColumnIds={setVisibleColumnIds}
            locale={locale}
            tableId="demo-data-grid"
            extraItems={[
              {
                ariaLabel: enablePagination ? "Desativar paginação" : "Ativar paginação",
                tooltipContent: <DataGridPaginationTooltipContent locale={locale} enabled={enablePagination} />,
                icon: <List size={18} />,
                onClick: () => {
                  const next = !enablePagination;
                  setEnablePagination(next);
                  toast.info({
                    title: next ? "Paginação ativada" : "Paginação desativada",
                    description: next
                      ? "A tabela agora utiliza páginas para navegação."
                      : "A tabela exibe as linhas em fluxo contínuo.",
                  });
                },
              },
            ]}
          />
        </div>
      </header>

      <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-500">
          <span>Dados virtualizados</span>
          <span>Renderiza somente a janela visivel para manter performance</span>
        </div>
        <DataGrid
          ref={dataGridRef}
          data={rows}
          columns={visibleColumns}
          rowHeight={42}
          layoutMode="custom"
          locale={locale}
          rowsPerPage={25}
          enablePagination={enablePagination}
          getRowContextActions={(row) => [
            {
              id: "toast-info",
              label: "Toast info (5s)",
              onClick: () => {
                toast.info({
                  title: `Usuario ${row.id}`,
                  description: "Notificacao de informacao exibida por 5 segundos.",
                });
              },
            },
            {
              id: "toast-warn-sticky",
              label: "Toast warn (fixo)",
              onClick: () => {
                toast.warn({
                  title: `Usuario ${row.id}`,
                  description: "Alerta fixo. Feche manualmente quando finalizar.",
                  sticky: true,
                });
              },
            },
            {
              id: "toast-success",
              label: "Toast success (5s)",
              onClick: () => {
                toast.success({
                  title: `Usuario ${row.id}`,
                  description: "Acao concluida com sucesso.",
                });
              },
            },
            {
              id: "toast-custom",
              label: "Toast custom",
              onClick: () => {
                toast.custom({
                  duration: 5000,
                  render: ({ close }) => (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700">C</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-zinc-900">Toast customizado</p>
                        <p className="text-sm text-zinc-600">Usuario {row.id} com layout custom e acao propria.</p>
                      </div>
                      <Button type="button" onClick={close} variant="outline" tone="violet" size="sm">
                        Fechar
                      </Button>
                    </div>
                  ),
                });
              },
            },
          ]}
          className="rounded-none border-0"
          classNames={{
            headerWrapper: "relative z-[220] overflow-visible border-b border-zinc-200 bg-zinc-100",
            filtersWrapper:
              "relative z-[230] overflow-visible bg-zinc-50/70 will-change-[max-height,opacity,transform] transition-[max-height,opacity,transform,border-color] duration-300 ease-in-out",
            filterCell: "relative z-[240] border-r border-zinc-200 px-3 py-2 last:border-r-0",
            body: "relative z-0 min-h-0 flex-1 overflow-auto",
            row: "absolute left-0 right-0 grid border-b border-zinc-200 text-sm text-zinc-800 transition-colors hover:bg-zinc-100",
          }}
        />
      </section>
    </div>
  );
}
