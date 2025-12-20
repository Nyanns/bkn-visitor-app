import requests
import sys

BASE_URL = "http://localhost:8000"

def test_crash():
    # 1. Login
    print("Logging in...")
    try:
        resp = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "admin123"})
        if resp.status_code != 200:
            print(f"Login failed: {resp.status_code} {resp.text}")
            # Try default credentials or panda/panda? 
            # debug_admin.py says 'admin/admin123' is reset.
            if resp.status_code == 400:
                print("Trying setup-admin just in case...")
                
            return
    except Exception as e:
        print(f"Login connection failed: {e}")
        return

    token = resp.json()["access_token"]
    print("Login successful.")

    # 2. Access /admin/logs
    print("Accessing /admin/logs...")
    try:
        resp = requests.get(f"{BASE_URL}/admin/logs", headers={"Authorization": f"Bearer {token}"})
        print(f"Logs response: {resp.status_code}")
        if resp.status_code == 200:
             print("Success! Data length:", len(resp.json()))
        else:
             print("Failed:", resp.text)
    except Exception as e:
        print(f"Crash detected? Error: {e}")

if __name__ == "__main__":
    test_crash()
