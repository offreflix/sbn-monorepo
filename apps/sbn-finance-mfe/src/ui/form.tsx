import React from 'react'
import {
  Controller,
  FormProvider,
  type ControllerFieldState,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form'
import { clsx } from 'clsx'

export function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: {
  form: UseFormReturn<TFieldValues>
  onSubmit: SubmitHandler<TFieldValues>
  children: React.ReactNode
  className?: string
}) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  )
}

export function FormField<TFieldValues extends FieldValues>({
  name,
  form,
  render,
}: {
  name: keyof TFieldValues & string
  form: UseFormReturn<TFieldValues>
  render: (fieldProps: {
    field: ReturnType<typeof form.register>
    fieldState: ControllerFieldState
  }) => React.ReactNode
}) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => render({ field, fieldState })}
    />
  )
}

export const FormItem = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('space-y-2', className)} {...props} />
)

export const FormLabel = ({ className, ...props }: React.HTMLAttributes<HTMLLabelElement>) => (
  <label className={clsx('text-sm font-medium text-foreground', className)} {...props} />
)

export const FormControl = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('space-y-1', className)} {...props} />
)

export const FormMessage = ({ children }: { children?: React.ReactNode }) => {
  if (!children) return null
  return <p className="text-sm text-destructive">{children}</p>
}

