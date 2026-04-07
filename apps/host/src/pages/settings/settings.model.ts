import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiKeysApi, type ApiKey } from "../../api/apiKeys";
import type { SettingsProps, SettingsState } from "./settings.type";

export function useSettingsModel(_props: SettingsProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [state, setState] = useState<SettingsState>({
    isDialogOpen: false,
    createdRawKey: null,
    formName: "",
    formExpiresAt: "",
    loading: true,
  });

  const loadKeys = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const data = await apiKeysApi.list();
      setKeys(data);
    } catch (error) {
      console.error("Erro ao carregar chaves API:", error);
      toast.error("Erro ao carregar chaves API");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiKeysApi.create(
        state.formName,
        state.formExpiresAt || undefined,
      );
      setState((prev) => ({
        ...prev,
        createdRawKey: result.key,
      }));
      toast.success("Chave API criada com sucesso!");
      loadKeys();
    } catch (error) {
      console.error("Erro ao criar chave API:", error);
      toast.error("Erro ao criar chave API");
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Tem certeza que deseja revogar esta chave?")) return;

    try {
      await apiKeysApi.revoke(id);
      toast.success("Chave revogada!");
      loadKeys();
    } catch (error) {
      console.error("Erro ao revogar chave:", error);
      toast.error("Erro ao revogar chave");
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Chave copiada!");
    } catch {
      toast.error("Erro ao copiar chave");
    }
  };

  const handleDialogClose = (open: boolean) => {
    setState((prev) => ({
      ...prev,
      isDialogOpen: open,
      createdRawKey: open ? prev.createdRawKey : null,
      formName: open ? prev.formName : "",
      formExpiresAt: open ? prev.formExpiresAt : "",
    }));
  };

  return {
    data: {
      keys,
    },
    state,
    setters: {
      setFormName: (name: string) =>
        setState((prev) => ({ ...prev, formName: name })),
      setFormExpiresAt: (expiresAt: string) =>
        setState((prev) => ({ ...prev, formExpiresAt: expiresAt })),
    },
    actions: {
      handleCreate,
      handleRevoke,
      handleCopy,
      handleDialogClose,
      onRefresh: loadKeys,
    },
  };
}

export type SettingsModelOutput = ReturnType<typeof useSettingsModel>;
