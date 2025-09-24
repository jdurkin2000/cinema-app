package edu.uga.csci4050.cinema.repository.custom;

import edu.uga.csci4050.cinema.model.MovieItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;
import java.util.regex.Pattern;

public class CustomMovieRepositoryImpl implements CustomMovieRepository {
    @Autowired
    private MongoTemplate mongoTemplate;



    @Override
    public List<MovieItem> searchMovies(String title, List<String> genres) {
        Query query = new Query();

        if (title != null && !title.isBlank()) {
            String regex = ".*" + Pattern.quote(title) + ".*";
            Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
            Criteria compareTitleInsensitive = Criteria.where("title").regex(pattern);
            query.addCriteria(compareTitleInsensitive);
        }

        if (genres != null && !genres.isEmpty()) {
            Criteria containsGenres = Criteria.where("genres").in(genres);
            query.addCriteria(containsGenres);
        }

        return mongoTemplate.find(query, MovieItem.class);
    }
}
