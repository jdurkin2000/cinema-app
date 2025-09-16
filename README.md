Movie API endpoints:

NOTE - If any call results with no objects found, api will return
a 404 not found response to indicate the query did not find any objects

/api/movies
Fetch all movies available in database

/api/movies/{id}
Fetch movie with unique id

/api/movies?title={title}
Fetch all movies matching {title}

/api/movies?genre={genre}
Fetch all movies with genre {genre}

/api/movies?showtime={showtime}
Fetch all movies with showtime {showtime}.
The backend internally uses a Java LocalDateTime object to
parse the string into the same object, but further tweaks
might need to be made to make searching more flexible. 