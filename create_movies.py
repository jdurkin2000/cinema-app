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
    # --- Additional movies added ---
    {
        "title": "Inception",
        "genres": ["Action", "Sci-Fi", "Thriller"],
        "cast": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
        "director": "Christopher Nolan",
        "producer": "Emma Thomas",
        "synopsis": "A skilled thief enters people's dreams to steal secrets but is offered a chance to erase his criminal history by planting an idea instead.",
        "reviews": ["Mind-bending visuals", "Intricate plot"],
        # Alternate poster (previous link reported broken). Using common TMDB asset.
        "poster": "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
        "trailer": "https://www.youtube.com/embed/YoHD9XEInc0",
        "rating": "PG13",
    },
    {
        "title": "The Dark Knight",
        "genres": ["Action", "Crime", "Drama"],
        "cast": ["Christian Bale", "Heath Ledger", "Gary Oldman"],
        "director": "Christopher Nolan",
        "producer": "Charles Roven",
        "synopsis": "Batman faces the Joker, a criminal mastermind who plunges Gotham City into chaos.",
        "reviews": ["Ledger's Joker is iconic", "Best superhero crime drama"],
        "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "trailer": "https://www.youtube.com/embed/EXeTwQWrcwY",
        "rating": "PG13",
    },
    {
        "title": "Interstellar",
        "genres": ["Adventure", "Drama", "Sci-Fi"],
        "cast": ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
        "director": "Christopher Nolan",
        "producer": "Emma Thomas",
        "synopsis": "A team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival.",
        "reviews": ["Emotionally powerful", "Epic space odyssey"],
        "poster": "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
        "trailer": "https://www.youtube.com/embed/zSWdZVtXT7E",
        "rating": "PG13",
    },
    {
        "title": "Spider-Man: Across the Spider-Verse",
        "genres": ["Animation", "Action", "Adventure"],
        "cast": ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
        "director": "Joaquim Dos Santos",
        "producer": "Avi Arad",
        "synopsis": "Miles Morales catapults across the Multiverse and encounters a team of Spider-People charged with protecting its existence.",
        "reviews": ["A visual masterpiece", "Bold storytelling"],
        "poster": "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        "trailer": "https://www.youtube.com/embed/cqGjhVJWtEg",
        "rating": "PG",
    },
    {
        "title": "Inside Out",
        "genres": ["Animation", "Comedy", "Family"],
        "cast": ["Amy Poehler", "Phyllis Smith", "Bill Hader"],
        "director": "Pete Docter",
        "producer": "Jonas Rivera",
        "synopsis": "Young Riley's emotions—Joy, Sadness, Anger, Fear, and Disgust—struggle to guide her through a difficult move to a new city.",
        "reviews": ["Heartfelt and clever", "Great for all ages"],
        "poster": "https://upload.wikimedia.org/wikipedia/en/0/0a/Inside_Out_%282015_film%29_poster.jpg",
        "trailer": "https://www.youtube.com/embed/seMwpP0yeu4",
        "rating": "PG",
    },
    {
        "title": "Toy Story",
        "genres": ["Animation", "Adventure", "Comedy"],
        "cast": ["Tom Hanks", "Tim Allen", "Don Rickles"],
        "director": "John Lasseter",
        "producer": "Bonnie Arnold",
        "synopsis": "A cowboy doll is profoundly threatened and jealous when a new spaceman action figure supplants him as top toy.",
        "reviews": ["Historic CG animation", "Warm and witty"],
        "poster": "https://upload.wikimedia.org/wikipedia/en/1/13/Toy_Story.jpg",
        "trailer": "https://www.youtube.com/embed/NTdKQzVnsmY",
        "rating": "G",
    },
    {
        "title": "The Matrix",
        "genres": ["Action", "Sci-Fi"],
        "cast": ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
        "director": "Lana Wachowski",
        "producer": "Joel Silver",
        "synopsis": "A hacker discovers the reality he lives in is a simulation and joins a rebellion against its controllers.",
        "reviews": ["Genre-defining action", "Philosophical depth"],
        "poster": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        "trailer": "https://www.youtube.com/embed/vKQi3bBA1y8",
        "rating": "R",
    },
    {
        "title": "Guardians of the Galaxy Vol. 3",
        "genres": ["Action", "Adventure", "Sci-Fi"],
        "cast": ["Chris Pratt", "Zoe Saldaña", "Dave Bautista"],
        "director": "James Gunn",
        "producer": "Kevin Feige",
        "synopsis": "The Guardians rally to defend the universe while protecting one of their own from a mysterious past.",
        "reviews": ["Emotional conclusion", "Fun space adventure"],
        # Alternate poster (previous link reported broken)
        "poster": "https://image.tmdb.org/t/p/w500/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",
        "trailer": "https://www.youtube.com/embed/u3V5KDHRQvk",
        "rating": "PG13",
    },
    {
        "title": "Barbie",
        "genres": ["Comedy", "Fantasy"],
        "cast": ["Margot Robbie", "Ryan Gosling", "America Ferrera"],
        "director": "Greta Gerwig",
        "producer": "David Heyman",
        "synopsis": "Barbie and Ken leave Barbie Land and discover the joys and perils of living among humans.",
        "reviews": ["Surprisingly clever", "Stylish and funny"],
        "poster": "https://upload.wikimedia.org/wikipedia/en/0/0b/Barbie_2023_poster.jpg",
        "trailer": "https://www.youtube.com/embed/pBk4NYhWNMM",
        "rating": "PG13",
    },
    {
        "title": "Oppenheimer",
        "genres": ["Biography", "Drama", "History"],
        "cast": ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."],
        "director": "Christopher Nolan",
        "producer": "Emma Thomas",
        "synopsis": "The story of J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        "reviews": ["Intense and profound", "Masterful filmmaking"],
        # Updated poster (previous links reported broken). Alternate TMDB asset.
        "poster": "https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg",
        "trailer": "https://www.youtube.com/embed/uYPbbksJxIg",
        "rating": "R",
    },
]


def upsert_movies():
    client = None
    try:
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        coll = db[COLLECTION_NAME]

        inserted = 0
        updated = 0
        skipped = 0

        for m in SAMPLE_MOVIES:
            title = m.get("title")
            if not title:
                continue

            existing = coll.find_one({"title": title})
            if existing:
                # Determine if any key (especially poster/trailer) differs
                diff_keys = [k for k, v in m.items() if existing.get(k) != v]
                if diff_keys:
                    # Only set differing fields to avoid overwriting reviews that may have grown
                    to_set = {k: m[k] for k in diff_keys}
                    coll.update_one({"_id": existing["_id"]}, {"$set": to_set})
                    print(f"* Updated movie: {title} (fields: {', '.join(diff_keys)})")
                    updated += 1
                else:
                    print(f"= Skipped (unchanged): {title}")
                    skipped += 1
                continue

            coll.insert_one(m)
            print(f"+ Inserted movie: {title}")
            inserted += 1

        print(f"\nDone. Inserted: {inserted}. Updated: {updated}. Skipped unchanged: {skipped}.")

    except ConnectionFailure:
        print("✗ Error: Could not connect to MongoDB. Check your network/URI.")
        sys.exit(1)
    except Exception as e:
        print("✗ Error while seeding movies:", e)
        sys.exit(1)
    finally:
        if client is not None:
            try:
                client.close()
            except Exception:
                pass


if __name__ == "__main__":
    upsert_movies()
