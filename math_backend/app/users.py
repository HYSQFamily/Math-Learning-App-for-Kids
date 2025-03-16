from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import uuid4
import sqlalchemy.exc

from app.database import get_db
from app.models import User, UserCreate, UserResponse, ProgressResponse, Attempt, KnowledgePointPerformance, Achievement

router = APIRouter()

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        # Return existing user instead of creating a new one
        return existing_user
    
    # Create new user with UUID
    db_user = User(
        id=str(uuid4()),
        username=user.username,
        grade_level=user.grade_level,
        points=0,
        streak_days=0
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    # Handle "undefined" user ID
    if user_id == "undefined" or user_id == "null":
        return UserResponse(
            id="default-user",
            username="DefaultUser",
            grade_level=3,
            points=0,
            streak_days=0
        )
    
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            # Create a default user if not found (for demo purposes)
            user = User(
                id=user_id,
                username=f"User_{user_id[:8]}",  # Use part of the ID as username to avoid conflicts
                grade_level=3,
                points=0,
                streak_days=0
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    except sqlalchemy.exc.IntegrityError:
        # Handle case where user ID exists but username conflicts
        db.rollback()
        # Return a temporary user object without saving to DB
        return UserResponse(
            id=user_id,
            username=f"User_{user_id[:8]}",
            grade_level=3,
            points=0,
            streak_days=0
        )

@router.get("/{user_id}/progress", response_model=ProgressResponse)
def get_user_progress(user_id: str, db: Session = Depends(get_db)):
    # Handle "undefined" user ID
    if user_id == "undefined" or user_id == "null":
        return ProgressResponse(
            points=0,
            streak_days=0,
            mastery_levels={
                "addition": 0.0,
                "subtraction": 0.0,
                "multiplication": 0.0
            },
            achievements=[]
        )
    
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            # Create a default user if not found
            try:
                user = User(
                    id=user_id,
                    username=f"User_{user_id[:8]}",  # Use part of the ID as username to avoid conflicts
                    grade_level=3,
                    points=0,
                    streak_days=0
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            except sqlalchemy.exc.IntegrityError:
                # Handle case where user ID exists but username conflicts
                db.rollback()
                # Use a temporary user object
                user = User(
                    id=user_id,
                    username=f"User_{user_id[:8]}",
                    grade_level=3,
                    points=0,
                    streak_days=0
                )
        
        # Get knowledge point performances
        performances = db.query(KnowledgePointPerformance).filter(
            KnowledgePointPerformance.user_id == user_id
        ).all()
        
        # Create mastery levels dictionary
        mastery_levels = {
            perf.knowledge_point: perf.mastery_level 
            for perf in performances
        }
        
        # Get achievements
        achievements = db.query(Achievement).filter(
            Achievement.user_id == user_id
        ).all()
        
        # If no data exists yet, create sample data for demo
        if not performances:
            # Sample mastery levels
            mastery_levels = {
                "addition": 0.2,
                "subtraction": 0.1,
                "multiplication": 0.0
            }
        
        return ProgressResponse(
            points=user.points,
            streak_days=user.streak_days,
            mastery_levels=mastery_levels,
            achievements=achievements if achievements else []
        )
    except Exception as e:
        # Fallback for any other errors
        print(f"Error in get_user_progress: {str(e)}")
        return ProgressResponse(
            points=0,
            streak_days=0,
            mastery_levels={
                "addition": 0.0,
                "subtraction": 0.0,
                "multiplication": 0.0
            },
            achievements=[]
        )
