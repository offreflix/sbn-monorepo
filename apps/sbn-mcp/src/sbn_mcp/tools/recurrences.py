import json
from mcp.server.fastmcp import FastMCP
from ..client import api_request
from ..utils import convert_keys_to_camel


def register(mcp: FastMCP):
    @mcp.tool()
    async def list_recurrences() -> str:
        """List all recurring transactions for the authenticated user."""
        result = await api_request("GET", "/api/finance/recurrences")
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def get_recurrence(id: str) -> str:
        """Get a single recurrence by ID.

        Args:
            id: The recurrence UUID.
        """
        result = await api_request("GET", f"/api/finance/recurrences/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def create_recurrence(
        wallet_id: str,
        category_id: str,
        amount: float,
        type: str,
        frequency: str,
        start_date: str,
        end_date: str | None = None,
        description: str | None = None,
    ) -> str:
        """Create a new recurring transaction.

        Args:
            wallet_id: UUID of the wallet.
            category_id: UUID of the category.
            amount: Recurrence amount.
            type: "Receita" (income) or "Despesa" (expense).
            frequency: Frequency — e.g. "Mensal", "Semanal", "Anual".
            start_date: ISO date string for the start date.
            end_date: Optional ISO date string for the end date.
            description: Optional description.
        """
        body = convert_keys_to_camel({
            "wallet_id": wallet_id,
            "category_id": category_id,
            "amount": amount,
            "type": type,
            "frequency": frequency,
            "start_date": start_date,
            "end_date": end_date,
            "description": description,
        })
        result = await api_request("POST", "/api/finance/recurrences", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def update_recurrence(
        id: str,
        wallet_id: str | None = None,
        category_id: str | None = None,
        amount: float | None = None,
        type: str | None = None,
        frequency: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
        description: str | None = None,
    ) -> str:
        """Update an existing recurrence.

        Args:
            id: The recurrence UUID.
            wallet_id: UUID of the wallet.
            category_id: UUID of the category.
            amount: Recurrence amount.
            type: "Receita" or "Despesa".
            frequency: Frequency.
            start_date: ISO date string.
            end_date: ISO date string.
            description: Description text.
        """
        body = convert_keys_to_camel({
            "wallet_id": wallet_id,
            "category_id": category_id,
            "amount": amount,
            "type": type,
            "frequency": frequency,
            "start_date": start_date,
            "end_date": end_date,
            "description": description,
        })
        result = await api_request("PATCH", f"/api/finance/recurrences/{id}", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def delete_recurrence(id: str) -> str:
        """Delete a recurrence by ID.

        Args:
            id: The recurrence UUID.
        """
        result = await api_request("DELETE", f"/api/finance/recurrences/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)
