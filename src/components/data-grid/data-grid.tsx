"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/src/components/button/button";

type ColumnId = string;
type NumberLocale = "pt-BR" | "en-US" | "es-ES";
type SortDirection = "asc" | "desc";
type DataGridFilterValue = string | number | boolean | Date | Record<string, unknown> | null | undefined;

export type DataGridLocale = "pt" | "en" | "es";
export type DataGridLayoutMode = "balanced" | "custom";

export type DataGridCellKind = "text" | "number" | "image" | "icon-array" | "custom";

export interface DataGridImageCell {
  src: string;
  alt?: string;
}

export interface DataGridIconArrayCell {
  icons: React.ReactNode[];
}

export type DataGridCellValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | React.ReactNode
  | DataGridImageCell
  | DataGridIconArrayCell;

export interface DataGridColumn<T> {
  id: ColumnId;
  header: string;
  width?: number | string;
  minWidth?: number | string;
  type?: DataGridCellKind;
  getValue?: (row: T, rowIndex: number) => DataGridCellValue;
  getSortValue?: (row: T, rowIndex: number) => DataGridCellValue;
  getFilterValue?: (row: T, rowIndex: number) => DataGridFilterValue;
  filterable?: boolean;
  filterPlaceholder?: string;
  renderFilter?: (params: DataGridFilterRenderParams<T>) => React.ReactNode;
  matchesFilter?: (row: T, rowIndex: number, filterValue: DataGridFilterValue) => boolean;
  renderCell?: (row: T, rowIndex: number) => React.ReactNode;
}

export interface DataGridFilterRenderParams<T> {
  column: DataGridColumn<T>;
  value: DataGridFilterValue;
  setValue: (nextValue: DataGridFilterValue) => void;
  clear: () => void;
}

export interface DataGridRowContextAction<T> {
  id: string;
  label: string;
  onClick: (row: T, rowIndex: number) => void;
}

export interface DataGridProps<T> {
  data: T[];
  columns: DataGridColumn<T>[];
  pinnedColumnIds?: string[];
  layoutMode?: DataGridLayoutMode;
  rowHeight?: number;
  overscan?: number;
  rowsPerPage?: number;
  enablePagination?: boolean;
  className?: string;
  locale?: DataGridLocale;
  classNames?: Partial<DataGridClassNames>;
  translations?: Partial<DataGridTranslations>;
  getRowContextActions?: (row: T, rowIndex: number) => DataGridRowContextAction<T>[];
  showFiltersByDefault?: boolean;
}

export interface DataGridRef {
  openFilters: () => void;
  closeFilters: () => void;
  toggleFilters: () => void;
  clearFilters: () => void;
}

interface DataGridClassNames {
  root: string;
  headerWrapper: string;
  headerGrid: string;
  headerCell: string;
  dragHandle: string;
  resizeHandle: string;
  body: string;
  row: string;
  cell: string;
  image: string;
  iconArray: string;
  emptyState: string;
  pagination: string;
  paginationInfo: string;
  paginationControls: string;
  paginationButton: string;
  paginationButtonDisabled: string;
  contextMenu: string;
  contextMenuItem: string;
  filtersWrapper: string;
  filtersGrid: string;
  filterCell: string;
  filterInputWrapper: string;
  filterInput: string;
  filterClearButton: string;
}

interface DataGridTranslations {
  imageAlt: string;
  booleanTrue: string;
  booleanFalse: string;
  emptyState: string;
  pageLabel: (currentPage: number, totalPages: number) => string;
  rowsInfo: (startRow: number, endRow: number, totalRows: number) => string;
  previousPageLabel: string;
  nextPageLabel: string;
  resizeColumnAriaLabel: (columnHeader: string) => string;
  filterInputAriaLabel: (columnHeader: string) => string;
  filterInputPlaceholder: (columnHeader: string) => string;
  clearFilterAriaLabel: (columnHeader: string) => string;
}

