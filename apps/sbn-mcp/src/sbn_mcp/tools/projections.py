import json
from mcp.server.fastmcp import FastMCP
from ..client import api_request


def register(mcp: FastMCP):
    @mcp.tool()
    async def get_projections(months: int | None = None) -> str:
        """Get financial projections (balance timeline based on recurrences).

        Args:
            months: Number of months to project into the future. Defaults to 6.
        """
        params = {}
        if months is not None:
            params["months"] = months
        result = await api_request("GET", "/api/finance/projections", params=params)
        return json.dumps(result, ensure_ascii=False, indent=2)
