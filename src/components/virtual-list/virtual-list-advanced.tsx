"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const DEFAULT_OVERSCAN = 5

interface BaseVirtualListProps<T> {
  items: T[];
  height: number;
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
  scrollTop?: number;
  onScrollSync?: (
    scrollTop: number,
    event: React.UIEvent<HTMLDivElement>
  ) => void;
  getItemKey?: (item: T, index: number) => React.Key;
}

interface FixedVirtualListProps<T> extends BaseVirtualListProps<T> {
  mode?: "fixed";
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

interface DynamicVirtualListProps<T> extends BaseVirtualListProps<T> {
  mode: "dynamic";
  estimateItemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

interface GridVirtualListProps<T> extends BaseVirtualListProps<T> {
  mode: "grid";
  columnCount: number;
  rowHeight: number;
  rowGap?: number;
  columnGap?: number;
  renderCell: (item: T, index: number) => React.ReactNode;
}

export type VirtualListAdvancedProps<T> =
  | FixedVirtualListProps<T>
  | DynamicVirtualListProps<T>
  | GridVirtualListProps<T>

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function lowerBound(values: number[], target: number) {
  let left = 0
  let right = values.length - 1

  while (left < right) {
    const middle = left + Math.floor((right - left) / 2)

    if (values[middle] < target) {
      left = middle + 1
    } else {
      right = middle
    }
  }

  return left
}

export function VirtualListAdvanced<T>(props: VirtualListAdvancedProps<T>) {
  const {
    items,
    height,
    className,
    style,
    scrollTop,
    onScrollSync,
    getItemKey
  } = props
  const overscan = props.overscan ?? DEFAULT_OVERSCAN
  const mode = props.mode ?? "fixed"

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [internalScrollTop, setInternalScrollTop] = useState(0)
  const [measurementVersion, setMeasurementVersion] = useState(0)

  const measurementCacheRef = useRef<Map<number, number>>(new Map())
  const observersRef = useRef<Map<number, ResizeObserver>>(new Map())

  const currentScrollTop = scrollTop ?? internalScrollTop
  const itemCount = items.length

  const setMeasuredSize = useCallback((index: number, nextSize: number) => {
    if (!Number.isFinite(nextSize) || nextSize <= 0) {
      return
    }

    const cache = measurementCacheRef.current
    const previousSize = cache.get(index)

    if (previousSize === nextSize) {
      return
    }

    cache.set(index, nextSize)
    setMeasurementVersion((version) => version + 1)
  }, [])

  const getDynamicSize = useCallback(
    (index: number) => {
      if (mode !== "dynamic") {
        return 0
      }

      return measurementCacheRef.current.get(index) ?? props.estimateItemHeight
    },
    [mode, props]
  )

  const prefixSums = useMemo(() => {
    if (mode !== "dynamic") {
      return null
    }

    const sums = new Array(itemCount + 1).fill(0)
    for (let index = 0; index < itemCount; index += 1) {
      sums[index + 1] = sums[index] + getDynamicSize(index)
    }

    return sums
  }, [getDynamicSize, itemCount, measurementVersion, mode])

  const dynamicRange = useMemo(() => {
    if (mode !== "dynamic" || !prefixSums || itemCount === 0) {
      return { startIndex: 0, endIndex: -1 }
    }

    const start = clamp(
      lowerBound(prefixSums, currentScrollTop) - 1 - overscan,
      0,
      itemCount - 1
    )
    const end = clamp(
      lowerBound(prefixSums, currentScrollTop + height) + overscan,
      0,
      itemCount - 1
    )

    return { startIndex: start, endIndex: end }
  }, [currentScrollTop, height, itemCount, mode, overscan, prefixSums])

  const fixedRange = useMemo(() => {
    if (mode !== "fixed" || itemCount === 0) {
      return { startIndex: 0, endIndex: -1 }
    }

    const start = clamp(
      Math.floor(currentScrollTop / props.itemHeight) - overscan,
      0,
      itemCount - 1
    )
    const end = clamp(
      Math.ceil((currentScrollTop + height) / props.itemHeight) + overscan,
      0,
      itemCount - 1
    )

    return { startIndex: start, endIndex: end }
  }, [currentScrollTop, height, itemCount, mode, overscan, props])

  const gridRange = useMemo(() => {
    if (mode !== "grid" || itemCount === 0) {
      return { startRow: 0, endRow: -1, rowCount: 0, rowSize: 0 }
    }

    const rowCount = Math.ceil(itemCount / props.columnCount)
    const rowGap = props.rowGap ?? 0
    const rowSize = props.rowHeight + rowGap
    const startRow = clamp(
      Math.floor(currentScrollTop / rowSize) - overscan,
      0,
      rowCount - 1
    )
    const endRow = clamp(
      Math.ceil((currentScrollTop + height) / rowSize) + overscan,
      0,
      rowCount - 1
    )

    return { startRow, endRow, rowCount, rowSize }
  }, [currentScrollTop, height, itemCount, mode, overscan, props])

  const totalHeight = useMemo(() => {
    if (mode === "dynamic") {
      return prefixSums?.[itemCount] ?? 0
    }

    if (mode === "grid") {
      if (gridRange.rowCount === 0) {
        return 0
      }

      const totalGaps = (props.rowGap ?? 0) * (gridRange.rowCount - 1)
      return gridRange.rowCount * props.rowHeight + totalGaps
    }

    return itemCount * props.itemHeight
  }, [gridRange.rowCount, itemCount, mode, prefixSums, props])

  const onScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const nextScrollTop = event.currentTarget.scrollTop

      if (scrollTop === undefined) {
        setInternalScrollTop(nextScrollTop)
      }

      onScrollSync?.(nextScrollTop, event)
    },
    [onScrollSync, scrollTop]
  )

