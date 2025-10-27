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

SECURITY STUFF:

to add encrypted values to application.properties:

1) add the sensitive info as a property in .properties file wrapped in DEC(...)

Example: secret.property=DEC(rawsensitiveinfo)

2) run the command: mvn jasypt:encrypt

The values will now be encoded properly in the file and is now safe to upload to github

========================================================================================

YOU MUST SET THE ENVIRONMENT VARIABLE {JASYPT_ENCRYPTOR_PASSWORD} BEFORE RUNNING SPRING-BOOT

Before you run spring, in the same terminal you must:

Linux/Mac: export JASYPT_ENCRYPTOR_PASSWORD masterPassword

Windows: setx JASYPT_ENCRYPTOR_PASSWORD masterPassword