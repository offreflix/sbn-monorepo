import React from "react";
import {
  Controller,
  FormProvider,
  type ControllerFieldState,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
  type ControllerRenderProps,
  type Path,
} from "react-hook-form";
import { clsx } from "clsx";

export function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: {
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}

export function FormField<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
  name,
  form,
  render,
}: {
  name: TName;
  form: UseFormReturn<TFieldValues>;
  render: (fieldProps: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
  }) => React.ReactElement;
}) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => render({ field, fieldState })}
    />
  );
}

export const FormItem = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("space-y-2", className)} {...props} />
);

export const FormLabel = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLLabelElement>) => (
  <label
    className={clsx("text-sm font-medium text-foreground", className)}
    {...props}
  />
);

export const FormControl = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("space-y-1", className)} {...props} />
);

export const FormMessage = ({ children }: { children?: React.ReactNode }) => {
  if (!children) return null;
  return <p className="text-sm text-destructive">{children}</p>;
};
