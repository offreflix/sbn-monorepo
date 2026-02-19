import json
from mcp.server.fastmcp import FastMCP
from ..client import api_request
from ..utils import convert_keys_to_camel


def register(mcp: FastMCP):
    @mcp.tool()
    async def list_wishlist(status: str | None = None, priority: str | None = None) -> str:
        """List all wishlist items.

        Args:
            status: Filter by status — "WISHED", "PURCHASED", or "REMOVED".
            priority: Filter by priority — "LOW", "MEDIUM", or "HIGH".
        """
        params = {}
        if status is not None:
            params["status"] = status
        if priority is not None:
            params["priority"] = priority
        result = await api_request("GET", "/api/finance/wishlist", params=params)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def get_wishlist_item(id: str) -> str:
        """Get a single wishlist item by ID.

        Args:
            id: The wishlist item UUID.
        """
        result = await api_request("GET", f"/api/finance/wishlist/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def create_wishlist_item(
        name: str,
        description: str | None = None,
        price: float | None = None,
        currency: str | None = None,
        url: str | None = None,
        image_url: str | None = None,
        priority: str | None = None,
        status: str | None = None,
        tags: list[str] | None = None,
        notes: str | None = None,
    ) -> str:
        """Create a new wishlist item.

        Args:
            name: Item name.
            description: Item description.
            price: Item price.
            currency: Currency code (e.g. "BRL").
            url: Product URL.
            image_url: Image URL.
            priority: "LOW", "MEDIUM", or "HIGH".
            status: "WISHED", "PURCHASED", or "REMOVED".
            tags: List of tags.
            notes: Additional notes.
        """
        body = convert_keys_to_camel({
            "name": name,
            "description": description,
            "price": price,
            "currency": currency,
            "url": url,
            "image_url": image_url,
            "priority": priority,
            "status": status,
            "tags": tags,
            "notes": notes,
        })
        result = await api_request("POST", "/api/finance/wishlist", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def update_wishlist_item(
        id: str,
        name: str | None = None,
        description: str | None = None,
        price: float | None = None,
        currency: str | None = None,
        url: str | None = None,
        image_url: str | None = None,
        priority: str | None = None,
        status: str | None = None,
        tags: list[str] | None = None,
        notes: str | None = None,
    ) -> str:
        """Update an existing wishlist item.

        Args:
            id: The wishlist item UUID.
            name: Item name.
            description: Item description.
            price: Item price.
            currency: Currency code.
            url: Product URL.
            image_url: Image URL.
            priority: "LOW", "MEDIUM", or "HIGH".
            status: "WISHED", "PURCHASED", or "REMOVED".
            tags: List of tags.
            notes: Additional notes.
        """
        body = convert_keys_to_camel({
            "name": name,
            "description": description,
            "price": price,
            "currency": currency,
            "url": url,
            "image_url": image_url,
            "priority": priority,
            "status": status,
            "tags": tags,
            "notes": notes,
        })
        result = await api_request("PATCH", f"/api/finance/wishlist/{id}", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def delete_wishlist_item(id: str) -> str:
        """Delete a wishlist item by ID.

        Args:
            id: The wishlist item UUID.
        """
        result = await api_request("DELETE", f"/api/finance/wishlist/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def purchase_wishlist_item(id: str) -> str:
        """Mark a wishlist item as purchased.

        Args:
            id: The wishlist item UUID.
        """
        result = await api_request("PATCH", f"/api/finance/wishlist/{id}/purchase")
        return json.dumps(result, ensure_ascii=False, indent=2)
