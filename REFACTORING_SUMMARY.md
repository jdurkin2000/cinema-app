# Cinema App Refactoring Summary

## Overview

This document summarizes the major refactoring changes made to improve code quality, consistency, and maintainability.

## 1. Date/Time Handling Improvements

### Problem

- Mixed usage of `LocalDateTime`, `LocalDate`, and `Instant` causing timezone inconsistencies
- Error-prone date string parsing scattered throughout the codebase
- No centralized date/time handling logic

### Solution

Created `DateTimeUtil` class (`backend/src/main/java/edu/uga/csci4050/cinema/util/DateTimeUtil.java`) that:

- Uses `Instant` (UTC) for all database storage
- Provides centralized conversion methods between `Instant` and user-friendly formats
- Handles timezone conversions consistently (default: America/New_York)
- Offers utility methods for date arithmetic and comparisons
- Provides standard formatters for date and datetime strings

### Changes Made

- **Models updated to use `Instant`:**

  - `User` (already using Instant - no changes needed)
  - `Promotion`: `startDate` and `endDate` now `Instant` instead of `LocalDate`
  - `Showtime`: `start` now `Instant` instead of `LocalDateTime`

- **Controllers updated:**

  - `PromotionController`: Uses `DateTimeUtil.parseDate()` and `DateTimeUtil.formatDate()`
  - Date validation uses `DateTimeUtil` methods like `isDateBeforeToday()`

- **DTOs updated:**
  - `PromotionDtos.CreatePromotionRequest`: Dates are now strings (format: "yyyy-MM-dd")
  - Controllers handle parsing using `DateTimeUtil`

### Benefits

- Consistent UTC storage in database (no more timezone confusion)
- Easy conversion to user's local timezone
- Centralized date parsing reduces errors
- Single source of truth for date/time operations
- Future-proof for multi-timezone support

---

## 2. MovieItem Model Cleanup

### Problem

- `MovieItem` had obsolete fields that were no longer used:
  - `showtimes` (List<LocalDateTime>)
  - `released` (LocalDate)
  - `isUpcoming` (boolean)
- These fields were moved to the Showtime/Showroom subsystem but not removed
- Caused confusion and potential data inconsistency

### Solution

Removed obsolete fields from `MovieItem` model:

- Deleted `showtimes`, `released`, and `isUpcoming` fields
- Removed associated getters/setters
- Updated constructor to remove these parameters
- Simplified `toString()` method

### Changes Made

- **Model:** `MovieItem.java` - Removed 3 fields and their accessors
- **Repository:** `MovieRepository.java` - Removed `findByIsUpcoming()` method
- **Controller:** `MovieController.java` - Removed endpoints:
  - `GET /api/movies/currently-running`
  - `GET /api/movies/upcoming`
- **DTOs:** `MovieDtos.java` - Removed obsolete fields from all DTOs
- **Service:** `DataInitializationService.java` - Updated sample data creation

### Migration Notes

- **Database:** Existing documents in MongoDB will retain the old fields, but they won't be read or written
- **Frontend:** Update to query showtimes via `/api/showrooms/**` endpoints instead of movie fields
- **To determine if movie is "currently running" or "upcoming":**
  1. Query `/api/showrooms/**` for showtimes
  2. Filter by movieId
  3. Check if any showtimes exist in the desired date range

### Benefits

- Cleaner separation of concerns
- Single source of truth for showtimes (Showroom/Showtime subsystem)
- Reduced data duplication
- Eliminates sync issues between movie data and showtime data

---

## 3. Security Configuration Improvements

### Problem

- CSRF disabled without clear justification
- All endpoints permitted (security effectively disabled)
- No clear separation between public and protected endpoints
- CORS configuration was minimal
- No session management strategy defined

### Solution

Completely refactored `SecurityConfig.java` with:

- Clear authorization rules for each endpoint
- Stateless session management (JWT-based)
- Improved CORS configuration with configurable origins
- Method-level security enabled (`@PreAuthorize`)
- Better documentation and comments

### Changes Made

#### Authorization Rules

