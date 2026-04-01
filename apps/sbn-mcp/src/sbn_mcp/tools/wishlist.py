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

    @mcp.tool()
    async def add_price_entry(
        wishlist_item_id: str,
        price: float,
        store: str,
        date: str,
        store_url: str | None = None,
        notes: str | None = None,
        currency: str | None = None,
    ) -> str:
        """Add a price entry to track the price history of a wishlist item.

        Args:
            wishlist_item_id: The wishlist item UUID.
            price: The observed price (positive number).
            store: Name of the store where the price was found.
            date: ISO date string of the observation (e.g. "2026-03-03").
            store_url: Optional URL of the product in that store.
            notes: Optional notes about this price observation.
            currency: Currency code (e.g. "BRL"). Defaults to "BRL".
        """
        body = convert_keys_to_camel({
            "price": price,
            "store": store,
            "date": date,
            "store_url": store_url,
            "notes": notes,
            "currency": currency,
        })
        result = await api_request(
            "POST",
            f"/api/finance/wishlist/{wishlist_item_id}/prices",
            json=body,
        )
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def list_price_entries(wishlist_item_id: str) -> str:
        """List all price entries for a wishlist item, ordered by date ascending.

        Args:
            wishlist_item_id: The wishlist item UUID.
        """
        result = await api_request(
            "GET",
            f"/api/finance/wishlist/{wishlist_item_id}/prices",
        )
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def remove_price_entry(wishlist_item_id: str, entry_id: str) -> str:
        """Remove a price entry from a wishlist item's price history.

        Args:
            wishlist_item_id: The wishlist item UUID.
            entry_id: The price entry UUID to remove.
        """
        result = await api_request(
            "DELETE",
            f"/api/finance/wishlist/{wishlist_item_id}/prices/{entry_id}",
        )
        return json.dumps(result, ensure_ascii=False, indent=2)
