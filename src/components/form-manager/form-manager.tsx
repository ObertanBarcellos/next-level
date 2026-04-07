"use client";

import { useCallback, useMemo, useState, type FormEvent, type ReactNode } from "react";
type FieldErrorMap<TValues extends Record<string, unknown>> = Partial<Record<keyof TValues, string>>;

type RuleValue = number | { value: number; message?: string };

export interface FieldRules<TValues extends Record<string, unknown>, TKey extends keyof TValues> {
  required?: boolean | string;
  minLength?: RuleValue;
  maxLength?: RuleValue;
  min?: RuleValue;
  max?: RuleValue;
  pattern?: { value: RegExp; message: string };
  validate?: (value: TValues[TKey], values: TValues) => string | undefined;
}

export type ValidationSchema<TValues extends Record<string, unknown>> = Partial<{
  [Key in keyof TValues]: FieldRules<TValues, Key>;
}>;

export interface UseFormManagerOptions<TValues extends Record<string, unknown>> {
  defaultValues: TValues;
  schema?: ValidationSchema<TValues>;
}

export interface SetValueOptions {
  validate?: boolean;
  touch?: boolean;
}

export interface RegisterResult<TValues extends Record<string, unknown>, TKey extends keyof TValues> {
  name: string;
  value: TValues[TKey];
  checked: boolean;
  error?: string;
  onChange: (input: unknown) => void;
  onBlur: () => void;
}

export interface FormManagerApi<TValues extends Record<string, unknown>> {
  values: TValues;
  errors: FieldErrorMap<TValues>;
  touched: Partial<Record<keyof TValues, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  register: <TKey extends keyof TValues>(name: TKey) => RegisterResult<TValues, TKey>;
  setValue: <TKey extends keyof TValues>(name: TKey, value: TValues[TKey], options?: SetValueOptions) => void;
  setValues: (nextValues: Partial<TValues>, options?: SetValueOptions) => void;
  setError: <TKey extends keyof TValues>(name: TKey, errorMessage: string) => void;
  clearError: <TKey extends keyof TValues>(name: TKey) => void;
  clearAllErrors: () => void;
  getValues: () => TValues;
  reset: (nextValues?: Partial<TValues>) => void;
  validateField: <TKey extends keyof TValues>(name: TKey) => string | undefined;
  validateForm: () => { isValid: boolean; errors: FieldErrorMap<TValues> };
  handleSubmit: (
    onValid: (values: TValues) => void | Promise<void>,
    onInvalid?: (errors: FieldErrorMap<TValues>) => void
  ) => (event?: FormEvent<HTMLFormElement>) => Promise<void>;
}

function readRuleValue(ruleValue: RuleValue | undefined) {
  if (ruleValue === undefined) {
    return null;
  }

  if (typeof ruleValue === "number") {
    return { value: ruleValue, message: undefined as string | undefined };
  }

  return { value: ruleValue.value, message: ruleValue.message };
}

function extractValueFromInput(input: unknown) {
  if (typeof input !== "object" || input === null) {
    return input;
  }

  if (!("target" in input)) {
    return input;
  }

  const target = (input as { target?: { type?: string; value?: unknown; checked?: boolean } }).target;
  if (!target) {
    return input;
  }

  if (target.type === "checkbox") {
    return Boolean(target.checked);
  }

  return target.value;
}

function hasValue(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
}

function getLength(value: unknown) {
  if (typeof value === "string" || Array.isArray(value)) {
    return value.length;
  }

  return null;
}

function getNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function useFormManager<TValues extends Record<string, unknown>>({
  defaultValues,
  schema = {},
}: UseFormManagerOptions<TValues>): FormManagerApi<TValues> {
  const [values, setInternalValues] = useState<TValues>(defaultValues);
  const [errors, setErrors] = useState<FieldErrorMap<TValues>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TValues, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runValidation = useCallback(
    <TKey extends keyof TValues>(name: TKey, nextValues: TValues) => {
      const rules = schema[name];
      if (!rules) {
        return undefined;
      }

      const value = nextValues[name];

      if (rules.required && !hasValue(value)) {
        return typeof rules.required === "string" ? rules.required : "Campo obrigatorio.";
      }

      const minLengthRule = readRuleValue(rules.minLength);
      if (minLengthRule) {
        const valueLength = getLength(value);
        if (valueLength !== null && valueLength < minLengthRule.value) {
          return minLengthRule.message ?? `Minimo de ${minLengthRule.value} caracteres.`;
        }
      }

      const maxLengthRule = readRuleValue(rules.maxLength);
      if (maxLengthRule) {
        const valueLength = getLength(value);
        if (valueLength !== null && valueLength > maxLengthRule.value) {
          return maxLengthRule.message ?? `Maximo de ${maxLengthRule.value} caracteres.`;
        }
      }

      const minRule = readRuleValue(rules.min);
      if (minRule) {
        const numericValue = getNumber(value);
        if (numericValue !== null && numericValue < minRule.value) {
          return minRule.message ?? `Valor minimo: ${minRule.value}.`;
        }
      }

      const maxRule = readRuleValue(rules.max);
      if (maxRule) {
        const numericValue = getNumber(value);
        if (numericValue !== null && numericValue > maxRule.value) {
          return maxRule.message ?? `Valor maximo: ${maxRule.value}.`;
        }
      }

      if (rules.pattern && typeof value === "string" && value.trim() && !rules.pattern.value.test(value)) {
        return rules.pattern.message;
      }

      if (rules.validate) {
        return rules.validate(value, nextValues);
      }

      return undefined;
    },
    [schema]
  );

  const updateFieldError = useCallback(<TKey extends keyof TValues>(name: TKey, errorMessage: string | undefined) => {
    setErrors((previousErrors) => {
      const currentError = previousErrors[name];

      if (currentError === errorMessage) {
        return previousErrors;
      }

      if (!errorMessage) {
        if (!(name in previousErrors)) {
          return previousErrors;
        }

        const nextErrors = { ...previousErrors };
        delete nextErrors[name];
        return nextErrors;
      }

      return { ...previousErrors, [name]: errorMessage };
    });
  }, []);

  const setValue = useCallback(
    <TKey extends keyof TValues>(name: TKey, value: TValues[TKey], options?: SetValueOptions) => {
      const shouldValidate = options?.validate ?? true;
      const shouldTouch = options?.touch ?? false;

      setInternalValues((previousValues) => {
        const hasChanged = !Object.is(previousValues[name], value);
        const nextValues = hasChanged ? { ...previousValues, [name]: value } : previousValues;

        if (shouldValidate) {
          const errorMessage = runValidation(name, nextValues);
          updateFieldError(name, errorMessage);
        }

        return nextValues;
      });

      if (shouldTouch) {
        setTouched((previousTouched) => ({ ...previousTouched, [name]: true }));
      }
    },
    [runValidation, updateFieldError]
  );

  const setValues = useCallback(
    (nextValues: Partial<TValues>, options?: SetValueOptions) => {
      const keys = Object.keys(nextValues) as Array<keyof TValues>;
      if (keys.length === 0) {
        return;
      }

      const shouldValidate = options?.validate ?? true;
      const shouldTouch = options?.touch ?? false;

      setInternalValues((previousValues) => {
        let hasAnyChange = false;
        const mergedValues = { ...previousValues };

        for (const key of keys) {
          const nextValue = nextValues[key];
          if (!Object.is(previousValues[key], nextValue)) {
            hasAnyChange = true;
            mergedValues[key] = nextValue as TValues[keyof TValues];
          }
        }

        const resolvedValues = hasAnyChange ? mergedValues : previousValues;

        if (shouldValidate) {
          for (const key of keys) {
            updateFieldError(key, runValidation(key, resolvedValues));
          }
        }

        return resolvedValues;
      });

      if (shouldTouch) {
        setTouched((previousTouched) => {
          const nextTouched = { ...previousTouched };
          for (const key of keys) {
            nextTouched[key] = true;
          }
          return nextTouched;
        });
      }
    },
    [runValidation, updateFieldError]
  );

  const register = useCallback(
    <TKey extends keyof TValues>(name: TKey): RegisterResult<TValues, TKey> => ({
      name: String(name),
      value: values[name],
      checked: Boolean(values[name]),
      error: errors[name],
      onChange: (input) => {
        const parsedValue = extractValueFromInput(input) as TValues[TKey];
        setValue(name, parsedValue);
      },
      onBlur: () => {
        setTouched((previousTouched) => ({ ...previousTouched, [name]: true }));
        updateFieldError(name, runValidation(name, values));
      },
    }),
    [errors, runValidation, setValue, updateFieldError, values]
  );

  const validateField = useCallback(
    <TKey extends keyof TValues>(name: TKey) => {
      const errorMessage = runValidation(name, values);
      updateFieldError(name, errorMessage);
      return errorMessage;
    },
    [runValidation, updateFieldError, values]
  );

  const validateForm = useCallback(() => {
    const keys = Object.keys({ ...values, ...schema }) as Array<keyof TValues>;
    const nextErrors: FieldErrorMap<TValues> = {};

    for (const key of keys) {
      const errorMessage = runValidation(key, values);
      if (errorMessage) {
        nextErrors[key] = errorMessage;
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setTouched((previousTouched) => {
        const nextTouched = { ...previousTouched };
        for (const key of keys) {
          nextTouched[key] = true;
        }
        return nextTouched;
      });
      return { isValid: false, errors: nextErrors };
    }

    return { isValid: true, errors: {} };
  }, [runValidation, schema, values]);

  const handleSubmit = useCallback(
    (onValid: (currentValues: TValues) => void | Promise<void>, onInvalid?: (nextErrors: FieldErrorMap<TValues>) => void) =>
      async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();

        const validationResult = validateForm();
        if (!validationResult.isValid) {
          onInvalid?.(validationResult.errors);
          return;
        }

        setIsSubmitting(true);
        try {
          await onValid(values);
        } finally {
          setIsSubmitting(false);
        }
      },
    [validateForm, values]
  );

  const setError = useCallback(
    <TKey extends keyof TValues>(name: TKey, errorMessage: string) => {
      updateFieldError(name, errorMessage);
    },
    [updateFieldError]
  );

  const clearError = useCallback(
    <TKey extends keyof TValues>(name: TKey) => {
      updateFieldError(name, undefined);
    },
    [updateFieldError]
  );

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getValues = useCallback(() => values, [values]);

  const reset = useCallback(
    (nextValues?: Partial<TValues>) => {
      const resolvedValues = { ...defaultValues, ...nextValues };
      setInternalValues(resolvedValues);
      setErrors({});
      setTouched({});
    },
    [defaultValues]
  );

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    register,
    setValue,
    setValues,
    setError,
    clearError,
    clearAllErrors,
    getValues,
    reset,
    validateField,
    validateForm,
    handleSubmit,
  };
}

export interface FormManagerProps<TValues extends Record<string, unknown>> extends UseFormManagerOptions<TValues> {
  className?: string;
  onSubmit: (values: TValues) => void | Promise<void>;
  onInvalidSubmit?: (errors: FieldErrorMap<TValues>) => void;
  children: (api: FormManagerApi<TValues>) => ReactNode;
}

export function FormManager<TValues extends Record<string, unknown>>({
  defaultValues,
  schema,
  className,
  onSubmit,
  onInvalidSubmit,
  children,
}: FormManagerProps<TValues>) {
  const form = useFormManager<TValues>({ defaultValues, schema });

  return (
    <form className={className} onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}>
      {children(form)}
    </form>
  );
}
