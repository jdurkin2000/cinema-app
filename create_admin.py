#!/usr/bin/env python3
"""
Create an ADMIN user in the app's MongoDB.
Usage: python create_admin.py [email] [password]
Defaults: admin@local / AdminPass123

This script requires `pymongo` (already available) and `bcrypt`.
If `bcrypt` is missing it will attempt to install it with pip.
"""
import sys
import subprocess
import json

MONGO_URI = "mongodb+srv://durkinjfd_db_user:gwk4wmbkZlBFHguU@ticket-cluster.fafzycr.mongodb.net/?retryWrites=true&w=majority&appName=ticket-cluster"
DATABASE_NAME = "sample_mflix"
USERS_COLL = "users"

email = sys.argv[1] if len(sys.argv) > 1 else "admin@local"
password = sys.argv[2] if len(sys.argv) > 2 else "AdminPass123"

# Ensure bcrypt available
try:
    import bcrypt
except Exception:
    print("bcrypt not found, installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "bcrypt"])
    import bcrypt

from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from datetime import datetime

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
users = db[USERS_COLL]

# Check if user exists
if users.find_one({"email": email.lower()}):
    print(f"User with email {email} already exists. Exiting.")
    sys.exit(0)

# Generate bcrypt hash compatible with Spring's BCryptPasswordEncoder
pw_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

user_doc = {
    # Let Mongo autogenerate _id if desired
    "name": "Administrator",
    "email": email.lower(),
    "passwordHash": pw_hash,
    "role": "ADMIN",
    "status": "ACTIVE",
    "promotionsOptIn": False,
    "emailVerified": True,
    "createdAt": datetime.utcnow(),
    "updatedAt": datetime.utcnow()
}

try:
    res = users.insert_one(user_doc)
    print(f"Inserted admin user {email} with _id={res.inserted_id}")
    print("Credentials:")
    print(json.dumps({"email": email, "password": password}))
except DuplicateKeyError:
    print("DuplicateKeyError: user already exists")
except Exception as e:
    print("Failed to insert user:", e)
finally:
    client.close()
