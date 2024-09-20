import unittest
from src.core.database import User, Session, engine
from sqlalchemy.orm import sessionmaker

class TestDatabase(unittest.TestCase):
    def setUp(self):
        # Create all tables
        User.metadata.create_all(engine)
        # Create a new session for each test
        self.session = sessionmaker(bind=engine)()

    def tearDown(self):
        # Remove all data after each test
        self.session.query(User).delete()
        self.session.commit()
        self.session.close()

    def test_create_user(self):
        user = User(username='testuser', email='test@example.com')
        self.session.add(user)
        self.session.commit()

        retrieved_user = self.session.query(User).filter_by(username='testuser').first()
        self.assertIsNotNone(retrieved_user)
        self.assertEqual(retrieved_user.email, 'test@example.com')

    def test_unique_constraint(self):
        user1 = User(username='testuser', email='test1@example.com')
        user2 = User(username='testuser', email='test2@example.com')
        self.session.add(user1)
        self.session.commit()
        
        with self.assertRaises(Exception):  # This will depend on the specific exception SQLAlchemy raises
            self.session.add(user2)
            self.session.commit()

if __name__ == '__main__':
    unittest.main()
