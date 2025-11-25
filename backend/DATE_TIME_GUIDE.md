# Date/Time Handling Quick Reference

## Overview

All date/time operations in the cinema app now use `DateTimeUtil` for consistency and proper timezone handling.

## Core Principles

1. **Storage**: Always store dates/times as `Instant` (UTC) in the database
2. **Display**: Convert to user's timezone when displaying
3. **Input**: Parse user input through `DateTimeUtil` methods
4. **Comparison**: Use `DateTimeUtil` comparison methods

## Common Operations

### Getting Current Date/Time

```java
import edu.uga.csci4050.cinema.util.DateTimeUtil;

// Current instant (UTC)
Instant now = DateTimeUtil.now();

// Today's date (in default timezone)
LocalDate today = DateTimeUtil.today();
```

### Converting Between Types

```java
// Instant to LocalDate/LocalDateTime
Instant instant = DateTimeUtil.now();
LocalDate date = DateTimeUtil.toLocalDate(instant);
LocalDateTime dateTime = DateTimeUtil.toLocalDateTime(instant);

// LocalDate/LocalDateTime to Instant
LocalDate date = LocalDate.of(2024, 1, 15);
Instant instant = DateTimeUtil.fromLocalDate(date);

LocalDateTime dateTime = LocalDateTime.of(2024, 1, 15, 14, 30);
Instant instant2 = DateTimeUtil.fromLocalDateTime(dateTime);
```

### Formatting for Display

```java
Instant instant = DateTimeUtil.now();

// Format as date: "2024-01-15"
String dateStr = DateTimeUtil.formatDate(instant);

// Format as datetime: "2024-01-15 14:30"
String dateTimeStr = DateTimeUtil.formatDateTime(instant);
```

### Parsing User Input

```java
// Parse date string
try {
    Instant instant = DateTimeUtil.parseDate("2024-01-15");
} catch (IllegalArgumentException e) {
    // Invalid format
}

// Parse datetime string
try {
    Instant instant = DateTimeUtil.parseDateTime("2024-01-15 14:30");
} catch (IllegalArgumentException e) {
    // Invalid format
}
```

### Date Arithmetic

```java
Instant instant = DateTimeUtil.now();

// Add days
Instant tomorrow = DateTimeUtil.plusDays(instant, 1);
Instant nextWeek = DateTimeUtil.plusDays(instant, 7);

// Add hours
Instant inOneHour = DateTimeUtil.plusHours(instant, 1);
```

### Date Comparisons

```java
Instant instant = DateTimeUtil.now();

// Check if in past/future
boolean isPast = DateTimeUtil.isInPast(instant);
boolean isFuture = DateTimeUtil.isInFuture(instant);

// Check date (ignoring time)
boolean beforeToday = DateTimeUtil.isDateBeforeToday(instant);
boolean afterToday = DateTimeUtil.isDateAfterToday(instant);
boolean isToday = DateTimeUtil.isToday(instant);
```

### Creating Specific Dates

```java
// Create instant for specific date at start of day
Instant jan15 = DateTimeUtil.ofDate(2024, 1, 15);

// Create instant for specific date and time
Instant jan15at2pm = DateTimeUtil.of(2024, 1, 15, 14, 0);
```

## Controller Examples

### Accepting Date Input from API

```java
// DTO
public static class CreateRequest {
    public String startDate;  // Format: "yyyy-MM-dd"
    public String endDate;
}

// Controller
@PostMapping
public ResponseEntity<?> create(@RequestBody CreateRequest req) {
    Instant start;
    Instant end;

    try {
        start = DateTimeUtil.parseDate(req.startDate);
        end = DateTimeUtil.parseDate(req.endDate);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest()
            .body(Map.of("message", "Invalid date format. Expected: yyyy-MM-dd"));
    }

    // Validate
    if (end.isBefore(start)) {
        return ResponseEntity.badRequest()
            .body(Map.of("message", "End date must be after start date"));
    }

    // Use the Instants...
    entity.setStartDate(start);
    entity.setEndDate(end);
}
```

### Returning Dates in API Response

```java
// Model with Instant
@Document(collection = "promotions")
public class Promotion {
    private Instant startDate;
    private Instant endDate;
    // ... getters/setters
}

// When serialized to JSON, Spring will automatically format as ISO-8601:
// {
//   "startDate": "2024-01-15T05:00:00Z",
//   "endDate": "2024-01-31T05:00:00Z"
// }

// If you need custom format, use DateTimeUtil in a response DTO:
public class PromotionResponse {
    public String id;
    public String code;
    public String startDate;  // Formatted string
    public String endDate;

    public static PromotionResponse from(Promotion p) {
        PromotionResponse r = new PromotionResponse();
        r.id = p.getId();
        r.code = p.getCode();
        r.startDate = DateTimeUtil.formatDate(p.getStartDate());
        r.endDate = DateTimeUtil.formatDate(p.getEndDate());
        return r;
    }
}
```

### Validating Date Ranges

