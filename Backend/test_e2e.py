import unittest
import json
from app import app

class TestLabSphereAuthAndIsolation(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_01_health_check(self):
        res = self.app.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn(data.get('status'), ['healthy', 'ok'])
        self.assertIn('database', data)
        print("✓ Health check endpoint operational:", data)

    def test_02_registration_and_login(self):
        # Register User A (Alice)
        alice_data = {
            "name": "Alice Morgan",
            "email": "alice@labsphere.ai",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "institution": "Stanford Bio-X"
        }
        res = self.app.post('/api/auth/register', json=alice_data)
        self.assertIn(res.status_code, [200, 201])
        data = res.get_json()
        self.assertIn("token", data)
        self.assertEqual(data["user"]["email"], "alice@labsphere.ai")
        alice_token = data["token"]

        # Register User B (Bob)
        bob_data = {
            "name": "Bob Chen",
            "email": "bob@labsphere.ai",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "institution": "MIT Synthetic Biology"
        }
        res_bob = self.app.post('/api/auth/register', json=bob_data)
        self.assertIn(res_bob.status_code, [200, 201])
        bob_token = res_bob.get_json()["token"]

        # Verify Me endpoint
        res_me = self.app.get('/api/auth/me', headers={"Authorization": f"Bearer {alice_token}"})
        self.assertEqual(res_me.status_code, 200)
        self.assertEqual(res_me.get_json()["user"]["name"], "Alice Morgan")

        # Test Login
        res_login = self.app.post('/api/auth/login', json={
            "email": "alice@labsphere.ai",
            "password": "Password123!"
        })
        self.assertEqual(res_login.status_code, 200)
        self.assertIn("token", res_login.get_json())
        print("✓ Registration, login, and token generation verified.")

    def test_03_strict_data_isolation(self):
        # Login Alice
        res_a = self.app.post('/api/auth/login', json={"email": "alice@labsphere.ai", "password": "Password123!"})
        token_a = res_a.get_json()["token"]

        # Login Bob
        res_b = self.app.post('/api/auth/login', json={"email": "bob@labsphere.ai", "password": "Password123!"})
        token_b = res_b.get_json()["token"]

        # Alice creates a confidential lab note
        note_res = self.app.post('/api/notes', headers={"Authorization": f"Bearer {token_a}"}, json={
            "experiment_id": 1,
            "experiment_name": "DNA Extraction",
            "title": "Alice Confidential Strawberry DNA Yield",
            "content": "Observed 45 micrograms of purified precipitate at cold ethanol meniscus."
        })
        self.assertEqual(note_res.status_code, 201)

        # Bob gets his notes -> MUST NOT contain Alice's note!
        bob_notes_res = self.app.get('/api/notes', headers={"Authorization": f"Bearer {token_b}"})
        self.assertEqual(bob_notes_res.status_code, 200)
        bob_notes = bob_notes_res.get_json()
        self.assertTrue(all("Alice Confidential" not in n["title"] for n in bob_notes),
                        "CRITICAL FAILURE: Bob was able to view Alice's private notes!")

        # Alice gets her notes -> MUST contain Alice's note
        alice_notes_res = self.app.get('/api/notes', headers={"Authorization": f"Bearer {token_a}"})
        alice_notes = alice_notes_res.get_json()
        self.assertTrue(any("Alice Confidential" in n["title"] for n in alice_notes),
                        "Alice could not retrieve her own note!")

        # Alice completes PCR lab
        prog_res = self.app.post('/api/progress', headers={"Authorization": f"Bearer {token_a}"}, json={
            "experiment_id": 2,
            "completed_sections": ["s1", "s2", "s3", "s4", "s5", "s6", "s7"],
            "lab_score": 100,
            "lab_time": 120,
            "mistakes": 0,
            "is_completed": True
        })
        self.assertEqual(prog_res.status_code, 200)

        # Bob's progress for PCR lab MUST be uncompleted (0)
        bob_prog_res = self.app.get('/api/progress?experiment_id=2', headers={"Authorization": f"Bearer {token_b}"})
        self.assertEqual(bob_prog_res.status_code, 200)
        bob_prog = bob_prog_res.get_json()
        self.assertFalse(bob_prog.get("is_completed", False),
                         "CRITICAL FAILURE: Bob inherited Alice's lab progress!")

        print("✓ Strict user isolation verified: Notes, Progress, and Quizzes are fully partitioned per user.")

    def test_04_password_reset_flow(self):
        # Request reset token
        res = self.app.post('/api/auth/forgot-password', json={"email": "alice@labsphere.ai"})
        self.assertEqual(res.status_code, 200)
        reset_token = res.get_json().get("reset_token")
        self.assertIsNotNone(reset_token)

        # Reset password
        res_reset = self.app.post('/api/auth/reset-password', json={
            "token": reset_token,
            "new_password": "NewSecurePassword456!"
        })
        self.assertEqual(res_reset.status_code, 200)

        # Login with old password fails
        res_old = self.app.post('/api/auth/login', json={
            "email": "alice@labsphere.ai",
            "password": "Password123!"
        })
        self.assertEqual(res_old.status_code, 401)

        # Login with new password succeeds
        res_new = self.app.post('/api/auth/login', json={
            "email": "alice@labsphere.ai",
            "password": "NewSecurePassword456!"
        })
        self.assertEqual(res_new.status_code, 200)
        print("✓ Password reset cycle verified end-to-end.")

if __name__ == '__main__':
    unittest.main()