**Public Endpoints (no authentication required):**

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot`
- `POST /api/auth/reset`
- `GET /api/auth/verify`
- `GET /api/movies/**` (browse movies)
- `GET /api/showrooms/**` (browse showtimes)
- `GET /api/promotions/validate` (validate promo codes)

**Protected Endpoints (authentication required):**

- `POST/PUT/DELETE /api/movies/**` (movie management)
- `POST/PUT/DELETE /api/showrooms/**` (showroom management)
- `POST /api/promotions/**` (promotion management)
- `ALL /api/bookings/**` (booking operations)
- `ALL /api/profile/**` (profile management)

**Admin-Only Endpoints (checked via `@PreAuthorize("hasRole('ADMIN')")`):**

- `POST /api/movies` (create movie)
- `PUT /api/movies/{id}` (update movie)

#### Security Features

- **Stateless Sessions:** `SessionCreationPolicy.STATELESS` (no server-side sessions)
- **CSRF Protection:** Disabled (appropriate for stateless JWT API)
- **CORS:** Configurable via `app.cors.allowed-origins` property (default: http://localhost:3000)
- **JWT Filter:** Validates tokens and sets authentication context
- **Password Encoding:** BCrypt with strength 12 (increased from default 10)

### Configuration

Add to `application.properties`:

```properties
# CORS configuration (comma-separated for multiple origins)
app.cors.allowed-origins=http://localhost:3000,http://localhost:3001
```

### Benefits

- Clear security boundaries
- Better protection for admin operations
- Easier to understand and maintain
- Configurable CORS for different environments
- Follows security best practices for stateless APIs

---

## 4. Additional Improvements

### Code Quality

- Added comprehensive JavaDoc comments to new classes
- Improved error messages in controllers
- Better separation of concerns

### Consistency

- All date/time operations now go through `DateTimeUtil`
- Consistent error handling patterns
- Standardized API response formats

---

## Migration Guide

### For Developers

1. **Update date/time handling:**

   ```java
   // Old way
   LocalDate date = LocalDate.now();
   promotion.setStartDate(date);

   // New way
   Instant instant = DateTimeUtil.now();
   promotion.setStartDate(instant);

   // Converting for display
   String displayDate = DateTimeUtil.formatDate(instant);
   ```

2. **Querying movies:**

   ```java
   // Old way (no longer works)
   List<MovieItem> upcoming = movieRepo.findByIsUpcoming(true);

   // New way - query showtimes instead
   // Get all showrooms/showtimes, filter by date
   ```

3. **Creating promotions:**

   ```java
   // Old way
   CreatePromotionRequest req = new CreatePromotionRequest();
   req.startDate = LocalDate.of(2024, 1, 1);

   // New way
   CreatePromotionRequest req = new CreatePromotionRequest();
   req.startDate = "2024-01-01"; // String format
   // Controller handles parsing with DateTimeUtil
   ```

### For Frontend

1. **Date/Time handling:**

   - All dates from API are now ISO-8601 Instant strings (UTC)
   - Convert to local timezone in frontend
   - Send dates to API in "yyyy-MM-dd" format for dates, ISO format for datetimes

2. **Movie queries:**

   - Remove reliance on `isUpcoming` field
   - Query `/api/showrooms/**` to get showtimes
   - Filter client-side to determine currently running vs upcoming

3. **Security:**
   - Ensure JWT token is sent with all authenticated requests
   - Handle 401/403 errors appropriately
   - Public endpoints can be accessed without authentication

---

## Testing Recommendations

1. **Date/Time:**

   - Test date parsing with various formats
   - Verify timezone conversions are correct
   - Test date comparisons (before/after/today)

2. **Movie Operations:**

   - Verify movie CRUD operations work without obsolete fields
   - Test that existing movies with old fields still load correctly
   - Ensure showtimes are managed through showroom endpoints

3. **Security:**

   - Test public endpoints without authentication
   - Test protected endpoints with valid JWT
   - Test protected endpoints without/with invalid JWT
   - Test admin-only endpoints with USER role (should fail)
   - Test CORS with different origins

4. **Promotions:**
   - Test date validation (end date before start date, past dates, etc.)
   - Verify promotion validation endpoint works with date ranges
   - Test email formatting includes correct date display

---

## Breaking Changes

⚠️ **API Changes:**

1. `GET /api/movies/currently-running` - **REMOVED**
2. `GET /api/movies/upcoming` - **REMOVED**
3. Promotion dates in API are now Instant (not LocalDate) - affects JSON serialization
4. Showtime start times are now Instant (not LocalDateTime)

⚠️ **Database Schema:**

- `promotions` collection: `startDate` and `endDate` are now stored as Instant (UTC)
- `movies` collection: `showtimes`, `released`, `isUpcoming` fields are obsolete (but not deleted)
- `showrooms` collection: Showtime `start` field is now Instant

⚠️ **Security:**

- More endpoints now require authentication
- CSRF remains disabled (as before, but now documented)

---

## Future Improvements

1. **Date/Time:**

   - Add user-specific timezone preferences
   - Support multiple timezone displays
   - Add date range validation utilities

2. **Security:**

   - Add rate limiting
   - Implement refresh tokens
   - Add security audit logging
   - Consider adding API key authentication for service-to-service calls

3. **Data Migration:**

   - Create migration script to clean up obsolete fields from database
   - Add database versioning/migration system

4. **Testing:**
   - Add integration tests for new security rules
   - Add tests for DateTimeUtil edge cases
   - Add tests for timezone conversions

---

## Files Changed

### New Files

- `backend/src/main/java/edu/uga/csci4050/cinema/util/DateTimeUtil.java`

### Modified Files

- `backend/src/main/java/edu/uga/csci4050/cinema/model/MovieItem.java`
- `backend/src/main/java/edu/uga/csci4050/cinema/model/Promotion.java`
- `backend/src/main/java/edu/uga/csci4050/cinema/type/Showtime.java`
- `backend/src/main/java/edu/uga/csci4050/cinema/repository/MovieRepository.java`
- `backend/src/main/java/edu/uga/csci4050/cinema/controller/MovieController.java`
- `backend/src/main/java/edu/uga/csci4050/cinema/controller/PromotionController.java`
- `backend/src/main/java/edu/uga/csci4050/cinema/controller/dto/MovieDtos.java`
- `backend/src/main/java/edu/uga/csci4050/cinema/controller/dto/PromotionDtos.java`
- `backend/src/main/java/edu/uga/csci4050/cinema/service/DataInitializationService.java`
- `backend/src/main/java/edu/uga/csci4050/cinema/config/SecurityConfig.java`

---

## Questions?

If you have questions about these changes or need help with migration, please refer to:

1. JavaDoc comments in `DateTimeUtil` class
2. Updated controller implementations for examples
3. This document for migration patterns
