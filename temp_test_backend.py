# ВРЕМЕННЫЙ ФАЙЛ: Тестирование API авторизации, прав доступа, умного слияния и БД.
# ПОСЛЕ ВЫПОЛНЕНИЯ БУДЕТ УДАЛЁН!

import urllib.request
import json

BASE = "http://127.0.0.1:8000/api"

def test_api():
    # 1. Health
    req = urllib.request.Request(f"{BASE}/health")
    with urllib.request.urlopen(req) as resp:
        print("Health check:", resp.status, json.loads(resp.read().decode()))

    # 2. Login admin
    login_data = json.dumps({"username": "admin", "password": "admin123"}).encode()
    req = urllib.request.Request(f"{BASE}/auth/login", data=login_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        admin_res = json.loads(resp.read().decode())
        admin_token = admin_res["token"]
        print("Admin Login:", admin_res["user"])

    # 3. Create a dispatcher user as admin
    new_user_data = json.dumps({
        "username": "andrey",
        "password": "password2026",
        "full_name": "Зубков Андрей (Диспетчер)",
        "role": "dispatcher"
    }).encode()
    req = urllib.request.Request(
        f"{BASE}/admin/users",
        data=new_user_data,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"}
    )
    with urllib.request.urlopen(req) as resp:
        print("Create user response:", json.loads(resp.read().decode()))

    # 4. Login as new dispatcher
    login_disp = json.dumps({"username": "andrey", "password": "password2026"}).encode()
    req = urllib.request.Request(f"{BASE}/auth/login", data=login_disp, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        disp_res = json.loads(resp.read().decode())
        disp_token = disp_res["token"]
        print("Dispatcher Login:", disp_res["user"])

    # 5. Test Smart Merge
    merge_data = json.dumps({
        "current_flights": [
            {
                "id": "fl_1",
                "flight": "N41402",
                "flight_date": "25.08",
                "route_city": "Москва",
                "route_airports": "KQT-SVO",
                "time": "14:20",
                "status": "lir_sent",
                "lir_sent": True,
                "dow": "42150",
                "notes": "VIP пассажир на 2C"
            }
        ],
        "incoming_flights": [
            {
                "id": "fl_new_1",
                "flight": "N41402",
                "flight_date": "25.08",
                "route_city": "Москва",
                "route_airports": "KQT-SVO",
                "time": "14:30",  # Updated time from schedule
                "status": "prepared"
            },
            {
                "id": "fl_new_2",
                "flight": "EO413",
                "flight_date": "25.08",
                "route_city": "Казань",
                "route_airports": "AER-KZN",
                "time": "15:00",
                "status": "prepared"
            }
        ]
    }).encode()
    req = urllib.request.Request(f"{BASE}/shift/smart_merge", data=merge_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        merge_res = json.loads(resp.read().decode())
        print("Smart Merge Result count:", merge_res["merged_count"])
        # Check preserved notes and status
        fl1 = next(f for f in merge_res["flights"] if f["flight"] == "N41402")
        print("Merged flight N41402 status:", fl1["status"], "notes:", fl1["notes"], "time:", fl1["time"])
        assert fl1["status"] == "lir_sent"
        assert fl1["notes"] == "VIP пассажир на 2C"
        assert fl1["time"] == "14:30"
        print("Smart Merge verification passed successfully!")

    print("ALL BACKEND TESTS PASSED!")

if __name__ == "__main__":
    test_api()
