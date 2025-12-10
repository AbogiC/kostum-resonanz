#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta

class CostumeRentalAPITester:
    def __init__(self, base_url="https://costume-lease.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.user_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_user_email = f"testuser_{datetime.now().strftime('%H%M%S')}@test.com"
        self.test_user_password = "TestPass123!"
        self.test_user_name = "Test User"
        
        self.admin_email = "admin@theatrical.com"
        self.admin_password = "admin123"
        
        self.test_costume_id = None

    def log_test(self, name, success, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            print(f"❌ {name}: FAILED - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def make_request(self, method, endpoint, data=None, token=None, params=None):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")
            return None

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        response = self.make_request('POST', 'auth/register', {
            "email": self.test_user_email,
            "password": self.test_user_password,
            "name": self.test_user_name
        })
        
        if response and response.status_code == 200:
            data = response.json()
            if 'access_token' in data and 'user' in data:
                self.user_token = data['access_token']
                self.log_test("User Registration", True, response_data=data)
                return True
            else:
                self.log_test("User Registration", False, "Missing token or user data")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else "No response"
            self.log_test("User Registration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        return False

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔍 Testing Admin Login...")
        
        response = self.make_request('POST', 'auth/login', {
            "email": self.admin_email,
            "password": self.admin_password
        })
        
        if response and response.status_code == 200:
            data = response.json()
            if 'access_token' in data and data.get('user', {}).get('role') == 'admin':
                self.admin_token = data['access_token']
                self.log_test("Admin Login", True, response_data=data)
                return True
            else:
                self.log_test("Admin Login", False, "Missing token or not admin role")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else "No response"
            self.log_test("Admin Login", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        return False

    def test_user_login(self):
        """Test user login with registered user"""
        print("\n🔍 Testing User Login...")
        
        response = self.make_request('POST', 'auth/login', {
            "email": self.test_user_email,
            "password": self.test_user_password
        })
        
        if response and response.status_code == 200:
            data = response.json()
            if 'access_token' in data:
                self.user_token = data['access_token']
                self.log_test("User Login", True, response_data=data)
                return True
            else:
                self.log_test("User Login", False, "Missing access token")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else "No response"
            self.log_test("User Login", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        print("\n🔍 Testing Get Current User...")
        
        if not self.user_token:
            self.log_test("Get Current User", False, "No user token available")
            return False
        
        response = self.make_request('GET', 'auth/me', token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if 'email' in data and 'name' in data:
                self.log_test("Get Current User", True, response_data=data)
                return True
            else:
                self.log_test("Get Current User", False, "Missing user data")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else "No response"
            self.log_test("Get Current User", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        return False

    def test_get_costumes(self):
        """Test getting costumes list"""
        print("\n🔍 Testing Get Costumes...")
        
        response = self.make_request('GET', 'costumes')
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Get Costumes", True, f"Found {len(data)} costumes", response_data={"count": len(data)})
                if len(data) > 0:
                    self.test_costume_id = data[0].get('id')
                return True
            else:
                self.log_test("Get Costumes", False, "Response is not a list")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else "No response"
            self.log_test("Get Costumes", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        return False

    def test_search_costumes(self):
        """Test searching costumes"""
        print("\n🔍 Testing Search Costumes...")
        
        # Test search by category
        response = self.make_request('GET', 'costumes', params={'category': 'Period'})
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Search Costumes by Category", True, f"Found {len(data)} Period costumes")
        else:
            self.log_test("Search Costumes by Category", False, "Search failed")
        
        # Test search by text
        response = self.make_request('GET', 'costumes', params={'search': 'dress'})
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Search Costumes by Text", True, f"Found {len(data)} costumes matching 'dress'")
            return True
        else:
            self.log_test("Search Costumes by Text", False, "Text search failed")
        
        return False

    def test_get_costume_detail(self):
        """Test getting costume details"""
        print("\n🔍 Testing Get Costume Detail...")
        
        if not self.test_costume_id:
            self.log_test("Get Costume Detail", False, "No costume ID available")
            return False
        
        response = self.make_request('GET', f'costumes/{self.test_costume_id}')
        
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and 'name' in data:
                self.log_test("Get Costume Detail", True, response_data=data)
                return True
            else:
                self.log_test("Get Costume Detail", False, "Missing costume data")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else "No response"
            self.log_test("Get Costume Detail", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        return False

    def test_create_costume_admin(self):
        """Test creating costume as admin"""
        print("\n🔍 Testing Create Costume (Admin)...")
        
        if not self.admin_token:
            self.log_test("Create Costume (Admin)", False, "No admin token available")
            return False
        
        costume_data = {
            "name": "Test Costume",
            "description": "A test costume for automated testing",
            "category": "Modern",
            "sizes": ["S", "M", "L"],
            "images": ["https://example.com/test-costume.jpg"],
            "price_per_day": 50.0,
            "available": True
        }
        
        response = self.make_request('POST', 'costumes', costume_data, token=self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data:
                self.test_costume_id = data['id']  # Update for further tests
                self.log_test("Create Costume (Admin)", True, response_data=data)
                return True
            else:
                self.log_test("Create Costume (Admin)", False, "Missing costume ID in response")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else "No response"
            self.log_test("Create Costume (Admin)", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        return False

    def test_create_booking(self):
        """Test creating a booking"""
        print("\n🔍 Testing Create Booking...")
        
        if not self.user_token or not self.test_costume_id:
            self.log_test("Create Booking", False, "Missing user token or costume ID")
            return False
        
        # Calculate dates
        start_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        end_date = (datetime.now() + timedelta(days=10)).strftime('%Y-%m-%d')
        
        booking_data = {
            "costume_id": self.test_costume_id,
            "start_date": start_date,
            "end_date": end_date,
            "size": "M",
            "notes": "Test booking for automated testing"
        }
        
        response = self.make_request('POST', 'bookings', booking_data, token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data:
                self.test_booking_id = data['id']
                self.log_test("Create Booking", True, response_data=data)
                return True
            else:
                self.log_test("Create Booking", False, "Missing booking ID in response")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else "No response"
            self.log_test("Create Booking", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        return False

    def test_get_user_bookings(self):
        """Test getting user bookings"""
        print("\n🔍 Testing Get User Bookings...")
        
        if not self.user_token:
            self.log_test("Get User Bookings", False, "No user token available")
            return False
        
        response = self.make_request('GET', 'bookings', token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Get User Bookings", True, f"Found {len(data)} bookings")
                return True
            else:
                self.log_test("Get User Bookings", False, "Response is not a list")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else "No response"
            self.log_test("Get User Bookings", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        return False

    def test_get_admin_bookings(self):
        """Test getting all bookings as admin"""
        print("\n🔍 Testing Get Admin Bookings...")
        
        if not self.admin_token:
            self.log_test("Get Admin Bookings", False, "No admin token available")
            return False
        
        response = self.make_request('GET', 'admin/bookings', token=self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Get Admin Bookings", True, f"Found {len(data)} total bookings")
                return True
            else:
                self.log_test("Get Admin Bookings", False, "Response is not a list")
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else "No response"
            self.log_test("Get Admin Bookings", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        return False

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        print("\n🔍 Testing Unauthorized Access...")
        
        # Test accessing user bookings without token
        response = self.make_request('GET', 'bookings')
        if response and response.status_code == 401:
            self.log_test("Unauthorized Access - User Bookings", True, "Correctly rejected")
        else:
            self.log_test("Unauthorized Access - User Bookings", False, "Should have returned 401")
        
        # Test accessing admin endpoints with user token
        response = self.make_request('GET', 'admin/bookings', token=self.user_token)
        if response and response.status_code == 403:
            self.log_test("Unauthorized Access - Admin Endpoint", True, "Correctly rejected")
            return True
        else:
            self.log_test("Unauthorized Access - Admin Endpoint", False, "Should have returned 403")
        
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Costume Rental API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Authentication tests
        self.test_user_registration()
        self.test_admin_login()
        self.test_user_login()
        self.test_get_current_user()
        
        # Costume tests
        self.test_get_costumes()
        self.test_search_costumes()
        self.test_get_costume_detail()
        self.test_create_costume_admin()
        
        # Booking tests
        self.test_create_booking()
        self.test_get_user_bookings()
        self.test_get_admin_bookings()
        
        # Security tests
        self.test_unauthorized_access()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = CostumeRentalAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'tests_run': tester.tests_run,
                'tests_passed': tester.tests_passed,
                'success_rate': (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0
            },
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())