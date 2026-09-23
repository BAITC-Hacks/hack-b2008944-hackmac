from typing import Any

import httpx

from ekt_client import get_product_detail, get_products


IMPORTANT_SPEC_MARKERS = (
    "NOMINAL",
    "TOK",
    "NAPRYAZH",
    "POLYUS",
    "MOSHNOST",
    "TIP",
    "RAZMER",
    "MARKA",
)


def normalize_value(value: Any) -> str:
    return str(value).strip().lower()


def get_category_url(product: dict) -> str:
    url = str(product.get("url") or "").rstrip("/")

    if "/" not in url:
        return ""

    return url.rsplit("/", 1)[0]


def compare_properties(
    original: dict,
    candidate: dict,
) -> tuple[list[dict], list[dict]]:
    original_properties = original.get("properties") or {}
    candidate_properties = candidate.get("properties") or {}

    matched = []
    differences = []

    for key, original_value in original_properties.items():
        if key not in candidate_properties:
            continue

        candidate_value = candidate_properties[key]

        if not original_value or not candidate_value:
            continue

        if normalize_value(original_value) == normalize_value(candidate_value):
            matched.append({
                "field": key,
                "value": original_value,
            })

        elif any(marker in key.upper() for marker in IMPORTANT_SPEC_MARKERS):
            differences.append({
                "field": key,
                "original": original_value,
                "candidate": candidate_value,
            })

    return matched[:10], differences[:10]


def find_analogs(
    product_id: int,
    max_pages: int = 10,
    limit: int = 3,
) -> dict:
    original = get_product_detail(product_id)
    original_category = get_category_url(original)

    candidate_ids = []
    candidate_sources = {}

    def add_candidate(candidate_id: int, source: str):
        if candidate_id == product_id:
            return

        if candidate_id not in candidate_ids:
            candidate_ids.append(candidate_id)
            candidate_sources[candidate_id] = source

    recommendations = (
        original.get("properties", {}).get("RECOMMEND", [])
    )

    for recommended_id in recommendations:
        try:
            add_candidate(
                int(recommended_id),
                "catalog_recommendation",
            )
        except (TypeError, ValueError):
            continue

    for page in range(1, max_pages + 1):
        data = get_products(page)
        items = data.get("items", [])

        if not items:
            break

        for item in items:
            if get_category_url(item) == original_category:
                add_candidate(
                    int(item["id"]),
                    "same_category",
                )

        if len(candidate_ids) >= 40:
            break

    analogs = []

    for candidate_id in candidate_ids[:40]:
        try:
            candidate = get_product_detail(candidate_id)
        except (httpx.HTTPError, TypeError, ValueError):
            continue

        available_quantity = int(
            candidate.get("quantity") or 0
        )

        if available_quantity <= 0:
            continue

        matched, differences = compare_properties(
            original,
            candidate,
        )

        same_category = (
            get_category_url(candidate) == original_category
        )

        if not same_category and len(matched) < 2:
            continue

        source = candidate_sources[candidate_id]

        score = (
            (100 if same_category else 0)
            + (25 if source == "catalog_recommendation" else 0)
            + len(matched) * 2
            - len(differences)
        )

        analogs.append({
            "id": candidate.get("id"),
            "name": candidate.get("name"),
            "article": candidate.get("article"),
            "price": candidate.get("price"),
            "quantity": available_quantity,
            "image": candidate.get("image"),
            "url": candidate.get("url"),
            "source": source,
            "score": score,
            "matched_properties": matched,
            "differences": differences,
            "requires_technical_review": True,
        })

    analogs.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return {
        "original_product": {
            "id": original.get("id"),
            "name": original.get("name"),
            "article": original.get("article"),
            "quantity": original.get("quantity"),
        },
        "count": min(len(analogs), limit),
        "analogs": analogs[:limit],
        "notice": (
            "Возможные аналоги подобраны по категории и характеристикам. "
            "Перед заменой необходимо проверить критичные параметры."
        ),
    }