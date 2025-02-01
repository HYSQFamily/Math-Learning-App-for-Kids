from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    username = Column(String, unique=True)
    grade_level = Column(Integer)
    points = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    last_practice = Column(DateTime, default=datetime.utcnow)

class Problem(Base):
    __tablename__ = "problems"
    id = Column(String, primary_key=True)
    type = Column(String)
    question = Column(String)
    correct_answer = Column(Float)
    difficulty = Column(Integer)
    hints = Column(String)
    explanation = Column(String)
    knowledge_point = Column(String)
    related_points = Column(String)

class Attempt(Base):
    __tablename__ = "attempts"
    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    problem_id = Column(String, ForeignKey("problems.id"))
    answer = Column(Float)
    is_correct = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")
    problem = relationship("Problem")

class KnowledgePointPerformance(Base):
    __tablename__ = "knowledge_point_performance"
    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    knowledge_point = Column(String)
    mastery_level = Column(Float, default=0)
    total_attempts = Column(Integer, default=0)
    correct_attempts = Column(Integer, default=0)
    last_attempt = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")
