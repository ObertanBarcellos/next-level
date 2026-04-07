"use client";

import { FormManager, type ValidationSchema } from "@/src/components/form-manager/form-manager";
import { Input, type InputOption } from "@/src/components/input/input";
import { Checkbox } from "@/src/components/checkbox/checkbox";
import { Switch } from "@/src/components/switch/switch";
import { Button } from "@/src/components/button/button";
import { useToast } from "@/src/components/toast";

interface ContactFormValues {
  name: string;
  email: string;
  age: string;
  role: string;
  city: string;
  stacks: string[];
  terms: boolean;
  newsletter: boolean;
}

const roleOptions: InputOption[] = [
  { label: "Frontend", value: "frontend" },
  { label: "Backend", value: "backend" },
  { label: "Full Stack", value: "fullstack" },
  { label: "Mobile", value: "mobile" },
];

const stackOptions: InputOption[] = [
  { label: "Next.js", value: "nextjs" },
  { label: "React", value: "react" },
  { label: "Node.js", value: "nodejs" },
  { label: "TypeScript", value: "typescript" },
  { label: "PostgreSQL", value: "postgresql" },
];

const defaultValues: ContactFormValues = {
  name: "",
  email: "",
  age: "",
  role: "",
  city: "",
  stacks: [],
  terms: false,
  newsletter: false,
};

const schema: ValidationSchema<ContactFormValues> = {
  name: {
    required: "Informe o nome.",
    minLength: { value: 3, message: "Nome precisa de pelo menos 3 caracteres." },
  },
  email: {
    required: "Informe o email.",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Email invalido.",
    },
  },
  age: {
    required: "Informe a idade.",
    min: { value: 16, message: "Idade minima: 16 anos." },
    max: { value: 120, message: "Idade maxima: 120 anos." },
  },
  role: {
    required: "Selecione um perfil.",
  },
  city: {
    required: "Informe a cidade.",
  },
  stacks: {
    minLength: { value: 1, message: "Selecione ao menos uma tecnologia." },
  },
  terms: {
    required: "Voce precisa aceitar os termos.",
  },
};

export default function FormManagerPage() {
  const toast = useToast();

  return (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col gap-4 overflow-auto p-4">
      <header className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Form Manager</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Componente com API inspirada no react-hook-form: schema, validacoes, register, errors e manipulacao de valores.
        </p>
      </header>

      <FormManager<ContactFormValues>
        className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
        defaultValues={defaultValues}
        schema={schema}
        onSubmit={(values) => {
          toast.success({
            title: "Formulario enviado",
            description: `Dados validos para ${values.name}.`,
          });
        }}
        onInvalidSubmit={() => {
          toast.warn({
            title: "Erros de validacao",
            description: "Revise os campos destacados e tente novamente.",
          });
        }}
      >
        {(form) => {
          const nameField = form.register("name");
          const emailField = form.register("email");
          const ageField = form.register("age");
          const roleField = form.register("role");
          const cityField = form.register("city");
          const termsField = form.register("terms");
          const newsletterField = form.register("newsletter");

          return (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Input
                    id="contact-name"
                    label="Nome"
                    placeholder="Seu nome"
                    value={nameField.value}
                    onValueChange={nameField.onChange}
                  />
                  {nameField.error ? <p className="mt-1 text-xs text-red-600">{nameField.error}</p> : null}
                </div>

                <div>
                  <Input
                    id="contact-email"
                    label="Email"
                    type="email"
                    placeholder="voce@empresa.com"
                    value={emailField.value}
                    onValueChange={emailField.onChange}
                  />
                  {emailField.error ? <p className="mt-1 text-xs text-red-600">{emailField.error}</p> : null}
                </div>

                <div>
                  <Input
                    id="contact-age"
                    label="Idade"
                    type="number"
                    placeholder="Ex: 30"
                    value={ageField.value}
                    onValueChange={ageField.onChange}
                  />
                  {ageField.error ? <p className="mt-1 text-xs text-red-600">{ageField.error}</p> : null}
                </div>

                <div>
                  <Input
                    id="contact-role"
                    label="Perfil"
                    variant="select"
                    options={roleOptions}
                    value={roleField.value}
                    onValueChange={roleField.onChange}
                    selectPlaceholder="Selecione um perfil"
                  />
                  {roleField.error ? <p className="mt-1 text-xs text-red-600">{roleField.error}</p> : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Input
                    id="contact-city"
                    label="Cidade"
                    variant="autocomplete"
                    placeholder="Digite para buscar"
                    value={cityField.value}
                    onValueChange={cityField.onChange}
                    options={[
                      { label: "Sao Paulo", value: "sao-paulo" },
                      { label: "Rio de Janeiro", value: "rio-de-janeiro" },
                      { label: "Belo Horizonte", value: "belo-horizonte" },
                      { label: "Curitiba", value: "curitiba" },
                    ]}
                  />
                  {cityField.error ? <p className="mt-1 text-xs text-red-600">{cityField.error}</p> : null}
                </div>

                <div>
                  <Input
                    label="Stacks"
                    variant="select2"
                    placeholder="Selecione as tecnologias"
                    options={stackOptions}
                    selectedValues={form.values.stacks}
                    onSelectedValuesChange={(nextStacks) => form.setValue("stacks", nextStacks)}
                  />
                  {form.errors.stacks ? <p className="mt-1 text-xs text-red-600">{form.errors.stacks}</p> : null}
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-md border border-zinc-200 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2">
                  <Checkbox
                    id="contact-terms"
                    label="Aceito os termos de uso"
                    checked={termsField.checked}
                    onCheckedChange={(checkedValue) => form.setValue("terms", checkedValue)}
                  />
                  {termsField.error ? <p className="text-xs text-red-600">{termsField.error}</p> : null}
                </div>

                <Switch
                  id="contact-newsletter"
                  label="Receber newsletter"
                  checked={newsletterField.checked}
                  onCheckedChange={(checkedValue) => form.setValue("newsletter", checkedValue)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" tone="blue">
                  Enviar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Resetar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    form.setValues({
                      name: "Maria Silva",
                      email: "maria@empresa.com",
                      age: "30",
                      role: "fullstack",
                      city: "Sao Paulo",
                      stacks: ["nextjs", "typescript"],
                      terms: true,
                    })
                  }
                >
                  Preencher exemplo
                </Button>
              </div>

              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Estado atual do formulario</p>
                <pre className="mt-2 overflow-x-auto text-xs text-zinc-700">
                  {JSON.stringify(
                    {
                      isSubmitting: form.isSubmitting,
                      isValid: form.isValid,
                      values: form.values,
                      errors: form.errors,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          );
        }}
      </FormManager>
    </div>
  );
}
