from flask import request


def get_pagination_params():
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
    page = max(1, page)
    limit = max(1, min(100, limit))
    return page, limit


def paginate_query(query, page, limit):
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    meta = {
        "page": page,
        "limit": limit,
        "total": total,
    }
    return items, meta
