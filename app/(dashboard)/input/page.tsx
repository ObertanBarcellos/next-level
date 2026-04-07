"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input, type InputOption } from "@/src/components/input/input";

const frameworkOptions: InputOption[] = [
  { label: "Next.js", value: "nextjs" },
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
];

export default function InputPage() {
  const [search, setSearch] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [city, setCity] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["react", "nextjs"]);

  return (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col gap-5 overflow-auto p-5">
      <header className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Input</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Componente unificado com suporte para input por type, select, autocomplete, select2 e customizacao visual.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">Input Types</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Texto" type="text" placeholder="Digite seu nome" />
          <Input label="Email" type="email" placeholder="voce@empresa.com" />
          <Input label="Senha" type="password" placeholder="********" />
          <Input label="Numero" type="number" placeholder="0" />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">Select</h2>
        <Input
          id="framework"
          label="Framework"
          variant="select"
          options={frameworkOptions}
          value={selectedFramework}
          onValueChange={setSelectedFramework}
          selectPlaceholder="Escolha um framework"
          helperText={selectedFramework ? `Selecionado: ${selectedFramework}` : "Nenhuma opcao selecionada"}
        />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">Autocomplete</h2>
        <Input
          id="city"
          label="Cidade"
          variant="autocomplete"
          placeholder="Digite para buscar"
          value={city}
          onValueChange={setCity}
          options={[
            { label: "Sao Paulo", value: "sao-paulo" },
            { label: "Rio de Janeiro", value: "rio-de-janeiro" },
            { label: "Belo Horizonte", value: "belo-horizonte" },
            { label: "Curitiba", value: "curitiba" },
            { label: "Porto Alegre", value: "porto-alegre" },
          ]}
        />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">Select2 (multi select)</h2>
        <Input
          label="Tecnologias"
          variant="select2"
          placeholder="Buscar tecnologia e adicionar"
          options={frameworkOptions}
          selectedValues={selectedTags}
          onSelectedValuesChange={setSelectedTags}
        />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-700">Customizacao</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Busca com icone"
            placeholder="Buscar componente"
            value={search}
            onValueChange={setSearch}
            leadingIcon={<Search size={16} />}
          />
          <Input
            label="Input customizado"
            placeholder="Com border e fundo customizados"
            fieldClassName="border-violet-200 bg-violet-50 focus:border-violet-500 focus:ring-violet-200/80"
            helperText="Exemplo de customizacao via fieldClassName"
          />
        </div>
      </section>
    </div>
  );
}
