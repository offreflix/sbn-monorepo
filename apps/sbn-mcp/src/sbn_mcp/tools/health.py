import json
from mcp.server.fastmcp import FastMCP
from ..client import api_request
from ..utils import convert_keys_to_camel


def register(mcp: FastMCP):
    @mcp.tool()
    async def get_health_summary(date: str | None = None) -> str:
        """Get the health summary for a given date (calories, macros, water, meals).

        Args:
            date: ISO date string (e.g. "2025-01-15"). Defaults to today.
        """
        params = {}
        if date is not None:
            params["date"] = date
        result = await api_request("GET", "/api/health/summary", params=params)
        return json.dumps(result, ensure_ascii=False, indent=2)

    # ── Foods ──────────────────────────────────────────────────────────────

    @mcp.tool()
    async def list_foods(search: str | None = None) -> str:
        """List all available foods, optionally filtered by name.

        Args:
            search: Optional search term to filter foods by name.
        """
        params = {}
        if search is not None:
            params["search"] = search
        result = await api_request("GET", "/api/health/foods", params=params)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def create_food(
        name: str,
        calories_per_serving: float,
        serving_size_value: float,
        serving_size_unit: str,
        brand: str | None = None,
        protein_per_serving: float | None = None,
        carbs_per_serving: float | None = None,
        fat_per_serving: float | None = None,
    ) -> str:
        """Create a new food item.

        Args:
            name: Food name.
            calories_per_serving: Calories per serving.
            serving_size_value: Numeric serving size (e.g. 100).
            serving_size_unit: Unit for serving size (e.g. "g", "ml", "unidade").
            brand: Optional brand name.
            protein_per_serving: Protein in grams per serving.
            carbs_per_serving: Carbohydrates in grams per serving.
            fat_per_serving: Fat in grams per serving.
        """
        body = convert_keys_to_camel({
            "name": name,
            "brand": brand,
            "serving_size_value": serving_size_value,
            "serving_size_unit": serving_size_unit,
            "calories_per_serving": calories_per_serving,
            "protein_per_serving": protein_per_serving,
            "carbs_per_serving": carbs_per_serving,
            "fat_per_serving": fat_per_serving,
        })
        result = await api_request("POST", "/api/health/foods", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def delete_food(id: str) -> str:
        """Delete a food item by ID.

        Args:
            id: The food UUID.
        """
        result = await api_request("DELETE", f"/api/health/foods/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)

    # ── Goals ──────────────────────────────────────────────────────────────

    @mcp.tool()
    async def get_current_goal() -> str:
        """Get the currently active health goal (calories and macros targets)."""
        result = await api_request("GET", "/api/health/goals/current")
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def list_goals() -> str:
        """List all health goals history."""
        result = await api_request("GET", "/api/health/goals")
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def create_goal(
        daily_calorie_goal: float,
        protein_goal_g: float,
        carbs_goal_g: float,
        fat_goal_g: float,
        water_goal_ml: float | None = None,
        active_from: str | None = None,
    ) -> str:
        """Create a new health goal. This becomes the active goal from the given date.

        Args:
            daily_calorie_goal: Daily calorie target in kcal.
            protein_goal_g: Daily protein target in grams.
            carbs_goal_g: Daily carbohydrates target in grams.
            fat_goal_g: Daily fat target in grams.
            water_goal_ml: Daily water intake target in ml. Optional.
            active_from: ISO date string for when this goal becomes active. Defaults to today.
        """
        body = convert_keys_to_camel({
            "daily_calorie_goal": daily_calorie_goal,
            "protein_goal_g": protein_goal_g,
            "carbs_goal_g": carbs_goal_g,
            "fat_goal_g": fat_goal_g,
            "water_goal_ml": water_goal_ml,
            "active_from": active_from,
        })
        result = await api_request("POST", "/api/health/goals", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    # ── Meal Logs ──────────────────────────────────────────────────────────

    @mcp.tool()
    async def list_meal_logs(date: str | None = None) -> str:
        """List meal logs grouped by meal type (breakfast, lunch, dinner, snack).

        Args:
            date: ISO date string (e.g. "2025-01-15"). Defaults to today.
        """
        params = {}
        if date is not None:
            params["date"] = date
        result = await api_request("GET", "/api/health/meal-logs", params=params)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def create_meal_log(
        food_id: str,
        meal_type: str,
        amount_consumed: float,
        unit_consumed: str,
        logged_at_date: str | None = None,
    ) -> str:
        """Log a food item to a meal.

        Args:
            food_id: UUID of the food item.
            meal_type: One of "breakfast", "lunch", "dinner", "snack".
            amount_consumed: Amount consumed (numeric).
            unit_consumed: Unit for the consumed amount (e.g. "g", "ml", "unidade").
            logged_at_date: ISO date string for when this was consumed. Defaults to today.
        """
        body = convert_keys_to_camel({
            "food_id": food_id,
            "meal_type": meal_type,
            "amount_consumed": amount_consumed,
            "unit_consumed": unit_consumed,
            "logged_at_date": logged_at_date,
        })
        result = await api_request("POST", "/api/health/meal-logs", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def delete_meal_log(id: str) -> str:
        """Delete a meal log entry by ID.

        Args:
            id: The meal log UUID.
        """
        result = await api_request("DELETE", f"/api/health/meal-logs/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)

    # ── Water Logs ─────────────────────────────────────────────────────────

    @mcp.tool()
    async def list_water_logs(date: str | None = None) -> str:
        """List water log entries and total intake for a given date.

        Args:
            date: ISO date string (e.g. "2025-01-15"). Defaults to today.
        """
        params = {}
        if date is not None:
            params["date"] = date
        result = await api_request("GET", "/api/health/water-logs", params=params)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def create_water_log(
        volume_ml: float,
        logged_date: str | None = None,
    ) -> str:
        """Log a water intake entry.

        Args:
            volume_ml: Volume of water in milliliters.
            logged_date: ISO date string for the log date. Defaults to today.
        """
        body = convert_keys_to_camel({
            "volume_ml": volume_ml,
            "logged_date": logged_date,
        })
        result = await api_request("POST", "/api/health/water-logs", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def delete_water_log(id: str) -> str:
        """Delete a water log entry by ID.

        Args:
            id: The water log UUID.
        """
        result = await api_request("DELETE", f"/api/health/water-logs/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)

    # ── Measurements ───────────────────────────────────────────────────────

    @mcp.tool()
    async def list_measurements(
        start_date: str | None = None,
        end_date: str | None = None,
    ) -> str:
        """List body measurements (weight, etc.) within a date range.

        Args:
            start_date: ISO date string for range start. Optional.
            end_date: ISO date string for range end. Optional.
        """
        params = {}
        if start_date is not None:
            params["startDate"] = start_date
        if end_date is not None:
            params["endDate"] = end_date
        result = await api_request("GET", "/api/health/measurements", params=params)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def create_measurement(
        weight_kg: float,
        measured_at: str | None = None,
    ) -> str:
        """Record a new body measurement.

        Args:
            weight_kg: Body weight in kilograms.
            measured_at: ISO date string for when the measurement was taken. Defaults to today.
        """
        body = convert_keys_to_camel({
            "weight_kg": weight_kg,
            "measured_at": measured_at,
        })
        result = await api_request("POST", "/api/health/measurements", json=body)
        return json.dumps(result, ensure_ascii=False, indent=2)

    @mcp.tool()
    async def delete_measurement(id: str) -> str:
        """Delete a measurement record by ID.

        Args:
            id: The measurement UUID.
        """
        result = await api_request("DELETE", f"/api/health/measurements/{id}")
        return json.dumps(result, ensure_ascii=False, indent=2)
