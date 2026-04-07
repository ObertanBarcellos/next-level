"use client"

import { useVirtualList } from "@/src/hooks/useVirtualList"

export interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem
}: VirtualListProps<T>) {
  const { range, onScroll } = useVirtualList({
    itemCount: items.length,
    itemHeight,
    height
  })

  const visibleItems = items.slice(
    range.startIndex,
    range.endIndex + 1
  )

  return (
    <div
      style={{
        height,
        width: "100%",
        overflow: "auto"
      }}
      onScroll={onScroll}
    >
      <div
        style={{
          height: items.length * itemHeight,
          width: "100%",
          position: "relative"
        }}
      >
        {visibleItems.map((item, i) => {
          const index = range.startIndex + i

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: index * itemHeight,
                height: itemHeight,
                width: "100%"
              }}
            >
              {renderItem(item, index)}
            </div>
          )
        })}
      </div>
    </div>
  )
}