  useEffect(() => {
    if (scrollTop === undefined) {
      return
    }

    setInternalScrollTop(scrollTop)

    if (containerRef.current && containerRef.current.scrollTop !== scrollTop) {
      containerRef.current.scrollTop = scrollTop
    }
  }, [scrollTop])

  useEffect(() => {
    return () => {
      observersRef.current.forEach((observer) => observer.disconnect())
      observersRef.current.clear()
    }
  }, [])

  const createMeasurementRef = useCallback(
    (index: number) => {
      return (node: HTMLDivElement | null) => {
        const existingObserver = observersRef.current.get(index)
        if (existingObserver) {
          existingObserver.disconnect()
          observersRef.current.delete(index)
        }

        if (!node || mode !== "dynamic") {
          return
        }

        setMeasuredSize(index, node.offsetHeight)

        if (typeof ResizeObserver !== "undefined") {
          const observer = new ResizeObserver((entries) => {
            const nextHeight = entries[0]?.target
              ? (entries[0].target as HTMLElement).offsetHeight
              : 0

            setMeasuredSize(index, nextHeight)
          })

          observer.observe(node)
          observersRef.current.set(index, observer)
        }
      }
    },
    [mode, setMeasuredSize]
  )

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        ...style,
        height,
        width: "100%",
        overflow: "auto"
      }}
      onScroll={onScroll}
    >
      <div
        style={{
          height: totalHeight,
          width: "100%",
          position: "relative"
        }}
      >
        {mode === "grid" &&
          Array.from({
            length: Math.max(0, gridRange.endRow - gridRange.startRow + 1)
          }).map((_, rowOffset) => {
            const rowIndex = gridRange.startRow + rowOffset
            const baseIndex = rowIndex * props.columnCount
            const top = rowIndex * gridRange.rowSize

            return (
              <div
                key={`row-${rowIndex}`}
                style={{
                  position: "absolute",
                  top,
                  left: 0,
                  right: 0,
                  display: "grid",
                  gridTemplateColumns: `repeat(${props.columnCount}, minmax(0, 1fr))`,
                  columnGap: props.columnGap ?? 0
                }}
              >
                {Array.from({ length: props.columnCount }).map(
                  (_, columnIndex) => {
                    const itemIndex = baseIndex + columnIndex

                    if (itemIndex >= itemCount) {
                      return <div key={`empty-${rowIndex}-${columnIndex}`} />
                    }

                    const item = items[itemIndex]
                    const cellKey = getItemKey
                      ? getItemKey(item, itemIndex)
                      : itemIndex

                    return (
                      <div key={cellKey} style={{ minHeight: props.rowHeight }}>
                        {props.renderCell(item, itemIndex)}
                      </div>
                    )
                  }
                )}
              </div>
            )
          })}

        {mode !== "grid" &&
          Array.from({
            length:
              mode === "dynamic"
                ? Math.max(0, dynamicRange.endIndex - dynamicRange.startIndex + 1)
                : Math.max(0, fixedRange.endIndex - fixedRange.startIndex + 1)
          }).map((_, indexOffset) => {
            const index =
              mode === "dynamic"
                ? dynamicRange.startIndex + indexOffset
                : fixedRange.startIndex + indexOffset
            const item = items[index]
            const key = getItemKey ? getItemKey(item, index) : index
            const top =
              mode === "dynamic"
                ? (prefixSums?.[index] ?? 0)
                : index * props.itemHeight
            const heightStyle =
              mode === "fixed"
                ? { height: props.itemHeight }
                : { height: measurementCacheRef.current.get(index) }

            return (
              <div
                key={key}
                ref={mode === "dynamic" ? createMeasurementRef(index) : undefined}
                style={{
                  position: "absolute",
                  top,
                  width: "100%",
                  ...heightStyle
                }}
              >
                {props.renderItem(item, index)}
              </div>
            )
          })}
      </div>
    </div>
  )
}
