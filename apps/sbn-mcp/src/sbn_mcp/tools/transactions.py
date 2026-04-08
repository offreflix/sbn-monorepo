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
        amount_is_per_installment: bool = False,
        recurrence_id: str | None = None,
    ) -> str:
        """Create a new financial transaction.

        INSTALLMENT RULES:
        - The backend expects `amount` to be the TOTAL purchase value.
          It will divide that total equally across all installments.
        - If you know only the per-installment value (e.g. "R$ 10,89 per installment"),
          set `amount_is_per_installment=True` and pass the per-installment value in `amount`.
          The tool will automatically calculate the total (amount × installments) before sending.
        - Example: "4 installments of R$ 10.89" → amount=10.89, installments=4, amount_is_per_installment=True
          → backend receives amount=43.56, creates 4 × R$ 10.89 installments.

        Args:
            wallet_id: UUID of the wallet.
            category_id: UUID of the category.
            amount: TOTAL transaction amount. If amount_is_per_installment=True, pass the per-installment value instead.
            date: ISO date string (e.g. "2025-01-15").
            type: "Receita" (income) or "Despesa" (expense).
            description: Optional description.
            status: "Pendente", "Pago", or "Cancelado".
            is_paid: Whether the transaction is paid.
            installments: Number of installments. Required when creating installment transactions.
            installment_number: Current installment number (informational only).
            total_installments: Total number of installments (falls back to `installments` if omitted).
            amount_is_per_installment: Set True when `amount` represents the value of a single installment.
                The tool will multiply amount × installments to get the total sent to the backend.
            recurrence_id: UUID of linked recurrence.
        """
        # Resolve effective installment count (total_installments takes precedence, fallback to installments)
        effective_installments = total_installments or installments

        # When the caller provides the per-installment amount, calculate the total for the backend
        final_amount = amount
        if amount_is_per_installment and effective_installments and effective_installments > 1:
            final_amount = round(amount * effective_installments, 2)

        body = convert_keys_to_camel({
            "wallet_id": wallet_id,
            "category_id": category_id,
            "amount": final_amount,
            "date": date,
            "type": type,
            "description": description,
            "status": status,
            "is_paid": is_paid,
            "installments": effective_installments,
            "installment_number": installment_number,
            "total_installments": effective_installments,
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
