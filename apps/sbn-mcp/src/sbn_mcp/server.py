from mcp.server.fastmcp import FastMCP
from .tools import dashboard, transactions, wallets, categories, recurrences, projections, wishlist

mcp = FastMCP(
    "SBN Finance",
    instructions=(
        "MCP server for the SBN personal finance system. "
        "Use these tools to query financial data (dashboard, transactions, wallets, categories, recurrences, projections, wishlist) "
        "and create/update/delete records. "
        "Transaction types use Portuguese: 'Receita' (income) and 'Despesa' (expense). "
        "Statuses: 'Pendente' (pending), 'Pago' (paid), 'Cancelado' (cancelled). "
        "All monetary values are in BRL (Brazilian Real) unless specified otherwise."
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

if __name__ == "__main__":
    mcp.run()
