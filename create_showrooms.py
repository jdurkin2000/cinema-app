#!/usr/bin/env python3
"""
Script to create sample showrooms in MongoDB for the Cinema App
"""

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError

# MongoDB connection details
MONGO_URI = "mongodb+srv://durkinjfd_db_user:gwk4wmbkZlBFHguU@ticket-cluster.fafzycr.mongodb.net/?retryWrites=true&w=majority&appName=ticket-cluster"
DATABASE_NAME = "sample_mflix"
COLLECTION_NAME = "showrooms"

def create_showrooms():
    """Create sample showrooms in MongoDB"""
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        collection = db[COLLECTION_NAME]
        
        # Sample showrooms
        showrooms = [
            {
                "_id": "showroom_1",
                "showtimes": []
            },
            {
                "_id": "showroom_2",
                "showtimes": []
            },
            {
                "_id": "showroom_3",
                "showtimes": []
            }
        ]
        
        # Insert showrooms
        result = collection.insert_many(showrooms, ordered=False)
        print(f"✓ Successfully created {len(result.inserted_ids)} showrooms:")
        for showroom_id in result.inserted_ids:
            print(f"  - {showroom_id}")
            
    except ConnectionFailure:
        print("✗ Error: Could not connect to MongoDB. Make sure MongoDB is running on localhost:27017")
    except DuplicateKeyError:
        print("✗ Error: Some showrooms already exist. Check your database.")
    except Exception as e:
        print(f"✗ Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    create_showrooms()
