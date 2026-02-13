import json
from mcp.server.fastmcp import FastMCP
from ..client import api_request
from ..utils import convert_keys_to_camel


def register(mcp: FastMCP):
    @mcp.tool()
    async def list_wallets() -> str:
        """List all wallets for the authenticated user."""
        result = await api_request("GET", "/api/finance/wallets")
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def get_wallet(id: str) -> str:
        """Get a single wallet by ID.

        Args:
            id: The wallet UUID.
        """
        result = await api_request("GET", f"/api/finance/wallets/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def create_wallet(
        name: str,
        type: str,
        balance: float | None = None,
        currency: str | None = None,
        limit: float | None = None,
        invoice_closing_day: int | None = None,
        invoice_due_day: int | None = None,
        is_active: bool | None = None,
    ) -> str:
        """Create a new wallet.

        Args:
            name: Wallet name.
            type: Wallet type — "Conta Corrente", "Poupança", "Cartão de Crédito", "Investimento", "Dinheiro", or "Outro".
            balance: Initial balance.
            currency: Currency code (e.g. "BRL").
            limit: Credit limit (for credit cards).
            invoice_closing_day: Day of month the invoice closes (1-31).
            invoice_due_day: Day of month the invoice is due (1-31).
            is_active: Whether the wallet is active.
        """
        body = convert_keys_to_camel({
            "name": name,
            "type": type,
            "balance": balance,
            "currency": currency,
            "limit": limit,
            "invoice_closing_day": invoice_closing_day,
            "invoice_due_day": invoice_due_day,
            "is_active": is_active,
        })
        result = await api_request("POST", "/api/finance/wallets", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def update_wallet(
        id: str,
        name: str | None = None,
        type: str | None = None,
        balance: float | None = None,
        currency: str | None = None,
        limit: float | None = None,
        invoice_closing_day: int | None = None,
        invoice_due_day: int | None = None,
        is_active: bool | None = None,
    ) -> str:
        """Update an existing wallet.

        Args:
            id: The wallet UUID.
            name: Wallet name.
            type: Wallet type.
            balance: Balance amount.
            currency: Currency code.
            limit: Credit limit.
            invoice_closing_day: Invoice closing day (1-31).
            invoice_due_day: Invoice due day (1-31).
            is_active: Whether the wallet is active.
        """
        body = convert_keys_to_camel({
            "name": name,
            "type": type,
            "balance": balance,
            "currency": currency,
            "limit": limit,
            "invoice_closing_day": invoice_closing_day,
            "invoice_due_day": invoice_due_day,
            "is_active": is_active,
        })
        result = await api_request("PATCH", f"/api/finance/wallets/{id}", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def delete_wallet(id: str) -> str:
        """Delete a wallet by ID.

        Args:
            id: The wallet UUID.
        """
        result = await api_request("DELETE", f"/api/finance/wallets/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)
