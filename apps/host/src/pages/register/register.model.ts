import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../auth/AuthProvider";
import { registerSchema, type RegisterFormValues } from "./register.schema";
import type { RegisterProps } from "./register.type";

export function useRegisterModel(_props: RegisterProps) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const [submitting, setSubmitting] = useState(false);
  const { register: doRegister, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  const onSubmit = async (data: RegisterFormValues) => {
    setSubmitting(true);
    try {
      await doRegister(data);
      toast.success("Conta criada com sucesso");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    data: { form },
    state: { submitting },
    actions: { onSubmit },
  };
}

export type RegisterModelOutput = ReturnType<typeof useRegisterModel>;
