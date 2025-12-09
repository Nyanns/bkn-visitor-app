import requests
import sys
import time
from colorama import init, Fore, Style

init(autoreset=True)

BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/token"
PROTECTED_URL = f"{BASE_URL}/admin/logs"
UPLOAD_URL = f"{BASE_URL}/uploads"

def print_header(title):
    print(f"\n{Fore.CYAN}{Style.BRIGHT}{'='*10} {title} {'='*10}{Style.RESET_ALL}")

def check_headers():
    print_header("1. Checking HTTP Security Headers")
    try:
        res = requests.get(BASE_URL)
        headers = res.headers
        security_headers = [
            "X-Content-Type-Options",
            "X-Frame-Options",
            "Strict-Transport-Security",
            "Content-Security-Policy"
        ]
        
        score = 0
        for h in security_headers:
            if h in headers:
                print(f"[OK] {h}: {Fore.GREEN}Present")
                score += 1
            else:
                print(f"[WARN] {h}: {Fore.YELLOW}Missing")
        
        return score, len(security_headers)
    except Exception as e:
        print(f"{Fore.RED}Failed to connect: {e}")
        return 0, 4

def check_auth_protection():
    print_header("2. Checking Protected Routes (Unauthenticated)")
    # Try to access admin logs without token
    try:
        res = requests.get(PROTECTED_URL)
        if res.status_code in [401, 403]:
            print(f"[OK] /admin/logs: {Fore.GREEN}Protected (Status {res.status_code})")
            return 1, 1
        else:
            print(f"[FAIL] /admin/logs: {Fore.RED}Accessible (Status {res.status_code})")
            return 0, 1
    except Exception as e:
        print(f"{Fore.RED}Error: {e}")
        return 0, 1

def check_advanced_sqli():
    print_header("3. Advanced SQL Injection Tests (Login)")
    
    # Commonly used SQLi payloads for login bypass
    payloads = [
        {"username": "' OR '1'='1", "password": "password", "type": "Auth Bypass (Classic)"},
        {"username": "admin' --", "password": "password", "type": "Comment Truncation"},
        {"username": "' UNION SELECT 1, 'admin', 'hash' --", "password": "password", "type": "Union Based"},
        {"username": "admin' OR 1=1 LIMIT 1 --", "password": "password", "type": "Boolean Blind"},
        {"username": "' OR TRUE --", "password": "password", "type": "Tautology"},
        {"username": "' ; DROP TABLE visitors; --", "password": "password", "type": "Stacking Queries (Destructive)"}
    ]
    
    passed = 0
    total = len(payloads)
    
    for p in payloads:
        try:
            # We expect a 401 Unauthorized if the injection fails (good)
            # We expect 200 OK or 500 Internal Server Error if unexpected happen (bad)
            
            # Using x-www-form-urlencoded as expected by OAuth2
            data = {"username": p['username'], "password": p['password']}
            res = requests.post(LOGIN_URL, data=data)
            
            if res.status_code == 401:
                print(f"[OK] {p['type']}: {Fore.GREEN}Blocked (401)")
                passed += 1
            elif res.status_code == 200:
                print(f"[CRITICAL] {p['type']}: {Fore.RED}VULNERABLE (200 OK - Logs in!)")
            elif res.status_code == 500:
                print(f"[WARN] {p['type']}: {Fore.YELLOW}Potential Error-Based SQLi (500 Server Error)")
            else:
                print(f"[INFO] {p['type']}: Status {res.status_code}")
                # Treat other codes as passed for now, assuming no access granted
                passed += 1
                
        except Exception as e:
            print(f"{Fore.RED}Error: {e}")
            
    return passed, total

def check_path_traversal():
    print_header("4. Path Traversal Tests")
    
    payloads = [
        "../main.py",
        "..%2fmain.py",
        "../../backend/main.py",
        "....//....//main.py"
    ]
    
    passed = 0
    total = len(payloads)
    
    # We need a valid token to test the authenticated upload endpoint properly,
    # but let's test the unauthenticated defense (if any) or assume we are attacking publicly.
    # Since /uploads is protected by JWT in our new code, let's see if we can bypass it by direct URL if it was static.
    # Note: Our app serves uploads via an endpoint.
    
    for p in payloads:
        url = f"{UPLOAD_URL}/{p}"
        res = requests.get(url) # Should use GET for retrieving files
        
        # We expect 401 (Auth required) or 404 (Not found) or 403.
        # If we get 200 and source code, it's bad.
        
        if res.status_code in [401, 403]:
             print(f"[OK] {p}: {Fore.GREEN}Protected (Auth Required)")
             passed += 1
        elif res.status_code == 404:
             print(f"[OK] {p}: {Fore.GREEN}Not Found (Safe)")
             passed += 1
        elif res.status_code == 200:
             if "FastAPI" in res.text or "import" in res.text:
                 print(f"[CRITICAL] {p}: {Fore.RED}VULNERABLE (Source Code Leaked!)")
             else:
                 print(f"[WARN] {p}: {Fore.YELLOW}200 OK (Content returned, verify manually)")
        else:
             print(f"[INFO] {p}: Status {res.status_code}")
             passed += 1
             
    return passed, total

if __name__ == "__main__":
    print(f"{Fore.BLUE}{Style.BRIGHT}Starting Security Audit on {BASE_URL}...\n")
    
    h_score, h_total = check_headers()
    a_score, a_total = check_auth_protection()
    s_score, s_total = check_advanced_sqli()
    p_score, p_total = check_path_traversal()
    
    total_score = h_score + a_score + s_score + p_score
    max_score = h_total + a_total + s_total + p_total
    
    percentage = (total_score / max_score) * 100
    
    print_header("Audit Summary")
    print(f"Headers: {h_score}/{h_total}")
    print(f"Auth Protection: {a_score}/{a_total}")
    print(f"SQL Injection: {s_score}/{s_total}")
    print(f"Path Traversal: {p_score}/{p_total}")
    
    print(f"\n{Style.BRIGHT}Total Score: {total_score}/{max_score} ({percentage:.1f}%)")
    
    if percentage == 100:
        print(f"\n{Fore.GREEN}{Style.BRIGHT}RESULT: EXCELLENT SECURITY POSTURE")
    elif percentage >= 80:
        print(f"\n{Fore.YELLOW}{Style.BRIGHT}RESULT: GOOD (Minor improvements needed)")
    else:
        print(f"\n{Fore.RED}{Style.BRIGHT}RESULT: VULNERABLE (Immediate action required)")
