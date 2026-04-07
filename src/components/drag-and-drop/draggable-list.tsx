"use client";

import { useEffect, useState } from "react";

type ItemId = string | number;

export interface DraggableListProps<T> {
  items: T[];
  getItemId: (item: T) => ItemId;
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
  onChange?: (items: T[]) => void;
  className?: string;
}

function reorderItems<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);

  nextItems.splice(toIndex, 0, movedItem);

  return nextItems;
}

export function DraggableList<T>({
  items,
  getItemId,
  renderItem,
  onChange,
  className,
}: DraggableListProps<T>) {
  const [localItems, setLocalItems] = useState(items);
  const [draggingId, setDraggingId] = useState<ItemId | null>(null);
  const [dragOverId, setDragOverId] = useState<ItemId | null>(null);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const moveItem = (fromId: ItemId, toId: ItemId) => {
    if (fromId === toId) {
      return;
    }

    const fromIndex = localItems.findIndex((item) => getItemId(item) === fromId);
    const toIndex = localItems.findIndex((item) => getItemId(item) === toId);

    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const nextItems = reorderItems(localItems, fromIndex, toIndex);
    setLocalItems(nextItems);
    onChange?.(nextItems);
  };

  return (
    <ul className={className ?? "space-y-2"}>
      {localItems.map((item, index) => {
        const itemId = getItemId(item);
        const isDragging = draggingId === itemId;
        const isDragOver = dragOverId === itemId;

        return (
          <li
            key={String(itemId)}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              setDraggingId(itemId);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";

              if (!isDragOver) {
                setDragOverId(itemId);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();

              if (draggingId !== null) {
                moveItem(draggingId, itemId);
              }

              setDragOverId(null);
            }}
            onDragEnd={() => {
              setDraggingId(null);
              setDragOverId(null);
            }}
            className={`rounded-md transition-all ${isDragOver ? "ring-2 ring-zinc-400" : ""} ${isDragging ? "opacity-70" : ""}`}
          >
            {renderItem(item, index, isDragging)}
          </li>
        );
      })}
    </ul>
  );
}
