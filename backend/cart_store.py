from typing import Any


carts: dict[str, dict[int, dict[str, Any]]] = {}


def get_cart(session_id: str) -> dict:
    items = list(carts.get(session_id, {}).values())

    total_price = sum(
        item["price"] * item["quantity"]
        for item in items
    )

    return {
        "session_id": session_id,
        "items": items,
        "total_price": total_price,
    }


def get_cart_quantity(
    session_id: str,
    product_id: int,
) -> int:
    cart = carts.get(session_id, {})
    item = cart.get(product_id)

    if not item:
        return 0

    return item["quantity"]


def add_cart_item(
    session_id: str,
    product: dict,
    quantity: int,
) -> dict:
    cart = carts.setdefault(session_id, {})
    product_id = product["id"]

    if product_id in cart:
        cart[product_id]["quantity"] += quantity
    else:
        cart[product_id] = {
            "product_id": product_id,
            "name": product.get("name"),
            "article": product.get("article"),
            "price": product.get("price"),
            "quantity": quantity,
            "image": product.get("image"),
            "url": product.get("url"),
        }

    return get_cart(session_id)

def remove_cart_item(
    session_id: str,
    product_id: int,
) -> bool:
    cart = carts.get(session_id)

    if not cart or product_id not in cart:
        return False

    del cart[product_id]
    return True