```java
@PostMapping
public ResponseEntity<?> createPromotion(@RequestBody CreateRequest req) {
    Instant start = DateTimeUtil.parseDate(req.startDate);
    Instant end = DateTimeUtil.parseDate(req.endDate);

    // Validate end date not before start
    if (end.isBefore(start)) {
        return ResponseEntity.badRequest()
            .body(Map.of("message", "End date must be on or after start date"));
    }

    // Validate not in the past
    if (DateTimeUtil.isDateBeforeToday(end)) {
        return ResponseEntity.badRequest()
            .body(Map.of("message", "End date cannot be in the past"));
    }

    // Valid!
    Promotion p = new Promotion();
    p.setStartDate(start);
    p.setEndDate(end);
    promotionRepo.save(p);

    return ResponseEntity.ok(p);
}
```

### Checking if Promotion is Active

```java
@GetMapping("/validate")
public ResponseEntity<?> validatePromotion(@RequestParam String code) {
    Promotion p = promotionRepo.findByCode(code);
    if (p == null) {
        return ResponseEntity.notFound().build();
    }

    Instant now = DateTimeUtil.now();

    // Check if current time is within promotion period
    if (now.isBefore(p.getStartDate()) || now.isAfter(p.getEndDate())) {
        return ResponseEntity.badRequest()
            .body(Map.of("message", "Promotion is not currently valid"));
    }

    return ResponseEntity.ok(p);
}
```

## Service Examples

### Filtering Showtimes

```java
@Service
public class ShowtimeService {

    public List<Showtime> getUpcomingShowtimes(String movieId) {
        List<Showtime> all = showtimeRepo.findByMovieId(movieId);
        Instant now = DateTimeUtil.now();

        // Filter to only future showtimes
        return all.stream()
            .filter(st -> st.start().isAfter(now))
            .collect(Collectors.toList());
    }

    public List<Showtime> getShowtimesForDate(String movieId, String dateStr) {
        Instant targetDate = DateTimeUtil.parseDate(dateStr);
        List<Showtime> all = showtimeRepo.findByMovieId(movieId);

        // Filter to showtimes on the target date
        return all.stream()
            .filter(st -> DateTimeUtil.toLocalDate(st.start())
                .equals(DateTimeUtil.toLocalDate(targetDate)))
            .collect(Collectors.toList());
    }
}
```

## Model Examples

### Using Instant in Models

```java
import java.time.Instant;

@Document(collection = "events")
public class Event {
    @Id
    private String id;

    private String name;
    private Instant startTime;
    private Instant endTime;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructor
    public Event() {
        this.createdAt = DateTimeUtil.now();
        this.updatedAt = DateTimeUtil.now();
    }

    // Getters/setters
    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    // ... other getters/setters

    // Helper method for display
    public String getStartTimeFormatted() {
        return DateTimeUtil.formatDateTime(startTime);
    }
}
```

## Testing Examples

### Testing Date Logic

```java
import static org.junit.jupiter.api.Assertions.*;

@Test
public void testPromotionValidation() {
    // Create promotion for next week
    Instant start = DateTimeUtil.plusDays(DateTimeUtil.now(), 7);
    Instant end = DateTimeUtil.plusDays(start, 7);

    Promotion p = new Promotion();
    p.setStartDate(start);
    p.setEndDate(end);

    // Should not be active yet
    assertFalse(DateTimeUtil.now().isAfter(p.getStartDate()));
}

@Test
public void testDateParsing() {
    // Valid format
    Instant instant = DateTimeUtil.parseDate("2024-01-15");
    assertNotNull(instant);
    assertEquals(2024, DateTimeUtil.toLocalDate(instant).getYear());

    // Invalid format
    assertThrows(IllegalArgumentException.class, () -> {
        DateTimeUtil.parseDate("15/01/2024");
    });
}
```

## Best Practices

1. **Always use DateTimeUtil**: Don't create date/time objects directly
2. **Store as Instant**: All database fields should be `Instant`
3. **Parse early**: Convert string inputs to `Instant` as soon as possible
4. **Format late**: Only format to strings when displaying or sending to client
5. **UTC in storage**: Database always stores UTC, timezone conversion happens at display time
6. **Validate dates**: Always check date ranges and validity before saving
7. **Use comparison methods**: Use `DateTimeUtil` methods instead of direct `Instant` comparisons for clarity

## Timezone Configuration

The default timezone is configured in `DateTimeUtil`:

```java
private static final ZoneId DEFAULT_ZONE = ZoneId.of("America/New_York");
```

To support multiple timezones in the future:

1. Add timezone to User model
2. Pass timezone to DateTimeUtil methods
3. Update methods to accept optional `ZoneId` parameter

## Common Mistakes to Avoid

❌ **Don't do this:**

```java
// Creating dates directly
LocalDate date = LocalDate.now();
promotion.setStartDate(date);  // Type error!

// Formatting in the model
public String startDate;  // Should be Instant!

// Parsing without error handling
Instant instant = Instant.parse(userInput);  // Can throw exception!
```

✅ **Do this instead:**

```java
// Use DateTimeUtil
Instant instant = DateTimeUtil.now();
promotion.setStartDate(instant);

// Keep Instant in model
private Instant startDate;

// Parse with error handling
try {
    Instant instant = DateTimeUtil.parseDate(userInput);
} catch (IllegalArgumentException e) {
    // Handle invalid input
}
```

## Summary

- Use `Instant` everywhere in models
- Use `DateTimeUtil` for all operations
- Parse user input early, format for display late
- Store in UTC, display in user's timezone
- Validate all date inputs and ranges
