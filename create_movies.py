#!/usr/bin/env python3
"""
Seed script to insert sample movies into the MongoDB used by the Cinema App.

Usage:
  python create_movies.py

The script will upsert (insert if missing) a small set of sample movies
into the `movies` collection of the `sample_mflix` database using the same
Mongo URI used by the other helper scripts in this repo.

It will NOT overwrite existing movies with the same title.
"""
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import sys

# Use same URI as other scripts in this repo
MONGO_URI = "mongodb+srv://durkinjfd_db_user:gwk4wmbkZlBFHguU@ticket-cluster.fafzycr.mongodb.net/?retryWrites=true&w=majority&appName=ticket-cluster"
DATABASE_NAME = "sample_mflix"
COLLECTION_NAME = "movies"


SAMPLE_MOVIES = [
    {
        "title": "Mission Impossible 7",
        "genres": ["Action", "Adventure", "Sci-Fi"],
        "cast": ["Tom Cruise", "Rebecca Ferguson", "Simon Pegg"],
        "director": "Christopher McQuarrie",
        "producer": "Tom Cruise",
        "synopsis": "Ethan Hunt and his IMF team must track down a terrifying new weapon that threatens all of humanity.",
        "reviews": ["Amazing action sequences!", "Great plot twists"],
        "poster": "https://upload.wikimedia.org/wikipedia/en/e/ed/Mission-_Impossible_%E2%80%93_Dead_Reckoning_Part_One_poster.jpg",
        "trailer": "https://www.youtube.com/embed/avz06PDqDbM",
        "rating": "PG13",
    },
    {
        "title": "La La Land",
        "genres": ["Drama", "Romance"],
        "cast": ["Ryan Gosling", "Emma Stone", "John Legend"],
        "director": "Damien Chazelle",
        "producer": "Fred Berger",
        "synopsis": "A jazz pianist and an aspiring actress fall in love while pursuing their dreams in Los Angeles.",
        "reviews": ["Beautiful cinematography", "Amazing musical numbers"],
        "poster": "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
        "trailer": "https://www.youtube.com/embed/0pdqf4P9MB8",
        "rating": "PG13",
    },
    {
        "title": "John Wick 4",
        "genres": ["Action", "Thriller"],
        "cast": ["Keanu Reeves", "Halle Berry", "Ian McShane"],
        "director": "Chad Stahelski",
        "producer": "Basil Iwanyk",
        "synopsis": "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.",
        "reviews": ["Highly anticipated sequel", "John Wick returns!"],
        "poster": "https://upload.wikimedia.org/wikipedia/en/d/d0/John_Wick_-_Chapter_4_promotional_poster.jpg",
        "trailer": "https://www.youtube.com/embed/qEVUtrk8_B4",
        "rating": "R",
    },
    {
        "title": "Super Mario Bros Movie",
        "genres": ["Comedy", "Family"],
        "cast": ["Chris Pratt", "Anya Taylor-Joy", "Charlie Day"],
        "director": "Aaron Horvath",
        "producer": "Chris Meledandri",
        "synopsis": "A Brooklyn plumber named Mario travels through the Mushroom Kingdom with a princess named Peach and an anthropomorphic mushroom named Toad to find Mario's brother, Luigi, and to save the world from a ruthless fire-breathing Koopa named Bowser.",
        "reviews": ["Fun for the whole family", "Great animation"],
        "poster": "https://upload.wikimedia.org/wikipedia/en/4/44/The_Super_Mario_Bros._Movie_poster.jpg",
        "trailer": "https://www.youtube.com/embed/TnGl01FkMMo",
        "rating": "PG",
    },
    {
        "title": "The Grand Budapest Hotel",
        "genres": ["Comedy", "Drama"],
        "cast": ["Ralph Fiennes", "Tony Revolori", "Saoirse Ronan"],
        "director": "Wes Anderson",
        "producer": "Wes Anderson",
        "synopsis": "A whimsical tale about the adventures of Gustave H, a legendary concierge at a famous European hotel between the wars.",
        "reviews": ["Quirky and delightful", "Stunning production design"],
        "poster": "https://upload.wikimedia.org/wikipedia/en/1/1c/The_Grand_Budapest_Hotel.png",
        "trailer": "https://www.youtube.com/embed/1Fg5iWmQjwk",
        "rating": "R",
    },
]


def upsert_movies():
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        coll = db[COLLECTION_NAME]

        inserted = 0
        replaced = 0

        for m in SAMPLE_MOVIES:
            title = m.get("title")
            if not title:
                continue

            # Replace the existing document with the same title or insert if missing
            result = coll.replace_one({"title": title}, m, upsert=True)
            if result.matched_count > 0:
                print(f"~ Replaced movie: {title}")
                replaced += 1
            else:
                print(f"+ Inserted movie: {title}")
                inserted += 1

        print(f"\nDone. Inserted: {inserted}. Replaced: {replaced}.")

    except ConnectionFailure:
        print("✗ Error: Could not connect to MongoDB. Check your network/URI.")
        sys.exit(1)
    except Exception as e:
        print("✗ Error while seeding movies:", e)
        sys.exit(1)
    finally:
        try:
            client.close()
        except Exception:
            pass


if __name__ == "__main__":
    upsert_movies()
