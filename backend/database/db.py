
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "resume_analyzer.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row

    # Enforce foreign key relationships.
    connection.execute("PRAGMA foreign_keys = ON")

    return connection


def initialize_database():
    with get_connection() as connection:

        # 1. Create users table.
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                profile_picture TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 2. Safely migrate existing users table.
        user_columns = connection.execute(
            "PRAGMA table_info(users)"
        ).fetchall()

        user_column_names = [
            column["name"] for column in user_columns
        ]

        if "profile_picture" not in user_column_names:
            connection.execute("""
                ALTER TABLE users
                ADD COLUMN profile_picture TEXT
            """)

        # 3. Create analyses table.
        connection.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                score REAL NOT NULL,
                matched_skills TEXT NOT NULL,
                missing_skills TEXT NOT NULL,
                suggestions TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # 4. Safely migrate existing analyses table.
        columns = connection.execute(
            "PRAGMA table_info(analyses)"
        ).fetchall()

        column_names = [column["name"] for column in columns]

        if "user_id" not in column_names:
            connection.execute("""
                ALTER TABLE analyses
                ADD COLUMN user_id INTEGER REFERENCES users(id)
                ON DELETE CASCADE
            """)

        # 5. Create password reset tokens table.
        connection.execute("""
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at TEXT NOT NULL,
                used_at TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        """)

        # 6. Create indexes.
        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_analyses_user_id
            ON analyses(user_id)
        """)

        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_email
            ON users(email)
        """)

        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_id
            ON password_reset_tokens(user_id)
        """)

        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_reset_tokens_expiry
            ON password_reset_tokens(expires_at)
        """)

        connection.commit()

    print("Database initialized successfully.")
    print("Users table is ready.")
    print("Profile picture column is ready.")
    print("Analyses table is ready.")
    print("Password reset tokens table is ready.")