const DEFAULT_LOCALE_TEXTS: Record<DataGridLocale, DataGridTranslations> = {
  pt: {
    imageAlt: "Imagem",
    booleanTrue: "Sim",
    booleanFalse: "Nao",
    emptyState: "Nenhum registro encontrado.",
    pageLabel: (currentPage, totalPages) => `Pagina ${currentPage} de ${totalPages}`,
    rowsInfo: (startRow, endRow, totalRows) => `${startRow}-${endRow} de ${totalRows}`,
    previousPageLabel: "Anterior",
    nextPageLabel: "Proxima",
    resizeColumnAriaLabel: (columnHeader) => `Redimensionar coluna ${columnHeader}`,
    filterInputAriaLabel: (columnHeader) => `Filtrar coluna ${columnHeader}`,
    filterInputPlaceholder: () => "Filtrar...",
    clearFilterAriaLabel: (columnHeader) => `Limpar filtro da coluna ${columnHeader}`,
  },
  en: {
    imageAlt: "Image",
    booleanTrue: "Yes",
    booleanFalse: "No",
    emptyState: "No records found.",
    pageLabel: (currentPage, totalPages) => `Page ${currentPage} of ${totalPages}`,
    rowsInfo: (startRow, endRow, totalRows) => `${startRow}-${endRow} of ${totalRows}`,
    previousPageLabel: "Previous",
    nextPageLabel: "Next",
    resizeColumnAriaLabel: (columnHeader) => `Resize column ${columnHeader}`,
    filterInputAriaLabel: (columnHeader) => `Filter column ${columnHeader}`,
    filterInputPlaceholder: () => "Filter...",
    clearFilterAriaLabel: (columnHeader) => `Clear filter for column ${columnHeader}`,
  },
  es: {
    imageAlt: "Imagen",
    booleanTrue: "Si",
    booleanFalse: "No",
    emptyState: "No se encontraron registros.",
    pageLabel: (currentPage, totalPages) => `Pagina ${currentPage} de ${totalPages}`,
    rowsInfo: (startRow, endRow, totalRows) => `${startRow}-${endRow} de ${totalRows}`,
    previousPageLabel: "Anterior",
    nextPageLabel: "Siguiente",
    resizeColumnAriaLabel: (columnHeader) => `Cambiar tamano de columna ${columnHeader}`,
    filterInputAriaLabel: (columnHeader) => `Filtrar columna ${columnHeader}`,
    filterInputPlaceholder: () => "Filtrar...",
    clearFilterAriaLabel: (columnHeader) => `Limpiar filtro de la columna ${columnHeader}`,
  },
};

const NUMBER_LOCALE_MAP: Record<DataGridLocale, NumberLocale> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

const DEFAULT_CLASSNAMES: DataGridClassNames = {
  root: "flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white",
  headerWrapper: "overflow-hidden border-b border-zinc-200 bg-zinc-50/90",
  headerGrid: "grid select-none",
  headerCell:
    "relative flex cursor-grab items-center justify-between gap-2 border-r border-zinc-200 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-700 last:border-r-0",
  dragHandle: "text-zinc-400",
  resizeHandle: "absolute -right-1 top-0 z-20 h-full w-2 cursor-col-resize bg-transparent",
  body: "min-h-0 flex-1 overflow-auto",
  row: "absolute left-0 right-0 grid border-b border-zinc-100 text-sm text-zinc-800 transition-colors hover:bg-zinc-50",
  cell: "border-r border-zinc-100 px-3 py-2.5 last:border-r-0",
  image: "h-8 w-8 rounded-full object-cover",
  iconArray: "flex items-center gap-1",
  emptyState: "flex h-full items-center justify-center px-4 text-sm text-zinc-500",
  pagination: "flex items-center justify-between gap-3 border-t border-zinc-200 bg-white px-3 py-2",
  paginationInfo: "text-xs text-zinc-600",
  paginationControls: "flex items-center gap-2",
  paginationButton:
    "rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50",
  paginationButtonDisabled: "cursor-not-allowed opacity-50 hover:bg-white",
  contextMenu:
    "fixed z-50 min-w-44 overflow-hidden rounded-md border border-zinc-200 bg-white py-1 shadow-lg",
  contextMenuItem:
    "block w-full px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100",
  filtersWrapper:
    "overflow-hidden bg-zinc-50/70 will-change-[max-height,opacity,transform] transition-[max-height,opacity,transform,border-color] duration-300 ease-in-out",
  filtersGrid: "grid",
  filterCell: "border-r border-zinc-200 px-3 py-2 last:border-r-0",
  filterInputWrapper: "relative",
  filterInput:
    "h-8 w-full rounded-md border border-zinc-200 bg-white px-2 pr-7 text-xs text-zinc-700 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400",
  filterClearButton:
    "absolute right-1 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700",
};

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(" ");
}

function reorderColumns<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function resolveColumnWidth(width?: number | string) {
  if (typeof width === "number") {
    return `${width}px`;
  }

  if (typeof width === "string" && width.trim().length > 0) {
    return width;
  }

  return "minmax(160px, 1fr)";
}

function resolveMinWidth(minWidth?: number | string) {
  if (typeof minWidth === "number") {
    return `${minWidth}px`;
  }

  if (typeof minWidth === "string" && minWidth.trim().length > 0) {
    return minWidth;
  }

  return undefined;
}

