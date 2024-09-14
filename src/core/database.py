from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)

class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, nullable=False)

engine = create_engine('sqlite:///cosmicsynccore.db')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

def add_message(content, user_id):
    session = Session()
    new_message = Message(content=content, user_id=user_id)
    session.add(new_message)
    session.commit()
    session.close()

def get_recent_messages(limit=10):
    session = Session()
    messages = session.query(Message).order_by(Message.timestamp.desc()).limit(limit).all()
    session.close()
    return messages
