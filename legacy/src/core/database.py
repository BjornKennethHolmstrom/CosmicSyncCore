import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    profile = Column(JSONB)
    messages = relationship("Message", back_populates="user")

class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    user = relationship("User", back_populates="messages")

# Construct database URL from environment variables
DATABASE_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

def add_message(content, user_id):
    with Session() as session:
        new_message = Message(content=content, user_id=user_id)
        session.add(new_message)
        session.commit()
        return new_message.id

def get_recent_messages(limit=10):
    with Session() as session:
        messages = session.query(Message).order_by(Message.timestamp.desc()).limit(limit).all()
        return messages

def add_user(username, email, profile=None):
    with Session() as session:
        new_user = User(username=username, email=email, profile=profile)
        session.add(new_user)
        session.commit()
        return new_user.id

def get_user(user_id):
    with Session() as session:
        return session.query(User).filter(User.id == user_id).first()

# Example of a more complex query using PostgreSQL features
def search_users_by_profile(search_term):
    with Session() as session:
        return session.query(User).filter(User.profile.contains(search_term)).all()