function extractPixelWidth(value?: number | string) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  const pxMatch = /^([0-9]+(?:\.[0-9]+)?)px$/.exec(normalized);
  if (pxMatch) {
    return Number(pxMatch[1]);
  }

  const minMaxPxMatch = /^minmax\(\s*([0-9]+(?:\.[0-9]+)?)px\s*,/.exec(normalized);
  if (minMaxPxMatch) {
    return Number(minMaxPxMatch[1]);
  }

  return null;
}

function resolvePinnedColumnWidth(width?: number | string, minWidth?: number | string) {
  const widthPx = extractPixelWidth(width);
  const minWidthPx = extractPixelWidth(minWidth);

  if (widthPx !== null && minWidthPx !== null) {
    return Math.max(widthPx, minWidthPx);
  }

  if (widthPx !== null) {
    return widthPx;
  }

  if (minWidthPx !== null) {
    return minWidthPx;
  }

  return 160;
}

function resolveColumnWidthByLayout(layoutMode: DataGridLayoutMode, width?: number | string, minWidth?: number | string) {
  const resolvedMinWidth = resolveMinWidth(minWidth);

  if (typeof width === "number") {
    if (typeof minWidth === "number") {
      return `${Math.max(width, minWidth)}px`;
    }

    if (resolvedMinWidth) {
      return `minmax(${resolvedMinWidth}, ${width}px)`;
    }

    return `${width}px`;
  }

  if (typeof width === "string" && width.trim().length > 0) {
    const normalizedWidth = width.trim();

    // Avoid invalid nested tracks like minmax(220px, minmax(200px, 1fr)).
    if (normalizedWidth.startsWith("minmax(")) {
      return normalizedWidth;
    }

    if (resolvedMinWidth) {
      return `minmax(${resolvedMinWidth}, ${normalizedWidth})`;
    }

    return normalizedWidth;
  }

  if (layoutMode === "custom") {
    if (resolvedMinWidth) {
      return `minmax(${resolvedMinWidth}, 180px)`;
    }

    return "180px";
  }

  return `minmax(${resolvedMinWidth ?? "160px"}, 1fr)`;
}

function isNumericValue(value: React.ReactNode) {
  return typeof value === "number";
}

function isImageCell(value: DataGridCellValue): value is DataGridImageCell {
  return typeof value === "object" && value !== null && "src" in value;
}

function isIconArrayCell(value: DataGridCellValue): value is DataGridIconArrayCell {
  return typeof value === "object" && value !== null && "icons" in value;
}

function getCellValue<T>(column: DataGridColumn<T>, row: T, rowIndex: number) {
  if (column.renderCell) {
    return column.renderCell(row, rowIndex);
  }

  if (column.getValue) {
    return column.getValue(row, rowIndex);
  }

  return null;
}

function renderCellContent<T>(
  column: DataGridColumn<T>,
  row: T,
  rowIndex: number,
  options: {
    numberLocale: NumberLocale;
    translations: DataGridTranslations;
    classNames: DataGridClassNames;
  }
) {
  const value = getCellValue(column, row, rowIndex);

  if (column.type === "custom") {
    return value as React.ReactNode;
  }

  if (column.type === "image") {
    if (isImageCell(value)) {
      return (
        <img
          src={value.src}
          alt={value.alt ?? options.translations.imageAlt}
          className={options.classNames.image}
          loading="lazy"
        />
      );
    }

    if (typeof value === "string") {
      return (
        <img
          src={value}
          alt={options.translations.imageAlt}
          className={options.classNames.image}
          loading="lazy"
        />
      );
    }
  }

  if (column.type === "icon-array") {
    if (isIconArrayCell(value)) {
      return <div className={options.classNames.iconArray}>{value.icons}</div>;
    }
  }

  if (column.type === "number") {
    if (typeof value === "number") {
      return value.toLocaleString(options.numberLocale);
    }

    return value as React.ReactNode;
  }

  if (typeof value === "boolean") {
    return value ? options.translations.booleanTrue : options.translations.booleanFalse;
  }

  return value as React.ReactNode;
}

function getSortableValue<T>(column: DataGridColumn<T>, row: T, rowIndex: number) {
  if (column.getSortValue) {
    return column.getSortValue(row, rowIndex);
  }

  if (column.getValue) {
    return column.getValue(row, rowIndex);
  }

  return null;
}

function normalizeSortValue(value: DataGridCellValue) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (typeof value === "string") {
    return value;
  }

  if (isImageCell(value)) {
    return value.alt ?? value.src;
  }

  if (isIconArrayCell(value)) {
    return value.icons.length;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return null;
}

function compareSortValues(
  leftValue: DataGridCellValue,
  rightValue: DataGridCellValue,
  collator: Intl.Collator
) {
  const left = normalizeSortValue(leftValue);
  const right = normalizeSortValue(rightValue);

  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return collator.compare(String(left), String(right));
}

