"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Search } from "lucide-react";
import { DynamicIcon, iconNames, type IconName } from "lucide-react/dynamic";
import { Button } from "@/src/components/button/button";
import { Input } from "@/src/components/input/input";
import { VirtualList } from "@/src/components/virtual-list/virtual-list";
import { useToast } from "@/src/components/toast";

const ROW_HEIGHT = 84;

function iconNameToComponentName(iconName: string) {
  return iconName
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function buildIconCode(iconName: IconName) {
  const componentName = iconNameToComponentName(iconName);

  return `import { ${componentName} } from "lucide-react";\n\nexport function ExampleIcon() {\n  return <${componentName} size={20} />;\n}`;
}

export default function LucideIconsPage() {
  const [query, setQuery] = useState("");
  const [listHeight, setListHeight] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState<IconName>(iconNames[0]);
  const toast = useToast();

  useEffect(() => {
    const updateHeight = () => {
      setListHeight(Math.max(320, window.innerHeight - 310));
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const filteredIcons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return iconNames;
    }

    return iconNames.filter((iconName) => {
      const componentName = iconNameToComponentName(iconName).toLowerCase();

      return (
        iconName.toLowerCase().includes(normalizedQuery) ||
        componentName.includes(normalizedQuery)
      );
    });
  }, [query]);

  const activeIcon = useMemo(() => {
    if (!filteredIcons.length) {
      return selectedIcon;
    }

    return filteredIcons.includes(selectedIcon) ? selectedIcon : filteredIcons[0];
  }, [filteredIcons, selectedIcon]);

  const selectedIconCode = useMemo(() => buildIconCode(activeIcon), [activeIcon]);

  const handleCopyIconCode = useCallback(
    async (iconName: IconName) => {
      const iconCode = buildIconCode(iconName);
      setSelectedIcon(iconName);

      try {
        await navigator.clipboard.writeText(iconCode);
        toast.success({
          title: "Codigo copiado",
          description: `Snippet do icone ${iconName} copiado para a area de transferencia.`,
        });
      } catch {
        toast.warn({
          title: "Falha ao copiar",
          description: "Nao foi possivel copiar automaticamente. Tente novamente.",
        });
      }
    },
    [toast]
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-4 p-4">
      <header className="rounded-md border border-zinc-200 bg-white p-4">
        <h1 className="text-lg font-semibold text-zinc-900">Lucide Icons</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Lista virtualizada de icones do Lucide. Clique no botao do icone para copiar o codigo de uso.
        </p>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Input
            value={query}
            onValueChange={setQuery}
            placeholder="Pesquisar por nome do icone, ex: activity"
            className="w-full max-w-xl"
            leadingIcon={<Search aria-hidden="true" size={16} />}
          />

          <div className="text-sm text-zinc-600">
            {filteredIcons.length} icones encontrados de {iconNames.length}
          </div>
        </div>
      </header>

      <section className="rounded-md border border-zinc-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-900">Exemplo de uso</h2>
          <Button
            type="button"
            onClick={() => handleCopyIconCode(activeIcon)}
            variant="icon-text"
            tone="neutral"
            size="sm"
            icon={<Copy size={14} aria-hidden="true" />}
          >
            Copiar exemplo
          </Button>
        </div>

        <div className="mb-3 flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <DynamicIcon name={activeIcon} size={20} className="text-zinc-900" />
          <span className="text-sm font-medium text-zinc-700">{activeIcon}</span>
        </div>

        <pre className="overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100">
          <code>{selectedIconCode}</code>
        </pre>
      </section>

      <section className="min-h-0 flex-1 overflow-hidden rounded-md border border-zinc-200 bg-white">
        {filteredIcons.length > 0 ? (
          <VirtualList
            items={filteredIcons}
            height={listHeight}
            itemHeight={ROW_HEIGHT}
            renderItem={(iconName) => (
              <div className="flex h-full items-center justify-between border-b border-zinc-200 px-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => handleCopyIconCode(iconName)}
                    variant="icon"
                    tone="neutral"
                    size="md"
                    aria-label={`Copiar codigo do icone ${iconName}`}
                    title="Copiar codigo"
                  >
                    <DynamicIcon name={iconName} size={18} />
                  </Button>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">{iconName}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {iconNameToComponentName(iconName)}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => handleCopyIconCode(iconName)}
                  variant="icon-text"
                  tone="neutral"
                  size="sm"
                  icon={<Copy size={14} aria-hidden="true" />}
                >
                  Copiar
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="flex h-full min-h-[320px] items-center justify-center p-6 text-center text-sm text-zinc-500">
            Nenhum icone encontrado para sua busca.
          </div>
        )}
      </section>
    </div>
  );
}
