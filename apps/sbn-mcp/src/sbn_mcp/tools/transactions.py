import json
from mcp.server.fastmcp import FastMCP
from ..client import api_request
from ..utils import convert_keys_to_camel


def register(mcp: FastMCP):
    @mcp.tool()
    async def list_transactions(month: int | None = None, year: int | None = None) -> str:
        """List all transactions for a given month/year.

        Args:
            month: Month number (1-12). Defaults to current month.
            year: Year (e.g. 2025). Defaults to current year.
        """
        params = {}
        if month is not None:
            params["month"] = month
        if year is not None:
            params["year"] = year
        result = await api_request("GET", "/api/finance/transactions", params=params)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def get_transaction(id: str) -> str:
        """Get a single transaction by ID.

        Args:
            id: The transaction UUID.
        """
        result = await api_request("GET", f"/api/finance/transactions/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def create_transaction(
        wallet_id: str,
        category_id: str,
        amount: float,
        date: str,
        type: str,
        description: str | None = None,
        status: str | None = None,
        is_paid: bool | None = None,
        installments: int | None = None,
        installment_number: int | None = None,
        total_installments: int | None = None,
        recurrence_id: str | None = None,
    ) -> str:
        """Create a new financial transaction.

        Args:
            wallet_id: UUID of the wallet.
            category_id: UUID of the category.
            amount: Transaction amount (positive number).
            date: ISO date string (e.g. "2025-01-15").
            type: "Receita" (income) or "Despesa" (expense).
            description: Optional description.
            status: "Pendente", "Pago", or "Cancelado".
            is_paid: Whether the transaction is paid.
            installments: Number of installments.
            installment_number: Current installment number.
            total_installments: Total number of installments.
            recurrence_id: UUID of linked recurrence.
        """
        body = convert_keys_to_camel({
            "wallet_id": wallet_id,
            "category_id": category_id,
            "amount": amount,
            "date": date,
            "type": type,
            "description": description,
            "status": status,
            "is_paid": is_paid,
            "installments": installments,
            "installment_number": installment_number,
            "total_installments": total_installments,
            "recurrence_id": recurrence_id,
        })
        result = await api_request("POST", "/api/finance/transactions", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def update_transaction(
        id: str,
        wallet_id: str | None = None,
        category_id: str | None = None,
        amount: float | None = None,
        date: str | None = None,
        type: str | None = None,
        description: str | None = None,
        status: str | None = None,
        is_paid: bool | None = None,
    ) -> str:
        """Update an existing transaction.

        Args:
            id: The transaction UUID.
            wallet_id: UUID of the wallet.
            category_id: UUID of the category.
            amount: Transaction amount.
            date: ISO date string.
            type: "Receita" or "Despesa".
            description: Description text.
            status: "Pendente", "Pago", or "Cancelado".
            is_paid: Whether the transaction is paid.
        """
        body = convert_keys_to_camel({
            "wallet_id": wallet_id,
            "category_id": category_id,
            "amount": amount,
            "date": date,
            "type": type,
            "description": description,
            "status": status,
            "is_paid": is_paid,
        })
        result = await api_request("PATCH", f"/api/finance/transactions/{id}", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def delete_transaction(id: str) -> str:
        """Delete a transaction by ID.

        Args:
            id: The transaction UUID.
        """
        result = await api_request("DELETE", f"/api/finance/transactions/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def get_transaction_summary(month: int | None = None, year: int | None = None) -> str:
        """Get a summary of transactions (totals by type) for a given month.

        Args:
            month: Month number (1-12). Defaults to current month.
            year: Year (e.g. 2025). Defaults to current year.
        """
        params = {}
        if month is not None:
            params["month"] = month
        if year is not None:
            params["year"] = year
        result = await api_request("GET", "/api/finance/transactions/summary", params=params)
        return json.dumps(result, ensure_ascii=False, indent=2)
