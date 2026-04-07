"use client";

import type { DataGridLocale } from "./data-grid";

export interface DataGridPaginationTooltipContentProps {
	locale?: DataGridLocale;
	enabled: boolean;
}

const STRINGS: Record<DataGridLocale, { titleOn: string; titleOff: string; descriptionOn: string; descriptionOff: string; bulletsOn: string[]; bulletsOff: string[] }> = {
	pt: {
		titleOn: "Paginação ativada",
		titleOff: "Paginação desativada",
		descriptionOn: "A tabela está dividida em páginas. Use os controles para navegar entre os blocos de linhas.",
		descriptionOff: "A tabela exibe as linhas continuamente, sem divisão em páginas.",
		bulletsOn: [
			"Melhora a navegação em conjuntos grandes.",
			"Mantém desempenho estável em telas menores.",
			"Clique para desativar e ver todas as linhas em fluxo.",
		],
		bulletsOff: [
			"Ideal para varrer rapidamente os dados.",
			"Pode aumentar o scroll em listas muito grandes.",
			"Clique para ativar e dividir em páginas.",
		],
	},
	en: {
		titleOn: "Pagination enabled",
		titleOff: "Pagination disabled",
		descriptionOn: "The table is split into pages. Use the controls to navigate between row blocks.",
		descriptionOff: "The table shows rows continuously, without page breaks.",
		bulletsOn: [
			"Improves navigation on large datasets.",
			"Keeps performance steady on smaller screens.",
			"Click to disable and see rows in a continuous flow.",
		],
		bulletsOff: [
			"Ideal for quickly scanning data.",
			"May increase scrolling for very large lists.",
			"Click to enable and split into pages.",
		],
	},
	es: {
		titleOn: "Paginación activada",
		titleOff: "Paginación desactivada",
		descriptionOn: "La tabla está dividida en páginas. Usa los controles para navegar entre bloques de filas.",
		descriptionOff: "La tabla muestra filas de forma continua, sin división en páginas.",
		bulletsOn: [
			"Mejora la navegación en conjuntos grandes.",
			"Mantiene el rendimiento estable en pantallas pequeñas.",
			"Haz clic para desactivar y ver filas en flujo continuo.",
		],
		bulletsOff: [
			"Ideal para recorrer datos rápidamente.",
			"Puede aumentar el scroll en listas muy grandes.",
			"Haz clic para activar y dividir en páginas.",
		],
	},
};

export function DataGridPaginationTooltipContent({ locale = "pt", enabled }: DataGridPaginationTooltipContentProps) {
	const t = STRINGS[locale] ?? STRINGS.pt;
	const title = enabled ? t.titleOn : t.titleOff;
	const description = enabled ? t.descriptionOn : t.descriptionOff;
	const bullets = enabled ? t.bulletsOn : t.bulletsOff;
	return (
		<div className="max-w-[320px]">
			<p className="text-sm font-semibold text-zinc-900">{title}</p>
			<p className="mt-1 text-xs text-zinc-600">{description}</p>
			<ul className="mt-2 list-disc space-y-1 pl-4">
				{bullets.map((item, index) => (
					<li key={index} className="text-xs text-zinc-600">
						{item}
					</li>
				))}
			</ul>
		</div>
	);
}

