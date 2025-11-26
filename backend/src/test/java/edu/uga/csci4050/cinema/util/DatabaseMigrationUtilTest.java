package edu.uga.csci4050.cinema.util;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.annotation.DirtiesContext;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class DatabaseMigrationUtilTest {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private DatabaseMigrationUtil migrationUtil;

    @AfterEach
    void cleanup() {
        MongoDatabase db = mongoTemplate.getDb();
        db.getCollection("promotions").deleteMany(new Document());
        db.getCollection("movies").deleteMany(new Document());
        db.getCollection("showrooms").deleteMany(new Document());
    }

    @Test
    void migratePromotions_convertsLocalDateDocsToInstant() {
        MongoDatabase db = mongoTemplate.getDb();
        MongoCollection<Document> promotions = db.getCollection("promotions");

        Document startDoc = new Document(Map.of(
                "year", 2025,
                "month", 11,
                "day", 26));
        Document endDoc = new Document(Map.of(
                "year", 2025,
                "month", 12,
                "day", 5));

        Document promo = new Document("name", "Holiday Deal")
                .append("startDate", startDoc)
                .append("endDate", endDoc);

        promotions.insertOne(promo);

        migrationUtil.migratePromotions();

        Document out = promotions.find(new Document("_id", promo.get("_id"))).first();
        assertThat(out).isNotNull();
        Object startOut = out.get("startDate");
        Object endOut = out.get("endDate");

        // After migration, should no longer be nested Document or String
        assertThat(startOut).isNotInstanceOf(Document.class);
        assertThat(endOut).isNotInstanceOf(Document.class);

        // Expect Instant (driver 4.x) or Date depending on codec; accept either
        assertThat(startOut).isInstanceOfAny(Instant.class, java.util.Date.class);
        assertThat(endOut).isInstanceOfAny(Instant.class, java.util.Date.class);
    }

    @Test
    void cleanupMovies_unsetsObsoleteFields() {
        MongoDatabase db = mongoTemplate.getDb();
        MongoCollection<Document> movies = db.getCollection("movies");

        Document movie = new Document("title", "Test Movie")
                .append("showtimes", List.of("legacy"))
                .append("released", true)
                .append("isUpcoming", false)
                .append("keepMe", 123);
        movies.insertOne(movie);

        migrationUtil.cleanupMovies();

        Document out = movies.find(new Document("_id", movie.get("_id"))).first();
        assertThat(out).isNotNull();
        assertThat(out.containsKey("showtimes")).isFalse();
        assertThat(out.containsKey("released")).isFalse();
        assertThat(out.containsKey("isUpcoming")).isFalse();
        assertThat(out.get("keepMe")).isEqualTo(123);
    }

    @Test
    void migrateShowrooms_convertsLocalDateTimeDocsToInstant() {
        MongoDatabase db = mongoTemplate.getDb();
        MongoCollection<Document> showrooms = db.getCollection("showrooms");

        List<Document> showtimes = new ArrayList<>();
        Document start = new Document(new HashMap<>() {
            {
                put("year", 2025);
                put("month", 11);
                put("day", 26);
                put("hour", 19);
                put("minute", 30);
                put("second", 0);
            }
        });
        showtimes.add(new Document("movieId", "m1").append("start", start));

        Document room = new Document("name", "Room 1").append("showtimes", showtimes);
        showrooms.insertOne(room);

        migrationUtil.migrateShowrooms();

        Document out = showrooms.find(new Document("_id", room.get("_id"))).first();
        assertThat(out).isNotNull();
        @SuppressWarnings("unchecked")
        List<Document> outShowtimes = (List<Document>) out.get("showtimes");
        assertThat(outShowtimes).isNotNull();
        Object startOut = outShowtimes.get(0).get("start");
        assertThat(startOut).isNotInstanceOf(Document.class);
        assertThat(startOut).isInstanceOfAny(Instant.class, java.util.Date.class);
    }
}
