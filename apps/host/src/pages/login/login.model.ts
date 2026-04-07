import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../auth/AuthProvider";
import { loginSchema, type LoginFormValues } from "./login.schema";
import type { LoginProps } from "./login.type";

export function useLoginModel(_props: LoginProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const [submitting, setSubmitting] = useState(false);
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitting(true);
    try {
      await login(data);
      toast.success("Login realizado");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar");
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

export type LoginModelOutput = ReturnType<typeof useLoginModel>;
