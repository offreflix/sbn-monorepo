import json
from mcp.server.fastmcp import FastMCP
from ..client import api_request
from ..utils import convert_keys_to_camel


def register(mcp: FastMCP):
    @mcp.tool()
    async def list_categories() -> str:
        """List all categories for the authenticated user."""
        result = await api_request("GET", "/api/finance/categories")
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def get_category(id: str) -> str:
        """Get a single category by ID.

        Args:
            id: The category UUID.
        """
        result = await api_request("GET", f"/api/finance/categories/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def create_category(
        name: str,
        type: str,
        icon: str | None = None,
        color: str | None = None,
    ) -> str:
        """Create a new category.

        Args:
            name: Category name (e.g. "Alimentação", "Transporte").
            type: "Receita" (income) or "Despesa" (expense).
            icon: Optional icon identifier.
            color: Optional hex color (e.g. "#FF5733").
        """
        body = convert_keys_to_camel({
            "name": name,
            "type": type,
            "icon": icon,
            "color": color,
        })
        result = await api_request("POST", "/api/finance/categories", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def update_category(
        id: str,
        name: str | None = None,
        type: str | None = None,
        icon: str | None = None,
        color: str | None = None,
    ) -> str:
        """Update an existing category.

        Args:
            id: The category UUID.
            name: Category name.
            type: "Receita" or "Despesa".
            icon: Icon identifier.
            color: Hex color.
        """
        body = convert_keys_to_camel({
            "name": name,
            "type": type,
            "icon": icon,
            "color": color,
        })
        result = await api_request("PATCH", f"/api/finance/categories/{id}", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def delete_category(id: str) -> str:
        """Delete a category by ID.

        Args:
            id: The category UUID.
        """
        result = await api_request("DELETE", f"/api/finance/categories/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)
