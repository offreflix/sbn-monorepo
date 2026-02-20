import json
from mcp.server.fastmcp import FastMCP
from ..client import api_request


def register(mcp: FastMCP):
    @mcp.tool()
    async def get_dashboard_summary(month: int | None = None, year: int | None = None) -> str:
        """Get the financial dashboard summary including balance, invoices, income and expenses overview.

        Args:
            month: Month number (1-12). Defaults to current month.
            year: Year (e.g. 2025). Defaults to current year.
        """
        params = {}
        if month is not None:
            params["month"] = month
        if year is not None:
            params["year"] = year
        result = await api_request("GET", "/api/finance/dashboard/summary", params=params)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def get_category_breakdown(month: int | None = None, year: int | None = None) -> str:
        """Get income and expense breakdown by category for a given month.

        Args:
            month: Month number (1-12). Defaults to current month.
            year: Year (e.g. 2025). Defaults to current year.
        """
        params = {}
        if month is not None:
            params["month"] = month
        if year is not None:
            params["year"] = year
        result = await api_request("GET", "/api/finance/dashboard/categories", params=params)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def get_year_overview(year: int | None = None) -> str:
        """Get the full year financial overview, including monthly income, expenses and balance for each month.

        Args:
            year: Year (e.g. 2025). Defaults to current year.
        """
        params = {}
        if year is not None:
            params["year"] = year
        result = await api_request("GET", "/api/finance/dashboard/year", params=params)
        return json.dumps(result, ensure_ascii=False, indent=2)
