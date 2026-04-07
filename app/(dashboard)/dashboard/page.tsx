"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type ChartType =
  | "line"
  | "area"
  | "bar"
  | "pie"
  | "donut"
  | "radialBar"
  | "radar"
  | "polarArea"
  | "scatter"
  | "bubble"
  | "heatmap"
  | "candlestick"
  | "boxPlot"
  | "rangeBar"
  | "treemap";

interface ChartExample {
  title: string;
  type: ChartType;
  height?: number;
  options: ApexOptions;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
}

const categories = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago"];

const chartExamples: ChartExample[] = [
  {
    title: "Line",
    type: "line",
    options: {
      chart: { toolbar: { show: false } },
      xaxis: { categories },
      stroke: { curve: "smooth", width: 3 },
      dataLabels: { enabled: false },
    },
    series: [{ name: "Vendas", data: [10, 18, 14, 22, 30, 28, 35, 40] }],
  },
  {
    title: "Area",
    type: "area",
    options: {
      chart: { toolbar: { show: false } },
      xaxis: { categories },
      dataLabels: { enabled: false },
      fill: { opacity: 0.35 },
    },
    series: [{ name: "Receita", data: [22, 24, 20, 28, 26, 32, 35, 38] }],
  },
  {
    title: "Bar (Column)",
    type: "bar",
    options: {
      chart: { toolbar: { show: false } },
      xaxis: { categories },
      plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
      dataLabels: { enabled: false },
    },
    series: [{ name: "Pedidos", data: [44, 55, 41, 67, 22, 43, 21, 49] }],
  },
  {
    title: "Bar Stacked",
    type: "bar",
    options: {
      chart: { stacked: true, toolbar: { show: false } },
      xaxis: { categories },
      plotOptions: { bar: { horizontal: false } },
    },
    series: [
      { name: "Desktop", data: [30, 20, 25, 35, 28, 40, 32, 30] },
      { name: "Mobile", data: [20, 25, 18, 22, 24, 26, 28, 35] },
      { name: "Tablet", data: [8, 10, 12, 9, 7, 11, 10, 12] },
    ],
  },
  {
    title: "Pie",
    type: "pie",
    options: {
      labels: ["Tech", "Marketing", "Financeiro", "RH"],
      legend: { position: "bottom" },
    },
    series: [44, 55, 13, 33],
  },
  {
    title: "Donut",
    type: "donut",
    options: {
      labels: ["Pago", "Pendente", "Cancelado"],
      legend: { position: "bottom" },
    },
    series: [72, 21, 7],
  },
  {
    title: "RadialBar",
    type: "radialBar",
    options: {
      labels: ["Meta Atingida"],
      plotOptions: {
        radialBar: {
          hollow: { size: "55%" },
          dataLabels: {
            name: { show: true },
            value: { fontSize: "20px" },
          },
        },
      },
    },
    series: [76],
  },
  {
    title: "Radar",
    type: "radar",
    options: {
      labels: ["Qualidade", "Velocidade", "Custo", "Escala", "Suporte", "UX"],
    },
    series: [
      { name: "Produto A", data: [80, 50, 30, 40, 100, 20] },
      { name: "Produto B", data: [20, 30, 40, 80, 20, 80] },
    ],
  },
  {
    title: "Polar Area",
    type: "polarArea",
    options: {
      labels: ["Norte", "Sul", "Leste", "Oeste", "Centro"],
      legend: { position: "bottom" },
    },
    series: [14, 23, 21, 17, 15],
  },
  {
    title: "Scatter",
    type: "scatter",
    options: {
      chart: { zoom: { enabled: true, type: "xy" } },
      xaxis: { tickAmount: 10, labels: { formatter: (val) => `${Number(val).toFixed(0)}` } },
      yaxis: { tickAmount: 7 },
    },
    series: [
      { name: "Grupo A", data: [[5, 20], [8, 30], [12, 18], [15, 36], [20, 22]] },
      { name: "Grupo B", data: [[3, 8], [6, 14], [10, 28], [18, 26], [24, 35]] },
    ],
  },
  {
    title: "Bubble",
    type: "bubble",
    options: {
      dataLabels: { enabled: false },
      fill: { opacity: 0.85 },
      xaxis: { tickAmount: 12 },
    },
    series: [
      {
        name: "Projetos",
        data: [
          [10, 40, 12],
          [20, 30, 20],
          [30, 35, 16],
          [40, 45, 25],
          [50, 55, 18],
        ],
      },
    ],
  },
  {
    title: "Heatmap",
    type: "heatmap",
    options: {
      dataLabels: { enabled: false },
      xaxis: { labels: { rotate: 0 } },
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          colorScale: {
            ranges: [
              { from: 0, to: 30, name: "baixo", color: "#60a5fa" },
              { from: 31, to: 70, name: "medio", color: "#fbbf24" },
              { from: 71, to: 100, name: "alto", color: "#f87171" },
            ],
          },
        },
      },
    },
    series: [
      { name: "Seg", data: [{ x: "09h", y: 42 }, { x: "12h", y: 64 }, { x: "18h", y: 73 }] },
      { name: "Ter", data: [{ x: "09h", y: 28 }, { x: "12h", y: 51 }, { x: "18h", y: 60 }] },
      { name: "Qua", data: [{ x: "09h", y: 31 }, { x: "12h", y: 45 }, { x: "18h", y: 82 }] },
    ],
  },
  {
    title: "Treemap",
    type: "treemap",
    options: {
      legend: { show: false },
    },
    series: [
      {
        data: [
          { x: "Google", y: 218 },
          { x: "Amazon", y: 149 },
          { x: "Apple", y: 184 },
          { x: "Meta", y: 55 },
          { x: "Netflix", y: 84 },
          { x: "Nvidia", y: 31 },
        ],
      },
    ],
  },
  {
    title: "Candlestick",
    type: "candlestick",
    options: {
      xaxis: { type: "datetime" },
      yaxis: { tooltip: { enabled: true } },
    },
    series: [
      {
        data: [
          { x: new Date("2026-03-01"), y: [51, 56, 50, 54] },
          { x: new Date("2026-03-02"), y: [54, 57, 52, 53] },
          { x: new Date("2026-03-03"), y: [53, 55, 49, 50] },
          { x: new Date("2026-03-04"), y: [50, 58, 48, 57] },
          { x: new Date("2026-03-05"), y: [57, 59, 55, 56] },
        ],
      },
    ],
  },
  {
    title: "BoxPlot",
    type: "boxPlot",
    options: {
      xaxis: { type: "category" },
      plotOptions: { bar: { horizontal: false } },
    },
    series: [
      {
        data: [
          { x: "A", y: [54, 66, 69, 75, 88] },
          { x: "B", y: [43, 65, 69, 76, 81] },
          { x: "C", y: [31, 39, 45, 51, 59] },
          { x: "D", y: [39, 46, 55, 65, 71] },
        ],
      },
    ],
  },
  {
    title: "RangeBar",
    type: "rangeBar",
    options: {
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
        },
      },
      xaxis: { type: "numeric" },
    },
    series: [
      {
        data: [
          { x: "Planejamento", y: [1, 4] },
          { x: "Execucao", y: [3, 9] },
          { x: "QA", y: [8, 11] },
          { x: "Deploy", y: [10, 12] },
        ],
      },
    ],
  },
];

export default function DashboardPage() {
  return (
    <div className="h-full w-full overflow-auto bg-zinc-100 p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">Exemplos de graficos com dados mockados usando ApexCharts.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {chartExamples.map((chart) => (
          <section key={chart.title} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-zinc-700">{chart.title}</h2>
            <Chart
              options={chart.options}
              series={chart.series}
              type={chart.type}
              height={chart.height ?? 280}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
