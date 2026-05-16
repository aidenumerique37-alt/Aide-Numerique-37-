#!/usr/bin/env python3
"""
Backend API Testing for Aide Numérique 37 Blog Articles
Tests all CRUD operations and French slug generation
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class ArticleAPITester:
    def __init__(self, base_url: str = "https://french-it-services.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_articles = []  # Track created articles for cleanup

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> tuple[bool, Dict, int]:
        """Make HTTP request and return success, response data, status code"""
        # Ensure trailing slash for proper routing
        if endpoint == '':
            endpoint = '/'
        url = f"{self.base_url}/api/articles{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, {}, 0

            try:
                response_data = response.json() if response.content else {}
            except json.JSONDecodeError:
                response_data = {"raw_response": response.text}

            return response.status_code < 400, response_data, response.status_code

        except requests.exceptions.RequestException as e:
            print(f"Request error: {str(e)}")
            return False, {"error": str(e)}, 0

    def test_get_articles_empty(self):
        """Test GET /api/articles when no articles exist"""
        success, data, status = self.make_request('GET', '/')
        
        if success and status == 200:
            return self.log_test("GET Articles (Empty)", True, f"- Status: {status}, Count: {len(data)}")
        else:
            return self.log_test("GET Articles (Empty)", False, f"- Status: {status}, Error: {data}")

    def test_create_article_french(self):
        """Test POST /api/articles with French title (accents, spaces)"""
        article_data = {
            "title": "Conseils pour sécuriser votre ordinateur à domicile",
            "content": "Dans cet article, nous allons voir comment protéger efficacement votre ordinateur personnel.\n\nPremièrement, il est essentiel de maintenir votre système à jour.\n\nDeuxièmement, utilisez un antivirus fiable.",
            "published": True
        }
        
        success, data, status = self.make_request('POST', '/', article_data)
        
        if success and status == 201:
            # Check if slug was generated correctly
            expected_slug = "conseils-pour-securiser-votre-ordinateur-a-domicile"
            actual_slug = data.get('slug', '')
            
            if expected_slug in actual_slug:  # Allow for timestamp suffix
                self.created_articles.append(data.get('_id'))
                return self.log_test("Create Article (French)", True, f"- Slug: {actual_slug}")
            else:
                return self.log_test("Create Article (French)", False, f"- Wrong slug: {actual_slug}")
        else:
            return self.log_test("Create Article (French)", False, f"- Status: {status}, Error: {data}")

    def test_create_article_accents(self):
        """Test POST /api/articles with heavy French accents"""
        article_data = {
            "title": "Résoudre les problèmes de connexion WiFi - Guide complet",
            "content": "Voici un guide détaillé pour résoudre vos problèmes de connexion WiFi.",
            "published": True
        }
        
        success, data, status = self.make_request('POST', '/', article_data)
        
        if success and status == 201:
            # Check accent handling in slug
            slug = data.get('slug', '')
            # Should convert é->e, è->e, etc.
            if 'resoudre' in slug and 'problemes' in slug and 'wifi' in slug:
                self.created_articles.append(data.get('_id'))
                return self.log_test("Create Article (Accents)", True, f"- Slug: {slug}")
            else:
                return self.log_test("Create Article (Accents)", False, f"- Slug conversion failed: {slug}")
        else:
            return self.log_test("Create Article (Accents)", False, f"- Status: {status}, Error: {data}")

    def test_get_articles_populated(self):
        """Test GET /api/articles when articles exist"""
        success, data, status = self.make_request('GET', '/')
        
        if success and status == 200 and len(data) >= 2:
            # Check article structure
            article = data[0]
            required_fields = ['_id', 'title', 'content', 'slug', 'created_at', 'updated_at']
            missing_fields = [field for field in required_fields if field not in article]
            
            if not missing_fields:
                return self.log_test("GET Articles (Populated)", True, f"- Count: {len(data)}, Fields: OK")
            else:
                return self.log_test("GET Articles (Populated)", False, f"- Missing fields: {missing_fields}")
        else:
            return self.log_test("GET Articles (Populated)", False, f"- Status: {status}, Count: {len(data) if success else 0}")

    def test_get_article_by_slug(self):
        """Test GET /api/articles/{slug}"""
        if not self.created_articles:
            return self.log_test("GET Article by Slug", False, "- No articles created to test")
        
        # First get all articles to find a slug
        success, articles, status = self.make_request('GET', '/')
        if not success or not articles:
            return self.log_test("GET Article by Slug", False, "- Could not fetch articles list")
        
        test_slug = articles[0].get('slug')
        if not test_slug:
            return self.log_test("GET Article by Slug", False, "- No slug found in article")
        
        success, data, status = self.make_request('GET', f'/{test_slug}')
        
        if success and status == 200:
            if data.get('slug') == test_slug:
                return self.log_test("GET Article by Slug", True, f"- Slug: {test_slug}")
            else:
                return self.log_test("GET Article by Slug", False, f"- Slug mismatch: {data.get('slug')}")
        else:
            return self.log_test("GET Article by Slug", False, f"- Status: {status}, Error: {data}")

    def test_get_nonexistent_article(self):
        """Test GET /api/articles/{slug} with non-existent slug"""
        fake_slug = "article-inexistant-test-123"
        success, data, status = self.make_request('GET', f'/{fake_slug}')
        
        if not success and status == 404:
            return self.log_test("GET Non-existent Article", True, f"- Status: {status} (Expected)")
        else:
            return self.log_test("GET Non-existent Article", False, f"- Status: {status} (Expected 404)")

    def test_update_article(self):
        """Test PUT /api/articles/{id}"""
        if not self.created_articles:
            return self.log_test("Update Article", False, "- No articles created to test")
        
        article_id = self.created_articles[0]
        update_data = {
            "title": "Titre mis à jour avec des accents éèà",
            "content": "Contenu mis à jour pour tester la modification."
        }
        
        success, data, status = self.make_request('PUT', f'/{article_id}', update_data)
        
        if success and status == 200:
            if data.get('title') == update_data['title']:
                return self.log_test("Update Article", True, f"- Updated title: {data.get('title')}")
            else:
                return self.log_test("Update Article", False, f"- Title not updated: {data.get('title')}")
        else:
            return self.log_test("Update Article", False, f"- Status: {status}, Error: {data}")

    def test_delete_article(self):
        """Test DELETE /api/articles/{id}"""
        if not self.created_articles:
            return self.log_test("Delete Article", False, "- No articles created to test")
        
        article_id = self.created_articles.pop()  # Remove from tracking
        success, data, status = self.make_request('DELETE', f'/{article_id}')
        
        if status == 204:
            return self.log_test("Delete Article", True, f"- Status: {status}")
        else:
            return self.log_test("Delete Article", False, f"- Status: {status}, Expected: 204")

    def test_delete_nonexistent_article(self):
        """Test DELETE /api/articles/{id} with non-existent ID"""
        fake_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format but non-existent
        success, data, status = self.make_request('DELETE', f'/{fake_id}')
        
        if status == 404:
            return self.log_test("Delete Non-existent Article", True, f"- Status: {status} (Expected)")
        else:
            return self.log_test("Delete Non-existent Article", False, f"- Status: {status} (Expected 404)")

    def cleanup_created_articles(self):
        """Clean up any remaining test articles"""
        print(f"\n🧹 Cleaning up {len(self.created_articles)} test articles...")
        for article_id in self.created_articles:
            self.make_request('DELETE', f'/{article_id}')
        self.created_articles.clear()

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Backend API Tests for Aide Numérique 37 Blog")
        print(f"📡 Testing endpoint: {self.base_url}/api/articles")
        print("=" * 60)

        # Test sequence
        self.test_get_articles_empty()
        self.test_create_article_french()
        self.test_create_article_accents()
        self.test_get_articles_populated()
        self.test_get_article_by_slug()
        self.test_get_nonexistent_article()
        self.test_update_article()
        self.test_delete_article()
        self.test_delete_nonexistent_article()

        # Cleanup
        self.cleanup_created_articles()

        # Results
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests passed!")
            return 0
        else:
            print("⚠️  Some backend tests failed!")
            return 1

def main():
    """Main test execution"""
    tester = ArticleAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())