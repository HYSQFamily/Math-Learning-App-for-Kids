from app.database import Base, engine
from app.models import User, Problem, Attempt, KnowledgePointPerformance, Achievement

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(engine)
    print("Database tables created successfully.")

if __name__ == "__main__":
    init_db()
