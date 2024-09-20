import unittest
import json
from src.api.endpoints import app
from src.core.database import User, Session, engine

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True 
        User.metadata.create_all(engine)
        self.session = Session()

    def tearDown(self):
        self.session.query(User).delete()
        self.session.commit()
        self.session.close()

    def test_create_user(self):
        response = self.app.post('/users',
                                 data=json.dumps({'username': 'testuser', 'email': 'test@example.com'}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(json.loads(response.data)['message'], 'User created successfully')

    def test_get_users(self):
        # First, add a user
        self.app.post('/users',
                      data=json.dumps({'username': 'testuser', 'email': 'test@example.com'}),
                      content_type='application/json')
        
        # Then, get all users
        response = self.app.get('/users')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['username'], 'testuser')
        self.assertEqual(data[0]['email'], 'test@example.com')

if __name__ == '__main__':
    unittest.main()
