#!/usr/bin/env python3
"""
Database path fix script for Math Learning App backend.
This script ensures the database is properly initialized with the correct path.
"""
import os
import sqlite3
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Database paths
DB_PATH = "./math_app.db"
BACKUP_PATH = "./math_app.db.backup"

def fix_database_path():
    """Fix database path and ensure it's properly initialized."""
    try:
        # Check if database exists
        db_file = Path(DB_PATH)
        if db_file.exists():
            logger.info(f"Database already exists at {DB_PATH}")
            # Create backup
            import shutil
            shutil.copy(DB_PATH, BACKUP_PATH)
            logger.info(f"Created backup at {BACKUP_PATH}")
        else:
            logger.info(f"Creating new database at {DB_PATH}")
            
        # Initialize database with sample problems
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Create problems table if it doesn't exist
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS problems (
            id TEXT PRIMARY KEY,
            type TEXT,
            question TEXT,
            answer REAL,
            difficulty INTEGER,
            hints TEXT,
            knowledge_point TEXT
        )
        ''')
        
        # Check if problems table is empty
        cursor.execute("SELECT COUNT(*) FROM problems")
        count = cursor.fetchone()[0]
        
        if count == 0:
            logger.info("Adding sample problems to database")
            # Add sample problems
            sample_problems = [
                ('p1', 'arithmetic', '5 + 7 = ?', 12, 1, 'Count on your fingers', 'addition'),
                ('p2', 'arithmetic', '15 - 8 = ?', 7, 2, 'Use subtraction strategy', 'subtraction'),
                ('p3', 'arithmetic', '6 × 4 = ?', 24, 2, 'Think of 4 groups of 6', 'multiplication'),
                ('p4', 'arithmetic', '20 ÷ 5 = ?', 4, 3, 'Think of sharing 20 items into 5 groups', 'division'),
                ('p5', 'arithmetic', '9 + 6 = ?', 15, 1, 'Make 10 first, then add the rest', 'addition'),
                ('p6', 'arithmetic', '13 - 5 = ?', 8, 2, 'Count backwards from 13', 'subtraction'),
                ('p7', 'arithmetic', '7 × 3 = ?', 21, 2, 'Add 7 three times', 'multiplication'),
                ('p8', 'arithmetic', '18 ÷ 3 = ?', 6, 3, 'Think of sharing 18 items into 3 groups', 'division'),
                ('p9', 'arithmetic', '8 + 9 = ?', 17, 2, 'Make it 8 + 10 - 1', 'addition'),
                ('p10', 'arithmetic', '14 - 6 = ?', 8, 2, 'Think of it as 14 - 4 - 2', 'subtraction')
            ]
            
            cursor.executemany('''
            INSERT OR REPLACE INTO problems (id, type, question, answer, difficulty, hints, knowledge_point)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', sample_problems)
            
            conn.commit()
            logger.info(f"Added {len(sample_problems)} sample problems to database")
        else:
            logger.info(f"Database already contains {count} problems")
        
        conn.close()
        logger.info("Database initialization complete")
        return True
    except Exception as e:
        logger.error(f"Error fixing database: {str(e)}")
        return False

if __name__ == "__main__":
    success = fix_database_path()
    if success:
        logger.info("Database path fix completed successfully")
    else:
        logger.error("Database path fix failed")
