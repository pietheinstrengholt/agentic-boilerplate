"""Create a demo account after the database migration has run."""

import argparse
from getpass import getpass

from sqlalchemy import select

from app.db import SessionLocal
from app.models import User
from app.security import hash_password


def main() -> None:
    """Prompt for a password so it does not appear in shell history."""
    parser = argparse.ArgumentParser(description="Create a Wine Journal demo user")
    parser.add_argument("username")
    args = parser.parse_args()
    if SessionLocal is None:
        parser.error("Set DATABASE_URL before creating a user")
    password = getpass("Password: ")
    if len(password) < 8:
        parser.error("Password must be at least 8 characters")
    with SessionLocal() as session:
        if session.scalar(select(User).where(User.username == args.username)):
            parser.error("Username already exists")
        session.add(User(username=args.username, password_hash=hash_password(password)))
        session.commit()
    print(f"Created user {args.username}")


if __name__ == "__main__":
    main()