function defaultMatchesFilter(candidateValue: DataGridFilterValue, filterValue: DataGridFilterValue, collator: Intl.Collator) {
  if (
    filterValue === null ||
    filterValue === undefined ||
    (typeof filterValue === "string" && filterValue.trim().length === 0)
  ) {
    return true;
  }

  const normalizedCandidate = normalizeSortValue(candidateValue as DataGridCellValue);
  if (normalizedCandidate === null) {
    return false;
  }

  if (filterValue instanceof Date) {
    if (typeof normalizedCandidate === "number") {
      const candidateDate = new Date(normalizedCandidate).toISOString().slice(0, 10);
      const filterDate = filterValue.toISOString().slice(0, 10);
      return candidateDate === filterDate;
    }
    return String(normalizedCandidate) === filterValue.toISOString().slice(0, 10);
  }

  if (typeof filterValue === "number") {
    return Number(normalizedCandidate) === filterValue;
  }

  if (typeof filterValue === "boolean") {
    return Boolean(normalizedCandidate) === filterValue;
  }

  const candidateText = String(normalizedCandidate);
  const filterText = String(filterValue).trim();
  if (filterText.length === 0) {
    return true;
  }

  if (collator.compare(candidateText, filterText) === 0) {
    return true;
  }

  return candidateText.toLocaleLowerCase().includes(filterText.toLocaleLowerCase());
}

function resolveFilterCandidateValue(value: DataGridCellValue): DataGridFilterValue {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "object") {
    if (isImageCell(value)) {
      return value.alt ?? value.src;
    }

    if (isIconArrayCell(value)) {
      return value.icons.length;
    }

    if (!Array.isArray(value)) {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
  }

  return String(value);
}

