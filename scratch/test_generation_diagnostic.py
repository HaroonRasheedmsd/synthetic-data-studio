import requests
import json

backend_url = "http://127.0.0.1:8000/api/generate"

# Relational Multi-table Plan: Customers -> Orders -> Order_Items -> Payments
relational_plan = {
    "domain": "E-Commerce",
    "project_name": "Relational Diagnostic",
    "locale": "en_US",
    "tables": [
        {
            "name": "customers",
            "row_count": 10,
            "columns": [
                {"name": "id", "data_type": "string", "is_primary_key": True, "faker_provider": "short_id"},
                {"name": "full_name", "data_type": "string", "faker_provider": "name"},
                {"name": "email", "data_type": "string", "faker_provider": "email"},
                {"name": "phone", "data_type": "string", "faker_provider": "phone_number"}
            ]
        },
        {
            "name": "orders",
            "row_count": 25,
            "columns": [
                {"name": "id", "data_type": "string", "is_primary_key": True, "faker_provider": "short_id"},
                {"name": "customer_id", "data_type": "string", "is_foreign_key": True, "references_table": "customers", "references_column": "id"},
                {"name": "order_date", "data_type": "datetime", "faker_provider": "date"},
                {"name": "total_amount", "data_type": "float", "faker_provider": "pyfloat", "min_value": 10.0, "max_value": 500.0}
            ]
        },
        {
            "name": "order_items",
            "row_count": 50,
            "columns": [
                {"name": "id", "data_type": "string", "is_primary_key": True, "faker_provider": "short_id"},
                {"name": "order_id", "data_type": "string", "is_foreign_key": True, "references_table": "orders", "references_column": "id"},
                {"name": "item_name", "data_type": "string", "faker_provider": "word"},
                {"name": "unit_price", "data_type": "float", "faker_provider": "pyfloat", "min_value": 5.0, "max_value": 100.0},
                {"name": "quantity", "data_type": "integer", "faker_provider": "random_int", "min_value": 1, "max_value": 5}
            ]
        },
        {
            "name": "payments",
            "row_count": 25,
            "columns": [
                {"name": "id", "data_type": "string", "is_primary_key": True, "faker_provider": "short_id"},
                {"name": "order_id", "data_type": "string", "is_foreign_key": True, "references_table": "orders", "references_column": "id"},
                {"name": "amount_paid", "data_type": "float", "faker_provider": "pyfloat"},
                {"name": "payment_status", "data_type": "string", "faker_provider": "word"}
            ]
        }
    ],
    "scenarios": {
        "missing_value_rate": 0.05,
        "outlier_rate": 0.02,
        "duplicate_rate": 0.0
    },
    "engines": {
        "tabular": True,
        "relational": True,
        "document": True
    }
}

try:
    print("Testing /api/generate ...")
    res = requests.post(backend_url, json={"plan": relational_plan})
    print("Status Code:", res.status_code)
    if res.status_code == 200:
        result = res.json()
        print("Generated tables:", list(result.get("data", {}).keys()))
        for t, rows in result.get("data", {}).items():
            print(f"  Table '{t}': {len(rows)} rows generated. Sample row 0:", rows[0] if rows else {})
        print("Quality Report:", result.get("quality_report"))
        print("Privacy Report:", result.get("privacy_report"))
    else:
        print("Error text:", res.text)
except Exception as e:
    print("Exception calling backend:", e)
