import { Badge, Button } from "@repo/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import { Plus, Key, Copy, Trash2, AlertTriangle } from "lucide-react";
import { Header } from "../../components/Header";
import type { SettingsModelOutput } from "./settings.model";

export function SettingsView({
  data: { keys },
  state: { isDialogOpen, createdRawKey, formName, formExpiresAt, loading },
  setters: { setFormName, setFormExpiresAt },
  actions: { handleCreate, handleRevoke, handleCopy, handleDialogClose },
}: SettingsModelOutput) {
  return (
    <div className="min-h-screen bg-background">
      <Header subtitle="Configurações" />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold">Chaves API</h1>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Chave API
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {createdRawKey ? "Chave Criada" : "Criar Chave API"}
                </DialogTitle>
                <DialogDescription>
                  {createdRawKey
                    ? "Copie a chave abaixo. Ela não será exibida novamente."
                    : "Crie uma nova chave de acesso para a API."}
                </DialogDescription>
              </DialogHeader>

              {createdRawKey ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500" />
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Copie agora, não será exibida novamente
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={createdRawKey}
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(createdRawKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleDialogClose(false)}>
                      Fechar
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Nome *</Label>
                    <Input
                      id="keyName"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      placeholder="Ex: MCP Claude Desktop"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">
                      Data de expiração (opcional)
                    </Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={formExpiresAt}
                      onChange={(e) => setFormExpiresAt(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDialogClose(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Criar</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">
            Carregando...
          </div>
        ) : keys.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhuma chave API criada. Crie sua primeira chave!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                      <CardDescription className="mt-1 font-mono text-xs">
                        {apiKey.keyPrefix}...
                      </CardDescription>
                    </div>
                    <Badge
                      variant={apiKey.isActive ? "default" : "destructive"}
                    >
                      {apiKey.isActive ? "Ativa" : "Revogada"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Criada em{" "}
                    {new Date(apiKey.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                  {apiKey.lastUsedAt && (
                    <div className="text-sm text-muted-foreground">
                      Último uso em{" "}
                      {new Date(apiKey.lastUsedAt).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                  {apiKey.expiresAt && (
                    <div className="text-sm text-muted-foreground">
                      Expira em{" "}
                      {new Date(apiKey.expiresAt).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                  {apiKey.isActive && (
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevoke(apiKey.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Revogar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
