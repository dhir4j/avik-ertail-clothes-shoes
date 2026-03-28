from flask import jsonify


def success_response(data, meta=None, status_code=200):
    body = {"data": data, "error": None}
    if meta is not None:
        body["meta"] = meta
    return jsonify(body), status_code


def error_response(message, status_code=400, code="ERROR", fields=None):
    body = {
        "data": None,
        "error": {
            "code": code,
            "message": message,
        },
    }
    if fields:
        body["error"]["fields"] = fields
    return jsonify(body), status_code