function DataGridInner<T>(
  {
  data,
  columns,
  pinnedColumnIds = [],
  layoutMode = "balanced",
  rowHeight = 44,
  overscan = 6,
  rowsPerPage = 25,
  enablePagination = true,
  className,
  locale = "pt",
  classNames,
  translations,
  getRowContextActions,
  showFiltersByDefault = false,
}: DataGridProps<T>,
  ref: React.ForwardedRef<DataGridRef>
) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const headerCellRefs = useRef<Record<ColumnId, HTMLDivElement | null>>({});
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const resizeStateRef = useRef<{
    columnId: ColumnId;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollResetVersion, setScrollResetVersion] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [resizingColumnId, setResizingColumnId] = useState<ColumnId | null>(null);

  const [orderedColumns, setOrderedColumns] = useState(columns);
  const [draggingColumnId, setDraggingColumnId] = useState<ColumnId | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<ColumnId | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState<{ columnId: ColumnId; direction: SortDirection } | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(showFiltersByDefault);
  const [filterValuesByColumn, setFilterValuesByColumn] = useState<Record<ColumnId, DataGridFilterValue>>({});
  const [contextMenuState, setContextMenuState] = useState<{
    x: number;
    y: number;
    row: T;
    rowIndex: number;
    actions: DataGridRowContextAction<T>[];
  } | null>(null);

  useEffect(() => {
    setOrderedColumns(columns);
  }, [columns]);

  const pinnedColumnIdSet = useMemo(() => {
    const available = new Set(columns.map((column) => String(column.id)));
    return new Set(pinnedColumnIds.filter((id) => available.has(String(id))));
  }, [columns, pinnedColumnIds]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) {
      return;
    }

    const syncViewport = () => {
      setViewportHeight(node.clientHeight);
      setScrollbarWidth(node.offsetWidth - node.clientWidth);
    };
    syncViewport();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", syncViewport);
      return () => window.removeEventListener("resize", syncViewport);
    }

    const observer = new ResizeObserver(() => syncViewport());
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (scrollResetVersion === 0) {
      return;
    }
    const viewportNode = viewportRef.current;
    if (viewportNode) {
      viewportNode.scrollTop = 0;
    }
  }, [scrollResetVersion]);

  useEffect(() => {
    if (!resizingColumnId) {
      return;
    }

    const onMouseMove = (event: MouseEvent) => {
      const state = resizeStateRef.current;
      if (!state) {
        return;
      }

      const delta = event.clientX - state.startX;
      const nextWidth = Math.max(80, Math.round(state.startWidth + delta));

      setOrderedColumns((current) =>
        current.map((column) => (column.id === state.columnId ? { ...column, width: nextWidth } : column))
      );
    };

    const onMouseUp = () => {
      resizeStateRef.current = null;
      setResizingColumnId(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [resizingColumnId]);

  useEffect(() => {
    const handleGlobalPointerDown = (event: PointerEvent) => {
      if (event.button === 2) {
        return;
      }

      const target = event.target as Node | null;
      if (contextMenuRef.current && target && contextMenuRef.current.contains(target)) {
        return;
      }

      setContextMenuState(null);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContextMenuState(null);
      }
    };
    const handleWindowBlur = () => setContextMenuState(null);

    window.addEventListener("pointerdown", handleGlobalPointerDown);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("pointerdown", handleGlobalPointerDown);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  const collator = useMemo(
    () =>
      new Intl.Collator(NUMBER_LOCALE_MAP[locale], {
        numeric: true,
        sensitivity: "base",
      }),
    [locale]
  );
  useImperativeHandle(
    ref,
    () => ({
      openFilters: () => setIsFiltersOpen(true),
      closeFilters: () => setIsFiltersOpen(false),
      toggleFilters: () => setIsFiltersOpen((current) => !current),
      clearFilters: () => {
        setFilterValuesByColumn({});
        setCurrentPage(1);
        setScrollTop(0);
        if (viewportRef.current) {
          viewportRef.current.scrollTop = 0;
        }
      },
    }),
    []
  );
  const filteredData = useMemo(() => {
    const activeFilters = orderedColumns.filter((column) => {
      const value = filterValuesByColumn[column.id];
      if (value === null || value === undefined) {
        return false;
      }

      if (typeof value === "string") {
        return value.trim().length > 0;
      }

      return true;
    });
    if (activeFilters.length === 0) {
      return data;
    }

    return data.filter((row, rowIndex) =>
      activeFilters.every((column) => {
        const filterValue = filterValuesByColumn[column.id];
        if (column.matchesFilter) {
          return column.matchesFilter(row, rowIndex, filterValue);
        }

        const candidate: DataGridFilterValue = column.getFilterValue
          ? column.getFilterValue(row, rowIndex)
          : column.getValue
            ? resolveFilterCandidateValue(column.getValue(row, rowIndex))
            : null;

        return defaultMatchesFilter(candidate, filterValue, collator);
      })
    );
  }, [collator, data, filterValuesByColumn, orderedColumns]);
  const sortedData = useMemo(() => {
    if (!sortState) {
      return filteredData;
    }

    const sortedColumn = orderedColumns.find((column) => column.id === sortState.columnId);
    if (!sortedColumn) {
      return filteredData;
    }

    const next = filteredData.map((row, originalIndex) => ({ row, originalIndex }));
    next.sort((leftItem, rightItem) => {
      const leftValue = getSortableValue(sortedColumn, leftItem.row, leftItem.originalIndex);
      const rightValue = getSortableValue(sortedColumn, rightItem.row, rightItem.originalIndex);
      const comparison = compareSortValues(leftValue, rightValue, collator);

      if (comparison === 0) {
        return leftItem.originalIndex - rightItem.originalIndex;
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    });

    return next.map((item) => item.row);
  }, [collator, filteredData, orderedColumns, sortState]);
  const safeRowsPerPage = Math.max(1, Math.floor(rowsPerPage));
  const totalPages = enablePagination ? Math.max(1, Math.ceil(sortedData.length / safeRowsPerPage)) : 1;

  useEffect(() => {
    setCurrentPage((page) => Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  const pageStartIndex = enablePagination ? (currentPage - 1) * safeRowsPerPage : 0;
  const pageEndExclusive = enablePagination
    ? Math.min(sortedData.length, pageStartIndex + safeRowsPerPage)
    : sortedData.length;
  const pageData = enablePagination ? sortedData.slice(pageStartIndex, pageEndExclusive) : sortedData;

  const displayColumns = useMemo(() => {
    const pinned = orderedColumns.filter((column) => pinnedColumnIdSet.has(String(column.id)));
    const normal = orderedColumns.filter((column) => !pinnedColumnIdSet.has(String(column.id)));
    return [...pinned, ...normal];
  }, [orderedColumns, pinnedColumnIdSet]);
  const gridTemplateColumns = useMemo(
    () => displayColumns.map((column) => resolveColumnWidthByLayout(layoutMode, column.width, column.minWidth)).join(" "),
    [displayColumns, layoutMode]
  );
  const gridTrackWidths = useMemo(
    () => displayColumns.map((column) => resolveColumnWidthByLayout(layoutMode, column.width, column.minWidth)),
    [displayColumns, layoutMode]
  );
  const resolvedFixedTrackWidths = useMemo(
    () => displayColumns.map((column) => resolveColumnWidth(column.width)),
    [displayColumns]
  );
  const pinnedColumnOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let accumulated = 0;
    for (const column of displayColumns) {
      const id = String(column.id);
      if (!pinnedColumnIdSet.has(id)) {
        continue;
      }
      offsets[id] = accumulated;
      accumulated += resolvePinnedColumnWidth(column.width, column.minWidth);
    }
    return offsets;
  }, [displayColumns, pinnedColumnIdSet]);
  const gridContentWidth = useMemo(() => {
    if (layoutMode !== "custom") {
      return "100%";
    }

    const hasFluidTrack = gridTrackWidths.some((track) => track.includes("fr") || track.includes("minmax("));
    if (hasFluidTrack) {
      return "max-content";
    }

    const totalPixels = resolvedFixedTrackWidths.reduce((total, track) => {
      const match = /^([0-9]+(?:\.[0-9]+)?)px$/.exec(track.trim());
      return match ? total + Number(match[1]) : total;
    }, 0);

    return `${Math.max(totalPixels, 1)}px`;
  }, [gridTrackWidths, layoutMode, resolvedFixedTrackWidths]);
  const numberLocale = NUMBER_LOCALE_MAP[locale];
  const mergedTranslations = useMemo(
    () => ({
      ...DEFAULT_LOCALE_TEXTS[locale],
      ...translations,
    }),
    [locale, translations]
  );
  const mergedClassNames = useMemo(
    () => ({
      ...DEFAULT_CLASSNAMES,
      ...classNames,
    }),
    [classNames]
  );

  const totalHeight = pageData.length * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex =
    pageData.length === 0
      ? -1
      : Math.min(pageData.length - 1, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan);
  const visibleRows = endIndex >= startIndex ? pageData.slice(startIndex, endIndex + 1) : [];

  const moveColumn = (fromId: ColumnId, toId: ColumnId) => {
    if (fromId === toId) {
      return;
    }

    setOrderedColumns((current) => {
      const fromIndex = current.findIndex((column) => column.id === fromId);
      const toIndex = current.findIndex((column) => column.id === toId);

      if (fromIndex < 0 || toIndex < 0) {
        return current;
      }

      return reorderColumns(current, fromIndex, toIndex);
    });
  };

  const resetViewportToTop = () => {
    setScrollTop(0);
    setScrollResetVersion((current) => current + 1);
  };

  return (
    <div className={joinClassNames(mergedClassNames.root, className)}>
      <div className={mergedClassNames.headerWrapper} style={{ paddingRight: scrollbarWidth }}>
        <div
          className={mergedClassNames.headerGrid}
          style={{
            gridTemplateColumns,
            width: gridContentWidth,
            minWidth: layoutMode === "custom" ? "max-content" : "100%",
            transform: `translateX(-${scrollLeft}px)`,
          }}
        >
          {displayColumns.map((column) => {
            const isDragging = draggingColumnId === column.id;
            const isDragOver = dragOverColumnId === column.id;
            const pinnedOffset = pinnedColumnOffsets[String(column.id)];
            const isPinnedColumn = pinnedOffset !== undefined;

            return (
              <div
                key={column.id}
                ref={(node) => {
                  headerCellRefs.current[column.id] = node;
                }}
                draggable={resizingColumnId === null}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  setDraggingColumnId(column.id);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  if (!isDragOver) {
                    setDragOverColumnId(column.id);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggingColumnId) {
                    moveColumn(draggingColumnId, column.id);
                  }
                  setDragOverColumnId(null);
                }}
                onDragEnd={() => {
                  setDraggingColumnId(null);
                  setDragOverColumnId(null);
                }}
                onClick={(event) => {
                  if (resizingColumnId !== null) {
                    return;
                  }

                  const target = event.target as HTMLElement | null;
                  if (target?.closest("button")) {
                    return;
                  }

                  setSortState((current) => {
                    if (current?.columnId === column.id) {
                      return {
                        columnId: column.id,
                        direction: current.direction === "asc" ? "desc" : "asc",
                      };
                    }

                    return {
                      columnId: column.id,
                      direction: "asc",
                    };
                  });
                  setCurrentPage(1);
                  resetViewportToTop();
                }}
                className={joinClassNames(
                  mergedClassNames.headerCell,
                  isDragOver && "bg-zinc-200/70",
                  isDragging && "cursor-grabbing opacity-70"
                )}
                style={
                  isPinnedColumn
                    ? {
                        transform: `translateX(${scrollLeft}px)`,
                        zIndex: 40,
                        backgroundColor: isDragOver ? "rgb(228 228 231)" : "rgb(244 244 245)",
                      }
                    : undefined
                }
              >
                <span className="flex min-w-0 items-center gap-1">
                  <span className="truncate">{column.header}</span>
                  {sortState?.columnId === column.id ? (
                    <span aria-hidden>{sortState.direction === "asc" ? "▲" : "▼"}</span>
                  ) : null}
                </span>
                <span className={mergedClassNames.dragHandle}>::</span>
                <Button
                  type="button"
                  variant="icon-plain"
                  tone="neutral"
                  aria-label={mergedTranslations.resizeColumnAriaLabel(column.header)}
                  onDragStart={(event) => event.preventDefault()}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    const node = headerCellRefs.current[column.id];
                    const startWidth = node?.getBoundingClientRect().width ?? 160;

                    resizeStateRef.current = {
                      columnId: column.id,
                      startX: event.clientX,
                      startWidth,
                    };
                    setResizingColumnId(column.id);
                  }}
                  className={mergedClassNames.resizeHandle}
                />
              </div>
            );
          })}
        </div>
        <div
          className={joinClassNames(
            mergedClassNames.filtersWrapper,
            isFiltersOpen
              ? "max-h-24 translate-y-0 opacity-100 border-t border-zinc-200"
              : "max-h-0 -translate-y-1 opacity-0 border-transparent"
          )}
          aria-hidden={!isFiltersOpen}
        >
          <div className={isFiltersOpen ? "" : "pointer-events-none"}>
            <div
              className={mergedClassNames.filtersGrid}
              style={{
                gridTemplateColumns,
                width: gridContentWidth,
                minWidth: layoutMode === "custom" ? "max-content" : "100%",
                transform: `translateX(-${scrollLeft}px)`,
              }}
            >
              {displayColumns.map((column) => {
                const currentFilterValue = filterValuesByColumn[column.id];
                const hasFilterValue =
                  currentFilterValue !== null &&
                  currentFilterValue !== undefined &&
                  !(typeof currentFilterValue === "string" && currentFilterValue.trim().length === 0);
                const pinnedOffset = pinnedColumnOffsets[String(column.id)];
                const isPinnedColumn = pinnedOffset !== undefined;

                return (
                  <div
                    key={`${column.id}-filter`}
                    className={mergedClassNames.filterCell}
                    style={
                      isPinnedColumn
                        ? {
                            transform: `translateX(${scrollLeft}px)`,
                            zIndex: 35,
                            backgroundColor: "rgb(250 250 250)",
                          }
                        : undefined
                    }
                  >
                    {column.renderFilter ? (
                      column.renderFilter({
                        column,
                        value: currentFilterValue,
                        setValue: (nextValue) => {
                          setFilterValuesByColumn((current) => ({
                            ...current,
                            [column.id]: nextValue,
                          }));
                          setCurrentPage(1);
                          resetViewportToTop();
                        },
                        clear: () => {
                          setFilterValuesByColumn((current) => ({
                            ...current,
                            [column.id]: undefined,
                          }));
                          setCurrentPage(1);
                          resetViewportToTop();
                        },
                      })
                    ) : column.filterable ? (
                      <div className={mergedClassNames.filterInputWrapper}>
                        <input
                          type={column.type === "number" ? "number" : "text"}
                          value={currentFilterValue === null || currentFilterValue === undefined ? "" : String(currentFilterValue)}
                          onChange={(event) => {
                            const nextRawValue = event.target.value;
                            const nextValue =
                              column.type === "number" && nextRawValue.length > 0 ? Number(nextRawValue) : nextRawValue;
                            setFilterValuesByColumn((current) => ({
                              ...current,
                              [column.id]: nextValue,
                            }));
                            setCurrentPage(1);
                            resetViewportToTop();
                          }}
                          className={mergedClassNames.filterInput}
                          aria-label={mergedTranslations.filterInputAriaLabel(column.header)}
                          placeholder={column.filterPlaceholder ?? mergedTranslations.filterInputPlaceholder(column.header)}
                        />
                        {hasFilterValue ? (
                          <button
                            type="button"
                            className={mergedClassNames.filterClearButton}
                            aria-label={mergedTranslations.clearFilterAriaLabel(column.header)}
                            onClick={() => {
                              setFilterValuesByColumn((current) => ({
                                ...current,
                                [column.id]: undefined,
                              }));
                              setCurrentPage(1);
                              resetViewportToTop();
                            }}
                          >
                            ×
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={viewportRef}
        className={mergedClassNames.body}
        onScroll={(event) => {
          setScrollTop(event.currentTarget.scrollTop);
          setScrollLeft(event.currentTarget.scrollLeft);
        }}
      >
        {pageData.length === 0 ? <div className={mergedClassNames.emptyState}>{mergedTranslations.emptyState}</div> : null}
        <div
          className="relative w-full"
          style={{
            height: totalHeight,
            width: gridContentWidth,
            minWidth: layoutMode === "custom" ? "max-content" : "100%",
          }}
        >
          {visibleRows.map((row, offset) => {
            const rowIndexInPage = startIndex + offset;
            const rowIndex = pageStartIndex + rowIndexInPage;

            return (
              <div
                key={rowIndex}
                className={joinClassNames(
                  mergedClassNames.row,
                  rowIndexInPage % 2 === 0 ? "bg-white" : "bg-zinc-50/40"
                )}
                onContextMenu={(event) => {
                  if (!getRowContextActions) {
                    return;
                  }

                  const actions = getRowContextActions(row, rowIndex);
                  if (actions.length === 0) {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  const maxX = window.innerWidth - 220;
                  const maxY = window.innerHeight - 180;
                  setContextMenuState({
                    x: Math.max(8, Math.min(event.clientX, maxX)),
                    y: Math.max(8, Math.min(event.clientY, maxY)),
                    row,
                    rowIndex,
                    actions,
                  });
                }}
                style={{
                  top: rowIndexInPage * rowHeight,
                  height: rowHeight,
                  gridTemplateColumns,
                  width: gridContentWidth,
                }}
              >
                {displayColumns.map((column) => {
                  const cellValue = getCellValue(column, row, rowIndex);
                  const content = renderCellContent(column, row, rowIndex, {
                    numberLocale,
                    translations: mergedTranslations,
                    classNames: mergedClassNames,
                  });
                  const isNumericColumn = column.type === "number" || isNumericValue(cellValue as React.ReactNode);
                  const isFlexibleCell =
                    column.type === "image" || column.type === "icon-array" || column.type === "custom";
                  const pinnedOffset = pinnedColumnOffsets[String(column.id)];
                  const isPinnedColumn = pinnedOffset !== undefined;
                  const stripedBackground = rowIndexInPage % 2 === 0 ? "#ffffff" : "rgb(250 250 250)";

                  return (
                    <div
                      key={column.id}
                      className={joinClassNames(
                        mergedClassNames.cell,
                        isFlexibleCell ? "" : "truncate",
                        isNumericColumn ? "text-right tabular-nums" : ""
                      )}
                      style={
                        isPinnedColumn
                          ? {
                              position: "sticky",
                              left: pinnedOffset,
                              zIndex: 20,
                              backgroundColor: stripedBackground,
                            }
                          : undefined
                      }
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {contextMenuState && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={contextMenuRef}
              className={mergedClassNames.contextMenu}
              style={{ top: contextMenuState.y, left: contextMenuState.x }}
              onClick={(event) => event.stopPropagation()}
              onContextMenu={(event) => event.preventDefault()}
            >
              {contextMenuState.actions.map((action) => (
                <Button
                  key={action.id}
                  type="button"
                  variant="icon-plain"
                  tone="neutral"
                  className={joinClassNames(mergedClassNames.contextMenuItem, "h-auto justify-start rounded-none")}
                  onClick={() => {
                    action.onClick(contextMenuState.row, contextMenuState.rowIndex);
                    setContextMenuState(null);
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>,
            document.body
          )
        : null}

      {enablePagination ? (
        <div className={mergedClassNames.pagination}>
          <span className={mergedClassNames.paginationInfo}>
            {sortedData.length > 0
              ? mergedTranslations.rowsInfo(pageStartIndex + 1, pageEndExclusive, sortedData.length)
              : mergedTranslations.rowsInfo(0, 0, 0)}
          </span>
          <div className={mergedClassNames.paginationControls}>
            <span className={mergedClassNames.paginationInfo}>{mergedTranslations.pageLabel(currentPage, totalPages)}</span>
            <Button
              type="button"
              variant="outline"
              tone="neutral"
              size="sm"
              onClick={() => {
                setCurrentPage((page) => Math.max(1, page - 1));
                resetViewportToTop();
              }}
              disabled={currentPage <= 1}
              className={joinClassNames(
                mergedClassNames.paginationButton,
                currentPage <= 1 && mergedClassNames.paginationButtonDisabled
              )}
            >
              {mergedTranslations.previousPageLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              tone="neutral"
              size="sm"
              onClick={() => {
                setCurrentPage((page) => Math.min(totalPages, page + 1));
                resetViewportToTop();
              }}
              disabled={currentPage >= totalPages}
              className={joinClassNames(
                mergedClassNames.paginationButton,
                currentPage >= totalPages && mergedClassNames.paginationButtonDisabled
              )}
            >
              {mergedTranslations.nextPageLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type DataGridComponent = {
  <T>(props: DataGridProps<T> & { ref?: React.Ref<DataGridRef> }): React.ReactElement;
  displayName?: string;
};

export const DataGrid = forwardRef(DataGridInner) as DataGridComponent;

DataGrid.displayName = "DataGrid";
