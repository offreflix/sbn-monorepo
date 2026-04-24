import {
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  LayoutGrid,
} from "lucide-react";
import { CreateCategoryModal } from "../../components/create-category-modal";
import type { CategoriesModelOutput } from "./categories.model";

export function CategoriesView({
  data: { categories, totalCount, incomeCount, expenseCount },
  state: {
    isCreateModalOpen,
    editingCategory,
    deletingCategory,
    isDeleting,
    filter,
    hasTitle = true,
  },
  setters: {
    setIsCreateModalOpen,
    setEditingCategory,
    setDeletingCategory,
    setFilter,
  },
  actions: { handleDelete, onRefresh },
}: CategoriesModelOutput) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header da Página */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {hasTitle ? (
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Categorias
            </h2>
            <p className="text-muted-foreground mt-1">
              Organize suas fontes de receita e despesas
            </p>
          </div>
        ) : (
          <div />
        )}
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 h-10 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Categoria</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </header>

      {/* Barra de Filtros */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar border-b border-border/50">
        <Button
          variant={filter === "all" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
          className="rounded-b-none border-b-2 border-transparent data-[active=true]:border-primary transition-all"
          data-active={filter === "all"}
        >
          <LayoutGrid className="h-4 w-4 mr-2 opacity-70" />
          Todas ({totalCount})
        </Button>
        <Button
          variant={filter === "Receita" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("Receita")}
          className="rounded-b-none border-b-2 border-transparent data-[active=true]:border-emerald-500 transition-all"
          data-active={filter === "Receita"}
        >
          <TrendingUp
            className={`h-4 w-4 mr-2 ${filter === "Receita" ? "text-emerald-500" : "text-emerald-500/70"}`}
          />
          Receitas ({incomeCount})
        </Button>
        <Button
          variant={filter === "Despesa" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("Despesa")}
          className="rounded-b-none border-b-2 border-transparent data-[active=true]:border-red-500 transition-all"
          data-active={filter === "Despesa"}
        >
          <TrendingDown
            className={`h-4 w-4 mr-2 ${filter === "Despesa" ? "text-red-500" : "text-red-500/70"}`}
          />
          Despesas ({expenseCount})
        </Button>
      </div>

      {/* Grade de Categorias */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-4 pt-2">
        {categories.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-card border border-dashed rounded-xl text-muted-foreground">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-foreground text-lg mb-1">
              Nenhuma categoria encontrada
            </h4>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {filter === "all"
                ? "Crie sua primeira categoria para começar a organizar suas finanças."
                : `Você ainda não possui categorias do tipo "${filter.toLowerCase()}".`}
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Criar Categoria
            </Button>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="bg-card border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all duration-300 group relative flex flex-col items-center text-center"
            >
              {/* Botões de Ação (Visíveis no mobile, Hover no Desktop) */}
              {!category.isDefault && (
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => setEditingCategory(category)}
                    title="Editar categoria"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeletingCategory(category)}
                    title="Excluir categoria"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* Ícone e Cor */}
              <div
                className="flex h-14 w-14 mt-2 mb-3 items-center justify-center rounded-2xl text-2xl shadow-sm transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: `${category.color || "#3b82f6"}20`,
                  color: category.color || "#3b82f6",
                }}
              >
                {category.icon || "🏷️"}
              </div>

              {/* Informações Textuais */}
              <div className="flex flex-col items-center gap-1.5 w-full">
                <p
                  className="font-semibold text-sm text-foreground truncate w-full px-2"
                  title={category.name}
                >
                  {category.name}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {/* Badge de Tipo */}
                  <div
                    className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      category.type === "Receita"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {category.type === "Receita" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {category.type}
                  </div>

                  {/* Badge de Padrão */}
                  {category.isDefault && (
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full border">
                      Padrão
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modais de Criação e Edição */}
      <CreateCategoryModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          onRefresh();
        }}
      />

      <CreateCategoryModal
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        initialData={editingCategory ?? undefined}
        onSuccess={() => {
          setEditingCategory(null);
          onRefresh();
        }}
      />

      {/* Confirmação de Exclusão */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Excluir Categoria
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria{" "}
              <strong className="text-foreground">
                {deletingCategory?.name}
              </strong>
              ? As transações que já utilizam essa categoria{" "}
              <strong>não</strong> serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-[100px]"
            >
              {isDeleting ? "Excluindo..." : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
