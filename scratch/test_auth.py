import requests

try:
    resp = requests.post(
        "http://127.0.0.1:8000/api/auth/signup",
        json={
            "full_name": "Test User",
            "email": "testuser123@example.com",
            "password": "password123"
        }
    )
    print("Status code:", resp.status_code)
    print("Response JSON:", resp.json())
except Exception as e:
    print("Error:", e)
