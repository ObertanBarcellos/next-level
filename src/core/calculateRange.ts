export function calculateRange(
    scrollOffset: number,
    itemHeight: number,
    viewportHeight: number,
    itemCount: number,
    overscan: number
  ) {
    const startIndex = Math.floor(scrollOffset / itemHeight)
  
    const visibleCount = Math.ceil(viewportHeight / itemHeight)
  
    const endIndex = Math.min(
      itemCount - 1,
      startIndex + visibleCount + overscan
    )
  
    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex
    }
  }