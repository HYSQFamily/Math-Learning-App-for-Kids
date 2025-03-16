from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pydantic import BaseModel, ConfigDict, field_validator
from typing import List, Dict, Optional, Union, Any
from datetime import datetime
import json

Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    username = Column(String, unique=True)
    grade_level = Column(Integer)
    points = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    
    attempts = relationship("Attempt", back_populates="user")
    performances = relationship("KnowledgePointPerformance", back_populates="user")
    achievements = relationship("Achievement", back_populates="user")

class Problem(Base):
    __tablename__ = "problems"
    
    id = Column(String, primary_key=True)
    type = Column(String)
    question = Column(String)
    answer = Column(Float)
    difficulty = Column(Integer)
    hints = Column(String)
    knowledge_point = Column(String)
    
    attempts = relationship("Attempt", back_populates="problem")

class Attempt(Base):
    __tablename__ = "attempts"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    problem_id = Column(String, ForeignKey("problems.id"))
    answer = Column(Float)
    is_correct = Column(Boolean)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="attempts")
    problem = relationship("Problem", back_populates="attempts")

class KnowledgePointPerformance(Base):
    __tablename__ = "knowledge_point_performances"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    knowledge_point = Column(String)
    mastery_level = Column(Float, default=0.0)
    
    user = relationship("User", back_populates="performances")

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    name = Column(String)
    description = Column(String)
    points = Column(Integer)
    
    user = relationship("User", back_populates="achievements")

# Pydantic Models for API
class UserCreate(BaseModel):
    username: str
    grade_level: int = 3
    
    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id: str
    username: str
    grade_level: int
    points: int
    streak_days: int
    
    model_config = ConfigDict(from_attributes=True)

class ProblemResponse(BaseModel):
    id: str
    question: str
    answer: float
    difficulty: int
    hints: Union[str, List[str]]
    knowledge_point: str
    type: str
    
    model_config = ConfigDict(from_attributes=True)
    
    @field_validator('hints')
    @classmethod
    def validate_hints(cls, v):
        if isinstance(v, str):
            try:
                # Try to parse as JSON
                hints_list = json.loads(v)
                if isinstance(hints_list, list):
                    return v  # Keep as string if it's a valid JSON list
                return v  # Keep as string if it's not a list
            except:
                return v  # Keep as string if it's not valid JSON
        elif isinstance(v, list):
            return json.dumps(v)  # Convert list to JSON string
        return v

class AttemptCreate(BaseModel):
    user_id: str
    problem_id: str
    answer: float
    
    model_config = ConfigDict(from_attributes=True)

class AttemptResponse(BaseModel):
    id: str
    is_correct: bool
    explanation: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class AchievementModel(BaseModel):
    id: str
    name: str
    description: str
    points: int
    
    model_config = ConfigDict(from_attributes=True)

class ProgressResponse(BaseModel):
    points: int
    streak_days: int
    mastery_levels: Dict[str, float]
    achievements: List[AchievementModel]
    
    model_config = ConfigDict(from_attributes=True)
