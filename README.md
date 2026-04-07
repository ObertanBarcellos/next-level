<div align="center">
  <h1>Next Level UI • Dashboard & Component Playground</h1>
  <p>Projeto em Next.js com uma coleção de componentes reutilizáveis e páginas de exemplo para acelerar a construção de dashboards modernos.</p>
</div>


## 🚀 Visão Geral

Este repositório é um playground de UI/UX para dashboards. Ele reúne:

- **Layout de dashboard** com menu lateral colapsável
- **Páginas de demonstração** para cada módulo/componente
- **Componentes reutilizáveis** (botão, input, checkbox, switch, card, calendário, data-grid, drag-and-drop, lista virtual, tooltip, toast)
- **Exemplos de gráficos** com ApexCharts
- **Infra de utilitários** para lista virtual (core, hooks, measurements)

Abra a aplicação e navegue pelo menu lateral para ver cada módulo em ação.


## 🧩 Estrutura do Projeto

```
app/
  (dashboard)/
    dashboard/            → Página principal com exemplos de gráficos
    virtual-list/         → Demo de listas virtuais
    drag-and-drop/        → Demo de arrastar e soltar
    data-grid/            → Demo de tabela com recursos
    tooltip/              → Demo de tooltips
    lucide-icons/         → Catálogo de ícones Lucide
    button/               → Showcase de botões
    input/                → Showcase de inputs
    calendar/             → Showcase de calendário
    form-manager/         → Showcase de gerenciamento de formulários
    switch-checkbox/      → Showcase de switch e checkbox
    layout.tsx            → Shell do dashboard (sidebar + conteúdo)
  page.tsx                → Redireciona para /dashboard

src/
  components/
    button/               → `Button`
    input/                → `Input`
    checkbox/             → `Checkbox`
    switch/               → `Switch`
    card/                 → `Card` (container de conteúdo)
    calendar/             → `Calendar`
    data-grid/            → `DataGrid`, `DataGridControls`, `DataGridSettingsTooltipContent`, `DataGridPaginationTooltipContent`
    drag-and-drop/        → `DraggableList`
    virtual-list/         → `VirtualList`, `VirtualListAdvanced`
    tooltip/              → `Tooltip`
    toast/                → `ToastProvider`, `index`
    menu-lateral/         → `MenuLateral`, `DashboardSidebarNav`, `DashboardSidebarShell`, `SidebarNavItem`
  core/                   → `calculateOffset`, `calculateRange` (núcleo da lista virtual)
  hooks/                  → `useVirtualList`
  measurements/           → `measureElement`
```


## 📚 Módulos e Rotas (o que você verá no menu)

- **Dashboard (`/dashboard`)**: galeria com 13 tipos de gráficos usando `react-apexcharts` (line, area, bar, stacked bar, pie, donut, radialBar, radar, polar area, scatter, bubble, heatmap, treemap, candlestick, boxPlot, rangeBar). Ideal para inspiração visual e validação de tema.
- **Virtual List (`/virtual-list`)**: exemplos de listas virtuais com alto desempenho, baseadas em `core/`, `hooks/` e `measurements/`.
- **Drag and Drop (`/drag-and-drop`)**: lista reordenável por arrastar e soltar.
- **Data Grid (`/data-grid`)**: tabela com virtualização de linhas, filtros (incluindo intervalo de datas), colunas configuráveis, paginação opcional e ações de contexto com toast.
- **Lucide Icons (`/lucide-icons`)**: vitrine de ícones para uso rápido.
- **Button (`/button`)**: variações de botões (tamanhos, tons, ícones, estados).
- **Input (`/input`)**: campos de entrada com estados e validações visuais.
- **Calendar (`/calendar`)**: seleção de datas com UI acessível.
- **Form Manager (`/form-manager`)**: utilitários/abordagem para formularização declarativa.
- **Switch e Checkbox (`/switch-checkbox`)**: controles binários com foco em acessibilidade.
- **Tooltip (`/tooltip`)**: exemplos de tooltip com conteúdo em texto e `ReactNode`, com temas claro/escuro.


## 🧱 Componentes Principais (src/components)

- **Card (`card/card.tsx`)**: contêiner padrão de páginas e seções.
- **Menu Lateral (`menu-lateral/`)**
  - `MenuLateral`: sidebar colapsável, customizável (largura, cor, conteúdo inferior).
  - `DashboardSidebarShell`: integra `MenuLateral` ao layout do dashboard.
  - `DashboardSidebarNav`: define links do menu (rotas de demonstração).
  - `SidebarNavItem`: item de navegação com ícone e label responsivo ao estado aberto/fechado.
- **Interação/Form**
  - `button/Button`: variações de botão (variant, tone, size).
  - `input/Input`: campos de texto com estados visuais.
  - `checkbox/Checkbox`, `switch/Switch`: seletores binários acessíveis.
  - `toast/ToastProvider`: provider/notificações.
- **Data e Layout**
  - `calendar/Calendar`: seleção de data.
  - `data-grid/DataGrid`: tabela com renderização virtual de linhas.
  - `data-grid/DataGridControls`: controle externo para visibilidade de colunas com persistência em `localStorage`.
  - `data-grid/DataGridSettingsTooltipContent`, `data-grid/DataGridPaginationTooltipContent`: conteúdos ricos para tooltips de ações da grade.
  - `tooltip/Tooltip`: tooltip reutilizável com posicionamento (top/bottom/left/right), conteúdo em `ReactNode` e tema `light`/`dark`.
  - `drag-and-drop/DraggableList`: lista arrastável.
  - `virtual-list/VirtualList`, `VirtualListAdvanced`: listas virtuais performáticas.


## ⚙️ Núcleo de Lista Virtual

- `core/calculateOffset.ts` e `core/calculateRange.ts`: cálculos de faixa/offset visível.
- `hooks/useVirtualList.ts`: hook de integração com componentes.
- `measurements/measureElement.ts`: utilitário de medição para itens/contêiner.

Esse trio sustenta os exemplos de `virtual-list`, permitindo renderização eficiente de listas extensas.


## 🛠️ Stack

- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS** (ver `app/globals.css`)
- **Lucide Icons**
- **ApexCharts** via `react-apexcharts` (client-only nos gráficos)


## ▶️ Rodando o projeto

```bash
# Instale as dependências
pnpm install

# Ambiente de desenvolvimento
pnpm dev

# Abra no navegador
http://localhost:3000
```


## 🧪 Scripts úteis

```bash
pnpm dev        # executar em desenvolvimento
pnpm build      # build de produção
pnpm start      # servir build de produção
```


## 🧭 Convenções de Navegação

- A rota raiz (`/`) redireciona para `/dashboard`.
- O layout do dashboard vive em `app/(dashboard)/layout.tsx`, envolvendo todas as rotas do grupo `(dashboard)` com o **sidebar** e um **Card** central.


## ➕ Como criar uma nova página de demo

1. Crie uma pasta dentro de `app/(dashboard)/nome-da-pagina/` com um `page.tsx`.
2. Adicione o link correspondente em `src/components/menu-lateral/dashboard-sidebar-nav.tsx` dentro de `DASHBOARD_LINKS`.
3. Use os componentes de `src/components/` como base para manter consistência visual.


## 📄 Licença

Uso livre para estudos, POCs e inspiração interna. Ajuste conforme a necessidade do seu time/projeto.

By `vyseinc`