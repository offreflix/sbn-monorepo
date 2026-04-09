from mcp.server.fastmcp import FastMCP
from .tools import dashboard, transactions, wallets, categories, recurrences, projections, wishlist, health

mcp = FastMCP(
    "SBN",
    instructions=(
        "MCP server for the SBN personal finance and health system. "
        "FINANCE: query financial data (dashboard, transactions, wallets, categories, recurrences, projections, wishlist) "
        "and create/update/delete records. "
        "Transaction types use Portuguese: 'Receita' (income) and 'Despesa' (expense). "
        "Statuses: 'Pendente' (pending), 'Pago' (paid), 'Cancelado' (cancelled). "
        "All monetary values are in BRL (Brazilian Real) unless specified otherwise. "
        "HEALTH: track nutrition (foods, meal logs, daily summary), water intake, body measurements, and health goals. "
        "Meal types: 'breakfast', 'lunch', 'dinner', 'snack'. "
        "Calories in kcal, macros (protein, carbs, fat) in grams, water in ml, weight in kg."
    ),
)

# Register all tool groups
dashboard.register(mcp)
transactions.register(mcp)
wallets.register(mcp)
categories.register(mcp)
recurrences.register(mcp)
projections.register(mcp)
wishlist.register(mcp)
health.register(mcp)

if __name__ == "__main__":
    mcp.run()
