package edu.uga.csci4050.cinema.util;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Database migration utility for converting old date/time formats to Instant.
 * 
 * This class provides methods to migrate existing data from
 * LocalDate/LocalDateTime
 * to Instant format. Run these migrations once after deploying the refactored
 * code.
 * 
 * Usage:
 * - Inject this bean into a CommandLineRunner or create an admin endpoint
 * - Call the appropriate migration methods
 * - These are idempotent - safe to run multiple times
 */
@Component
public class DatabaseMigrationUtil {

    @Autowired
    private MongoTemplate mongoTemplate;

    private static final ZoneId DEFAULT_ZONE = ZoneId.of("America/New_York");

    /**
     * Migrate promotions collection from LocalDate to Instant.
     * Converts startDate and endDate fields.
     */
    public void migratePromotions() {
        MongoDatabase db = mongoTemplate.getDb();
        MongoCollection<Document> promotions = db.getCollection("promotions");

        for (Document doc : promotions.find()) {
            boolean updated = false;

            // Migrate startDate
            if (doc.containsKey("startDate") && !(doc.get("startDate") instanceof String)) {
                Object startDate = doc.get("startDate");
                Instant instant = convertToInstant(startDate);
                if (instant != null) {
                    doc.put("startDate", instant);
                    updated = true;
                }
            }

            // Migrate endDate
            if (doc.containsKey("endDate") && !(doc.get("endDate") instanceof String)) {
                Object endDate = doc.get("endDate");
                Instant instant = convertToInstant(endDate);
                if (instant != null) {
                    doc.put("endDate", instant);
                    updated = true;
                }
            }

            if (updated) {
                promotions.replaceOne(
                        new Document("_id", doc.get("_id")),
                        doc);
            }
        }
    }

    /**
     * Clean up obsolete fields from movies collection.
     * Removes: showtimes, released, isUpcoming
     */
    public void cleanupMovies() {
        MongoDatabase db = mongoTemplate.getDb();
        MongoCollection<Document> movies = db.getCollection("movies");

        Document unset = new Document();
        unset.put("showtimes", "");
        unset.put("released", "");
        unset.put("isUpcoming", "");

        movies.updateMany(
                new Document(), // all documents
                new Document("$unset", unset));
    }

    /**
     * Migrate showrooms collection showtimes from LocalDateTime to Instant.
     */
    public void migrateShowrooms() {
        MongoDatabase db = mongoTemplate.getDb();
        MongoCollection<Document> showrooms = db.getCollection("showrooms");

        for (Document doc : showrooms.find()) {
            if (doc.containsKey("showtimes")) {
                Object showtimesObj = doc.get("showtimes");
                if (showtimesObj instanceof java.util.List) {
                    @SuppressWarnings("unchecked")
                    java.util.List<Document> showtimes = (java.util.List<Document>) showtimesObj;

                    boolean updated = false;
                    for (Document showtime : showtimes) {
                        if (showtime.containsKey("start")) {
                            Object start = showtime.get("start");
                            Instant instant = convertToInstant(start);
                            if (instant != null) {
                                showtime.put("start", instant);
                                updated = true;
                            }
                        }
                    }

                    if (updated) {
                        showrooms.replaceOne(
                                new Document("_id", doc.get("_id")),
                                doc);
                    }
                }
            }
        }
    }

    /**
     * Convert various date/time types to Instant.
     */
    private Instant convertToInstant(Object value) {
        if (value == null) {
            return null;
        }

        try {
            // Already an Instant (stored as Date in MongoDB)
            if (value instanceof java.util.Date) {
                return ((java.util.Date) value).toInstant();
            }

            // LocalDate (stored as Document in MongoDB)
            if (value instanceof Document) {
                Document doc = (Document) value;
                if (doc.containsKey("year") && doc.containsKey("month") && doc.containsKey("day")) {
                    int year = doc.getInteger("year");
                    int month = doc.getInteger("month");
                    int day = doc.getInteger("day");
                    LocalDate date = LocalDate.of(year, month, day);
                    return date.atStartOfDay(DEFAULT_ZONE).toInstant();
                }

                // LocalDateTime
                if (doc.containsKey("hour") && doc.containsKey("minute")) {
                    int year = doc.getInteger("year");
                    int month = doc.getInteger("month");
                    int day = doc.getInteger("day");
                    int hour = doc.getInteger("hour");
                    int minute = doc.getInteger("minute");
                    int second = doc.getInteger("second", 0);
                    LocalDateTime dateTime = LocalDateTime.of(year, month, day, hour, minute, second);
                    return dateTime.atZone(DEFAULT_ZONE).toInstant();
                }
            }

            // String ISO format
            if (value instanceof String) {
                return Instant.parse((String) value);
            }

            // Numeric timestamp (millis)
            if (value instanceof Long) {
                return Instant.ofEpochMilli((Long) value);
            }

        } catch (Exception e) {
            System.err.println("Failed to convert date/time value: " + value + " - " + e.getMessage());
        }

        return null;
    }

    /**
     * Run all migrations in the correct order.
     * Safe to run multiple times (idempotent).
     */
    public void runAllMigrations() {
        System.out.println("Starting database migrations...");

        System.out.println("1. Migrating promotions...");
        migratePromotions();

        System.out.println("2. Cleaning up movies...");
        cleanupMovies();

        System.out.println("3. Migrating showrooms...");
        migrateShowrooms();

        System.out.println("All migrations completed!");
    }
}
