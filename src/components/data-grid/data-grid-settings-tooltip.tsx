"use client";

import type { DataGridLocale } from "./data-grid";

export interface DataGridSettingsTooltipContentProps {
	locale?: DataGridLocale;
}

const STRINGS: Record<DataGridLocale, { title: string; description: string; bullets: string[] }> = {
	pt: {
		title: "Configurações da tabela",
		description:
			"Gerencie quais colunas deseja visualizar nesta tabela. As alterações são aplicadas imediatamente e podem ser revertidas a qualquer momento.",
		bullets: [
			"Ative ou desative colunas individuais usando os interruptores.",
			"Use “Selecionar todas” para exibir rapidamente todas as colunas.",
			"As preferências de visibilidade são locais a esta visualização.",
		],
	},
	en: {
		title: "Table settings",
		description:
			"Manage which columns you want to see in this table. Changes apply instantly and can be reverted at any time.",
		bullets: [
			"Toggle individual columns using the switches.",
			"Use “Select all” to quickly show every column.",
			"Visibility preferences are local to this view.",
		],
	},
	es: {
		title: "Configuración de la tabla",
		description:
			"Administre qué columnas desea ver en esta tabla. Los cambios se aplican al instante y pueden revertirse en cualquier momento.",
		bullets: [
			"Active o desactive columnas individuales con los interruptores.",
			"Use “Seleccionar todas” para mostrar rápidamente todas las columnas.",
			"Las preferencias de visibilidad son locales a esta vista.",
		],
	},
};

export function DataGridSettingsTooltipContent({ locale = "pt" }: DataGridSettingsTooltipContentProps) {
	const t = STRINGS[locale] ?? STRINGS.pt;
	return (
		<div className="max-w-[320px]">
			<p className="text-sm font-semibold text-zinc-900">{t.title}</p>
			<p className="mt-1 text-xs text-zinc-600">{t.description}</p>
			<ul className="mt-2 list-disc space-y-1 pl-4">
				{t.bullets.map((item, index) => (
					<li key={index} className="text-xs text-zinc-600">
						{item}
					</li>
				))}
			</ul>
		</div>
	);
}

