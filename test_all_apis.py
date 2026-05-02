import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_api(method, endpoint, data=None, expected_status=None):
    """Test an API endpoint and return result"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "PUT":
            response = requests.put(url, json=data)
        elif method == "DELETE":
            response = requests.delete(url)
        
        # If no expected_status, consider 2xx as success
        if expected_status is None:
            success = 200 <= response.status_code < 300
        else:
            success = response.status_code == expected_status
        
        return {
            "endpoint": endpoint,
            "method": method,
            "status": response.status_code,
            "success": success,
            "response": response.text[:200] if response.text else ""
        }
    except Exception as e:
        return {
            "endpoint": endpoint,
            "method": method,
            "status": "ERROR",
            "success": False,
            "response": str(e)
        }

def run_all_tests():
    print("=" * 60)
    print("HR MANAGEMENT SYSTEM - API TEST SUITE")
    print("=" * 60)
    print(f"\nBase URL: {BASE_URL}\n")
    
    results = []
    
    # Test Login
    print("Testing Authentication...")
    # Test with correct password
    results.append(test_api("POST", "/api/login", {
        "username": "admin",
        "password": "123456"
    }, expected_status=200))  # Expect 200 with correct credentials
    
    # Test with wrong password
    results.append(test_api("POST", "/api/login", {
        "username": "admin",
        "password": "wrongpassword"
    }, expected_status=401))  # Expect 401 with wrong credentials
    
    # Test Employees endpoints
    print("Testing Employees endpoints...")
    results.append(test_api("GET", "/api/employees"))
    results.append(test_api("GET", "/api/employees/1"))
    
    # Test Departments endpoints
    print("Testing Departments endpoints...")
    results.append(test_api("GET", "/api/departments"))
    
    # Create a test department
    create_result = test_api("POST", "/api/departments", {"DepartmentName": "Test Department"}, expected_status=201)
    results.append(create_result)
    
    # Get a department ID for update and delete tests
    try:
        dept_response = requests.get(f"{BASE_URL}/api/departments")
        if dept_response.status_code == 200:
            departments = dept_response.json()
            if departments:
                # Find the test department or use the last one
                dept_id = None
                for dept in departments:
                    if dept.get('DepartmentName') == 'Test Department':
                        dept_id = dept['DepartmentID']
                        break
                if dept_id is None:
                    dept_id = departments[-1]['DepartmentID']
                
                # Test update
                results.append(test_api("PUT", f"/api/departments/{dept_id}", {"DepartmentName": "Updated Department"}))
                # Test delete
                results.append(test_api("DELETE", f"/api/departments/{dept_id}"))
    except Exception as e:
        print(f"Error setting up department tests: {e}")
    
    # Test Positions endpoints
    print("Testing Positions endpoints...")
    results.append(test_api("GET", "/api/positions"))
    results.append(test_api("POST", "/api/positions", {"PositionName": "Test Position"}, expected_status=201))
    
    # Test Payroll endpoints
    print("Testing Payroll endpoints...")
    results.append(test_api("GET", "/api/payroll"))
    results.append(test_api("GET", "/api/payroll/1/history"))
    
    # Test Attendance endpoints
    print("Testing Attendance endpoints...")
    results.append(test_api("GET", "/api/attendance"))
    results.append(test_api("GET", "/api/attendance/1"))
    
    # Test Reports endpoints
    print("Testing Reports endpoints...")
    results.append(test_api("GET", "/api/reports/hr"))
    results.append(test_api("GET", "/api/reports/payroll"))
    results.append(test_api("GET", "/api/reports/dividends"))
    
    # Test Alerts endpoint
    print("Testing Alerts endpoint...")
    results.append(test_api("GET", "/api/alerts"))
    
    # Print results
    print("\n" + "=" * 60)
    print("TEST RESULTS")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    
    for result in results:
        status_icon = "PASS" if result["success"] else "FAIL"
        print(f"[{status_icon}] {result['method']:6} {result['endpoint']:40} - Status: {result['status']}")
        if result["success"]:
            success_count += 1
        else:
            fail_count += 1
    
    print("\n" + "=" * 60)
    print(f"SUMMARY: {success_count} passed, {fail_count} failed")
    print("=" * 60)
    
    # Save detailed report
    with open("API_TEST_REPORT_NEW.md", "w", encoding="utf-8") as f:
        f.write("# HR Management System - API Test Report\n\n")
        f.write("**Date:** 2026-05-02\n")
        f.write("**Backend Status:** Testing on http://127.0.0.1:5000\n\n")
        f.write("## Test Results\n\n")
        f.write("| Endpoint | Method | Status | Result |\n")
        f.write("|----------|--------|--------|--------|\n")
        for result in results:
            status_icon = "PASS" if result["success"] else "FAIL"
            f.write(f"| {result['endpoint']} | {result['method']} | {result['status']} | {status_icon} |\n")
        
        f.write(f"\n## Summary\n")
        f.write(f"- Total Tests: {len(results)}\n")
        f.write(f"- Passed: {success_count}\n")
        f.write(f"- Failed: {fail_count}\n")
    
    print("\nDetailed report saved to API_TEST_REPORT_NEW.md")

if __name__ == "__main__":
    run_all_tests()