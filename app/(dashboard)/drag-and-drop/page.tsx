"use client";

import { useMemo, useState } from "react";
import { DraggableList } from "@/src/components/drag-and-drop/draggable-list";

interface DragItem {
  id: number;
  title: string;
  description: string;
}

export default function DragAndDropPage() {
  const initialItems = useMemo<DragItem[]>(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        id: index + 1,
        title: `Item ${index + 1}`,
        description: `Descricao do item ${index + 1}`,
      })),
    []
  );

  const [items, setItems] = useState<DragItem[]>(initialItems);

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 p-4">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">Drag and Drop</h1>
        <p className="text-sm text-zinc-500">
          Arraste os cards para reorganizar a ordem. Este exemplo usa um componente reutilizavel.
        </p>
      </header>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <DraggableList
          items={items}
          getItemId={(item) => item.id}
          onChange={setItems}
          renderItem={(item, index, isDragging) => (
            <div
              className={`flex cursor-grab items-start justify-between rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 ${isDragging ? "cursor-grabbing bg-zinc-100" : ""}`}
            >
              <div>
                <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                <p className="text-xs text-zinc-500">{item.description}</p>
              </div>
              <span className="rounded-full bg-zinc-900 px-2 py-1 text-xs font-semibold text-white">
                #{index + 1}
              </span>
            </div>
          )}
        />
      </section>
    </div>
  );
}
