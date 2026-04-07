import { useState } from "react"
import { calculateRange } from "../core/calculateRange"

export interface UseVirtualListProps {
  itemCount: number;
  itemHeight: number;
  height: number;
  overscan?: number;
}

export function useVirtualList({
  itemCount,
  itemHeight,
  height,
  overscan = 5
}: UseVirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0)

  const range = calculateRange(
    scrollTop,
    itemHeight,
    height,
    itemCount,
    overscan
  )

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return {
    range,
    scrollTop,
    onScroll
  }
}