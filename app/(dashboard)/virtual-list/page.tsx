"use client";

import { useEffect, useMemo, useState } from "react";
import { VirtualList } from "@/src/components/virtual-list/virtual-list";
import { VirtualListAdvanced } from "@/src/components/virtual-list/virtual-list-advanced";

export default function VirtualListPage() {
  const [listHeight, setListHeight] = useState(0);

  const mockItems = useMemo(
    () =>
      Array.from({ length: 100000 }, (_, index) => ({
        id: index + 1,
        title: `Item ${index + 1}`,
        description: `Descricao do item ${index + 1}`,
        details:
          "Texto adicional para variar a altura do card e demonstrar medicao dinamica.".repeat(
            (index % 3) + 1
          ),
      })),
    []
  );

  useEffect(() => {
    const updateHeight = () => {
      setListHeight(Math.max(320, window.innerHeight - 180));
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-4 p-4">
      <div className="grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="flex min-h-0 flex-col">
          <h2 className="mb-2 text-sm font-semibold text-zinc-900">Virtual List (Original)</h2>
          <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-zinc-200 bg-white">
            {listHeight > 0 ? (
              <VirtualList
                items={mockItems}
                height={listHeight}
                itemHeight={84}
                renderItem={(item, index) => (
                  <div className="flex h-full w-full items-center border-b border-zinc-200 bg-white px-4">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-900">{item.title}</span>
                      <span className="text-xs text-zinc-500">{item.description}</span>
                    </div>
                  </div>
                )}
              />
            ) : null}
          </div>
        </section>

        <section className="flex min-h-0 flex-col">
          <h2 className="mb-2 text-sm font-semibold text-zinc-900">Virtual List (Advanced)</h2>
          <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-zinc-200 bg-white">
            {listHeight > 0 ? (
              <VirtualListAdvanced
                mode="dynamic"
                items={mockItems}
                height={listHeight}
                estimateItemHeight={92}
                getItemKey={(item) => item.id}
                renderItem={(item, index) => (
                  <div className="w-full border-b border-zinc-200 bg-white px-4 py-3">
                    <div className="mb-1 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white">
                        {index + 1}
                      </div>
                      <span className="text-sm font-semibold text-zinc-900">{item.title}</span>
                    </div>
                    <p className="text-xs text-zinc-500">{item.description}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">{item.details}</p>
                  </div>
                )}
              />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
