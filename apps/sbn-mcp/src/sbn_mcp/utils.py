import re


def snake_to_camel(name: str) -> str:
    components = name.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


def convert_keys_to_camel(data: dict) -> dict:
    return {snake_to_camel(k): v for k, v in data.items() if v is not None}
