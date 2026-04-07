"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Settings, X } from "lucide-react";
import type { DataGridColumn, DataGridLocale } from "./data-grid";
import { Checkbox } from "../checkbox/checkbox";
import { Tooltip } from "@/src/components/tooltip";
import { DataGridSettingsTooltipContent } from "./data-grid-settings-tooltip";

export interface DataGridControlsExtraItem {
	icon: React.ReactNode;
	ariaLabel: string;
	onClick: () => void;
	tooltipContent?: React.ReactNode;
}

export interface DataGridControlsProps<T> {
	columns: DataGridColumn<T>[];
	visibleColumnIds: string[];
	onChangeVisibleColumnIds: (nextIds: string[]) => void;
	extraItems?: DataGridControlsExtraItem[];
	tableId?: string;
	className?: string;
	iconSize?: number;
	popoverWidth?: number;
	popoverMaxVisibleItems?: number;
	locale?: DataGridLocale;
}

function joinClassNames(...classNames: Array<string | undefined | false>) {
	return classNames.filter(Boolean).join(" ");
}

export function DataGridControls<T>({
	columns,
	visibleColumnIds,
	onChangeVisibleColumnIds,
	extraItems,
	tableId,
	className,
	iconSize = 18,
	popoverWidth = 260,
	popoverMaxVisibleItems = 10,
	locale = "pt",
}: DataGridControlsProps<T>) {
	const [open, setOpen] = useState(false);
	const triggerWrapperRef = useRef<HTMLDivElement | null>(null);
	const popoverRef = useRef<HTMLDivElement | null>(null);
	const [popoverCoords, setPopoverCoords] = useState<{ left: number; top: number } | null>(null);
	const storageKey = useMemo(() => (tableId ? `data-grid:columns:${tableId}` : null), [tableId]);

	const i18n: Record<DataGridLocale, { tableSettings: string; selectAll: string; close: string; columnsButton: string }> = {
		pt: {
			tableSettings: "Configurações da tabela",
			selectAll: "Selecionar todas",
			close: "Fechar",
			columnsButton: "Configurações da tabela",
		},
		en: {
			tableSettings: "Table settings",
			selectAll: "Select all",
			close: "Close",
			columnsButton: "Table settings",
		},
		es: {
			tableSettings: "Configuración de la tabla",
			selectAll: "Seleccionar todas",
			close: "Cerrar",
			columnsButton: "Configuración de la tabla",
		},
	};
	const t = i18n[locale] ?? i18n.pt;

	// Fechar ao clicar fora ou em Escape
	useEffect(() => {
		if (!open) return;
		const handleClick = (event: MouseEvent) => {
			const t = event.target as Node | null;
			if (popoverRef.current?.contains(t as Node)) return;
			if (triggerWrapperRef.current?.contains(t as Node)) return;
			setOpen(false);
		};
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open]);

	// Posicionamento: abre ao lado (direita preferencial; cai para esquerda se não couber)
	useEffect(() => {
		if (!open) return;
		const MARGIN = 8;
		const updatePosition = () => {
			if (!triggerWrapperRef.current) return;
			const rect = triggerWrapperRef.current.getBoundingClientRect();
			// Tenta medir a altura atual do popover (após render)
			const popoverHeight = popoverRef.current?.offsetHeight ?? 0;
			const viewportW = window.innerWidth;
			const viewportH = window.innerHeight;
			const preferRight = viewportW - rect.right >= popoverWidth + MARGIN;
			const preferLeft = rect.left >= popoverWidth + MARGIN;
			let left = 0;
			if (preferRight) {
				left = Math.min(viewportW - MARGIN - popoverWidth, rect.right + MARGIN);
			} else if (preferLeft) {
				left = Math.max(MARGIN, rect.left - MARGIN - popoverWidth);
			} else {
				// Não cabe totalmente de nenhum lado: encosta no lado com mais espaço
				if (viewportW - rect.right >= rect.left) {
					left = Math.min(viewportW - MARGIN - popoverWidth, rect.right + MARGIN);
				} else {
					left = Math.max(MARGIN, rect.left - MARGIN - popoverWidth);
				}
			}
			// Alinha verticalmente ao centro do botão e ajusta para caber na viewport
			const triggerCenterY = rect.top + rect.height / 2;
			let top = Math.round(triggerCenterY - (popoverHeight > 0 ? popoverHeight / 2 : 0));
			top = Math.max(MARGIN, Math.min(top, viewportH - MARGIN - (popoverHeight > 0 ? popoverHeight : 0)));
			setPopoverCoords({ left, top });
		};
		// Primeiro cálculo
		updatePosition();
		// Recalcula em resize/scroll
		window.addEventListener("resize", updatePosition, true);
		window.addEventListener("scroll", updatePosition, true);
		// Recalcula em próximo frame para pegar altura correta pós-render
		const raf = requestAnimationFrame(updatePosition);
		return () => {
			window.removeEventListener("resize", updatePosition, true);
			window.removeEventListener("scroll", updatePosition, true);
			cancelAnimationFrame(raf);
		};
	}, [open, popoverWidth]);

	// Carrega preferências do localStorage ao montar/alterar tableId ou colunas
	useEffect(() => {
		if (!storageKey) return;
		try {
			const raw = localStorage.getItem(storageKey);
			if (!raw) return;
			const parsed = JSON.parse(raw);
			if (!Array.isArray(parsed)) return;
			const allowed = new Set(columns.map((c) => String(c.id)));
			const valid = parsed.filter((id: unknown) => typeof id === "string" && allowed.has(id));
			if (valid.length > 0) {
				onChangeVisibleColumnIds(valid);
			}
		} catch {
			// se falhar, ignora silenciosamente
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storageKey, columns]);

	// Salva preferências no localStorage quando mudar visibilidade
	useEffect(() => {
		if (!storageKey) return;
		try {
			localStorage.setItem(storageKey, JSON.stringify(visibleColumnIds));
		} catch {
			// ignore
		}
	}, [storageKey, visibleColumnIds]);

	const allIds = useMemo(() => columns.map((c) => String(c.id)), [columns]);
	const allChecked = visibleColumnIds.length === allIds.length;
	const someChecked = visibleColumnIds.length > 0 && !allChecked;

	const toggleId = (id: string) => {
		const isVisible = visibleColumnIds.includes(id);
		const next = isVisible ? visibleColumnIds.filter((x) => x !== id) : [...visibleColumnIds, id];
		// Garantir ao menos 1 coluna sempre visível
		onChangeVisibleColumnIds(next.length === 0 ? [id] : next);
	};

	const toggleAll = () => {
		onChangeVisibleColumnIds(allChecked ? [allIds[0]].filter(Boolean) : allIds);
	};

	const maxHeightItemCount = Math.max(1, popoverMaxVisibleItems);
	const showScroll = columns.length > maxHeightItemCount;

	return (
		<div className={joinClassNames("relative inline-flex items-center gap-2", className)}>
			{/* Botão de colunas */}
			<div ref={triggerWrapperRef} className="inline-flex">
				<Tooltip content={<DataGridSettingsTooltipContent locale={locale} />} side="bottom">
					<button
						type="button"
						aria-haspopup="dialog"
						aria-expanded={open}
						onClick={() => setOpen((v) => !v)}
						className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100"
					>
						<Settings size={iconSize} />
					</button>
				</Tooltip>
			</div>

			{/* Ícones extras */}
			{extraItems?.map((item, index) => {
				const content = item.tooltipContent ?? item.ariaLabel;
				return (
					<Tooltip key={index} content={content} side="bottom">
						<button
							type="button"
							aria-label={item.ariaLabel}
							onClick={item.onClick}
							className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100"
						>
							{item.icon}
						</button>
					</Tooltip>
				);
			})}

			{/* Popover */}
			{open ? (
				<div
					ref={popoverRef}
					role="dialog"
					aria-label={t.tableSettings}
					className="fixed z-[1000] w-[var(--popover-w)] rounded-md border border-zinc-200 bg-white p-2 shadow-lg"
					style={
						{
							"--popover-w": `${popoverWidth}px`,
							left: popoverCoords?.left ?? -9999,
							top: popoverCoords?.top ?? -9999,
						} as React.CSSProperties
					}
				>
					<div className="mb-2 flex items-center justify-between">
						<span className="text-sm font-semibold text-zinc-800">{t.tableSettings}</span>
						<button
							type="button"
							aria-label={t.close}
							onClick={() => setOpen(false)}
							className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-zinc-100"
						>
							<X size={16} />
						</button>
					</div>

					<div className="mb-2 flex items-center justify-between rounded-md border border-zinc-200 p-2">
						<span className="text-sm text-zinc-700">{t.selectAll}</span>
						<Checkbox
							aria-label={t.selectAll}
							checked={allChecked}
							onCheckedChange={toggleAll}
							className={someChecked ? "opacity-70" : undefined}
						/>
					</div>

					<div
						className={joinClassNames(
							"flex flex-col gap-1",
							showScroll ? "max-h-[calc(10*2.25rem)] overflow-y-auto pr-1" : undefined
						)}
						// 2.25rem ~ h-9 por item; 10 itens máx em viewport
					>
						{columns.map((col) => {
							const id = String(col.id);
							const checked = visibleColumnIds.includes(id);
							return (
								<div key={id} className="flex items-center justify-between rounded-md border border-zinc-200 p-2">
									<span className="truncate text-sm text-zinc-700">
										{col.header}
									</span>
									<Checkbox
										aria-label={`${col.header}`}
										checked={checked}
										onCheckedChange={() => toggleId(id)}
									/>
								</div>
							);
						})}
					</div>
				</div>
			) : null}
		</div>
	);
}

