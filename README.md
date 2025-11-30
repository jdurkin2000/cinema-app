Movie API endpoints:

NOTE - If any call results with no objects found, api will return
a 404 not found response to indicate the query did not find any objects

/api/movies
Fetch all movies available in database

/api/movies/{id}
Fetch movie with unique mongodb id
always returns a list with one movie

/api/movies?title={title}
Fetch all movies matching {title}
always returns a list

/api/movies?genre={genre}
Fetch all movies with genre {genre}
always returns a list

title and genres can be combined in the same url
also multiple genres can be queried by comma separating them
within the endpoint

Movie JSON structure:

Movie: {
"id": string,
"title": string,
"genres": [strings],
"cast": [strings],
"director": string,
"producer": string,
"synopsis": string,
"reviews": [strings],
"poster": string,
"trailer": string,
"rating": string,
"showtimes": [string],
"released": string,
"upcoming": boolean
}

Booking Confirmation Email:

- When a booking is confirmed via POST /api/bookings, the backend will attempt to send a confirmation email to the authenticated user's email address.
- The email includes: movie title, showtime, seats, ticket breakdown, subtotal, and booking ID.
- SMTP configuration for the backend is in `backend/src/main/resources/application.properties`.
