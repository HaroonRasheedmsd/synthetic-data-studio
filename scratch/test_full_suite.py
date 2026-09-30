import urllib.request
import json

BASE_URL = "http://localhost:8000"

def test_routes():
    print("--- 1. Testing Schema Inference ---")
    req = urllib.request.Request(
        f"{BASE_URL}/api/schema/infer",
        data=json.dumps({"description": "Create an E-Commerce store with Customers, Orders, Items, Payments"}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    plan = json.loads(res.read().decode('utf-8'))
    print(f"Inferred Plan Domain: {plan.get('domain')}, Table Count: {len(plan.get('tables', []))}")

    print("\n--- 2. Testing Data Generation with Constraints ---")
    gen_req = urllib.request.Request(
        f"{BASE_URL}/api/generate",
        data=json.dumps({"plan": plan}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    gen_res = urllib.request.urlopen(gen_req)
    gen_data = json.loads(gen_res.read().decode('utf-8'))
    print(f"Generated Tables: {list(gen_data['data'].keys())}")
    print(f"Quality Report: {gen_data.get('quality_report')}")

    print("\n--- 3. Testing Interactive DuckDB SQL Querying ---")
    query_req = urllib.request.Request(
        f"{BASE_URL}/api/query",
        data=json.dumps({
            "data": gen_data['data'],
            "query": "SELECT * FROM customers LIMIT 5"
        }).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    query_res = urllib.request.urlopen(query_req)
    query_out = json.loads(query_res.read().decode('utf-8'))
    print(f"SQL Columns: {query_out.get('columns')}, Rows returned: {len(query_out.get('rows', []))}")

    print("\n--- 4. Testing Document Studio Generation ---")
    doc_req = urllib.request.Request(
        f"{BASE_URL}/api/documents/invoices",
        data=json.dumps({"plan": plan}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    doc_res = urllib.request.urlopen(doc_req)
    doc_out = json.loads(doc_res.read().decode('utf-8'))
    invoices = doc_out.get('invoices', [])
    print(f"Generated Documents Count: {len(invoices)}")
    for doc in invoices:
        print(f" - [{doc.get('type')}] Number: {doc.get('document_number')}, Title: {doc.get('title')}")

if __name__ == "__main__":
    test_routes()
