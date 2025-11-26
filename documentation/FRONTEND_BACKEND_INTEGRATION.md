# Frontend-Backend Integration Guide

## Overview

This document describes how the frontend (Next.js/TypeScript) and backend (Spring Boot/Java) communicate, with special focus on the recent refactoring changes.

## API Contract

### Date/Time Format

**Backend → Frontend:**

- Backend stores all dates as `java.time.Instant` (UTC)
- Jackson serializes to ISO-8601 strings: `"2024-01-15T19:30:00Z"`
- Frontend receives strings and uses `dateTimeUtil` for parsing/formatting

**Frontend → Backend:**

- Frontend sends ISO-8601 strings using `toISOString()` or `toISODate()`
- Backend parses using `DateTimeUtil.parseDate()` to `Instant`
- No timezone confusion - everything in UTC

### Authentication

**JWT Token Flow:**

```
1. POST /api/auth/login → { token, role, name }
2. Store token in localStorage
3. Include in subsequent requests: Authorization: Bearer <token>
4. Backend validates with JwtService
```

**Endpoints:**

- Public: `/api/auth/**`, `GET /api/movies/**`, `GET /api/showrooms/**`, `GET /api/promotions/validate`
- Protected: `POST/PUT/DELETE /api/movies/**`, `POST/PUT/DELETE /api/showrooms/**`, `/api/promotions/**`, `/api/bookings/**`, `/api/profile/**`

## Model Mappings

### Movie

**Backend (MovieItem.java):**

```java
public class MovieItem {
    private String id;
    private String title;
    private List<String> genres;
    private List<String> cast;
    private String director;
    private String producer;
    private String synopsis;
    private List<String> reviews;
    private String poster;
    private String trailer;
    private String rating;
    // showtimes, released, upcoming REMOVED
}
```

**Frontend (movie.ts):**

```typescript
export interface Movie {
  id: string;
  title: string;
  genres: string[];
  cast: string[];
  director: string;
  producer: string;
  synopsis: string;
  reviews: string[];
  poster: string;
  trailer: string;
  rating: string;
  // showtimes, released, upcoming REMOVED
}
```

### Promotion

**Backend (Promotion.java):**

```java
public class Promotion {
    private String id;
    private String code;
    private Instant startDate;  // Serialized as ISO-8601 string
    private Instant endDate;    // Serialized as ISO-8601 string
    private Integer discountPercent;
}
```

**Frontend (promotion.ts):**

```typescript
export interface Promotion {
  id: string;
  code: string;
  startDate: string; // ISO-8601 from backend
  endDate: string; // ISO-8601 from backend
  discountPercent: number;
}
```

### Showtime

**Backend (Showtime record):**

```java
public record Showtime(
    String movieId,
    Instant start,           // Serialized as ISO-8601 string
    List<String> bookedSeats,
    String roomId
) {}
```

**Frontend (shows.ts):**

```typescript
export interface Showtime {
  movieId: string;
  start: string; // ISO-8601 from backend
  bookedSeats: string[];
  roomId: string;
}
```

### Showroom

**Backend (Showroom.java):**

```java
public class Showroom {
    private String id;
    private String name;
    private int capacity;
    private List<List<String>> seatLayout;
    private List<Showtime> showtimes;
}
```

**Frontend (shows.ts):**

```typescript
export interface Showroom {
  id: string;
  name: string;
  capacity: number;
  seatLayout: string[][];
  showtimes: Showtime[];
}
```

## API Endpoints

### Movies

| Method | Endpoint           | Backend                          | Frontend                   | Notes                |
| ------ | ------------------ | -------------------------------- | -------------------------- | -------------------- |
| GET    | `/api/movies`      | `MovieController.getAllMovies()` | `cinemaApi.getMovies()`    | Returns all movies   |
| GET    | `/api/movies/{id}` | `MovieController.getMovie()`     | `cinemaApi.getMovieById()` | Returns single movie |
| POST   | `/api/movies`      | `MovieController.createMovie()`  | `cinemaApi.createMovie()`  | Admin only           |
| PUT    | `/api/movies/{id}` | `MovieController.updateMovie()`  | `cinemaApi.updateMovie()`  | Admin only           |
| DELETE | `/api/movies/{id}` | `MovieController.deleteMovie()`  | `cinemaApi.deleteMovie()`  | Admin only           |

**Removed Endpoints:**

- ❌ `GET /api/movies/currently-running` - Use showrooms API
- ❌ `GET /api/movies/upcoming` - Use showrooms API

### Showrooms & Showtimes

| Method | Endpoint                         | Backend                                     | Frontend                             | Notes                                   |
| ------ | -------------------------------- | ------------------------------------------- | ------------------------------------ | --------------------------------------- |
| GET    | `/api/showrooms`                 | `ShowroomController.getAllShowrooms()`      | `showingsApi.getShowrooms()`         | Returns all showrooms with showtimes    |
| GET    | `/api/showrooms/{id}`            | `ShowroomController.getShowroom()`          | `showingsApi.getShowroomById()`      | Returns single showroom                 |
| POST   | `/api/showrooms`                 | `ShowroomController.createShowroom()`       | `showingsApi.createShowroom()`       | Admin only, accepts ISO date strings    |
| DELETE | `/api/showrooms/{id}`            | `ShowroomController.deleteShowroom()`       | `showingsApi.deleteShowroom()`       | Admin only                              |
| GET    | `/api/showrooms/movie/{movieId}` | `ShowroomController.getShowtimesForMovie()` | `showingsApi.getShowtimesForMovie()` | All showtimes for a movie               |
| POST   | `/api/showrooms/schedule`        | `ShowroomController.scheduleMovie()`        | `showingsApi.scheduleMovie()`        | Admin only, accepts ISO datetime string |

**New Functions (Frontend):**

- `getCurrentlyShowingMovies()` - Queries showrooms, returns movies with future showtimes
- `getUpcomingShowingMovies()` - Similar but for movies not yet started
- `scheduleMovieWithShowroom()` - Creates showroom + schedules movie in one call

### Promotions

| Method | Endpoint                   | Backend                                   | Frontend                        | Notes                                |
| ------ | -------------------------- | ----------------------------------------- | ------------------------------- | ------------------------------------ |
| GET    | `/api/promotions`          | `PromotionController.getAllPromotions()`  | `cinemaApi.getPromotions()`     | Admin only                           |
| POST   | `/api/promotions`          | `PromotionController.createPromotion()`   | `cinemaApi.createPromotion()`   | Admin only, accepts ISO date strings |
| PUT    | `/api/promotions/{id}`     | `PromotionController.updatePromotion()`   | `cinemaApi.updatePromotion()`   | Admin only, accepts ISO date strings |
| DELETE | `/api/promotions/{id}`     | `PromotionController.deletePromotion()`   | `cinemaApi.deletePromotion()`   | Admin only                           |
| POST   | `/api/promotions/validate` | `PromotionController.validatePromotion()` | `cinemaApi.validatePromotion()` | Public - validates promo code        |

## Date/Time Handling Examples

### Creating a Movie (No Dates)

**Frontend:**

```typescript
const movie = await createMovie({
  title: "Inception",
  genres: ["Sci-Fi", "Thriller"],
  cast: ["Leonardo DiCaprio"],
  director: "Christopher Nolan",
  producer: "Emma Thomas",
  synopsis: "A thief...",
  reviews: [],
  poster: "/poster.jpg",
  trailer: "/trailer.mp4",
  rating: "PG-13",
});
```

**Backend receives:**

```json
{
  "title": "Inception",
  "genres": ["Sci-Fi", "Thriller"],
  ...
}
```

### Scheduling a Showtime (With Dates)

**Frontend:**

```typescript
import { toISOString } from "@/utils/dateTimeUtil";

const showtimeDate = new Date("2024-01-15T19:30:00");
await scheduleMovie(movie, showtimeDate, showroomId);
```

**Backend receives:**

```json
{
  "movieId": "movie123",
  "showtime": "2024-01-15T19:30:00.000Z",
  "showroomId": "room1"
}
```

**Backend processes:**

```java
Instant start = DateTimeUtil.parseDate(request.showtime());
// Stored as Instant in database
```

### Creating a Promotion (With Date Range)

**Frontend:**

```typescript
import { toISODate } from "@/utils/dateTimeUtil";

await createPromotion({
  code: "SUMMER2024",
  startDate: toISODate(new Date("2024-06-01")),
  endDate: toISODate(new Date("2024-08-31")),
  discountPercent: 20,
});
```

**Backend receives:**

```json
{
  "code": "SUMMER2024",
  "startDate": "2024-06-01",
  "endDate": "2024-08-31",
  "discountPercent": 20
}
```

**Backend processes:**

```java
Instant startDate = DateTimeUtil.parseDate(request.startDate());
Instant endDate = DateTimeUtil.parseDate(request.endDate());
// Sets time to start of day UTC
```

### Displaying Showtimes

**Backend returns:**

```json
{
  "id": "showroom1",
  "name": "Theater 1",
  "showtimes": [
    {
      "movieId": "movie123",
      "start": "2024-01-15T19:30:00Z",
      "bookedSeats": ["A1", "A2"],
      "roomId": "showroom1"
    }
  ]
}
```

**Frontend displays:**

```typescript
import { formatDateTime } from "@/utils/dateTimeUtil";

showtimes.map((st) => (
  <div key={st.start}>{formatDateTime(st.start)} // "1/15/2024, 7:30 PM"</div>
));
```

## Timezone Considerations

**Backend (All UTC):**

- Database stores: `ISODate("2024-01-15T19:30:00.000Z")`
- Java processes: `Instant.parse("2024-01-15T19:30:00Z")`
- API returns: `"2024-01-15T19:30:00Z"`

**Frontend (User's Local Timezone):**

- Receives: `"2024-01-15T19:30:00Z"`
- Displays: `formatDateTime()` → "1/15/2024, 2:30 PM" (EST)
- Sends: `toISOString()` → `"2024-01-15T19:30:00.000Z"`

**Important:** The backend stores in UTC, but the frontend displays in the user's local timezone. This is intentional and correct.

## Error Handling

### Date Parse Errors

**Backend:**

```java
try {
    Instant date = DateTimeUtil.parseDate(dateString);
} catch (DateTimeParseException e) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date format");
}
```

**Frontend:**

```typescript
try {
  const date = parseISODate(dateString);
} catch (error) {
  console.error("Invalid date format:", error);
}
```

### Validation Errors

**Backend returns:**

```json
{
  "status": 400,
  "message": "Start date must be before end date"
}
```

**Frontend handles:**

```typescript
try {
  await createPromotion(data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    alert(error.response?.data?.message || "Failed to create promotion");
  }
}
```

## Security Integration

### JWT Token Management

**Frontend (authStore.ts):**

```typescript
export const authStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  login: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));
```

**Backend (JwtService.java):**

```java
public String generateToken(String email) {
    return Jwts.builder()
        .setSubject(email)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24 hours
        .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
        .compact();
}
```

### Protected Routes

**Frontend (middleware.ts):**

```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token && request.nextUrl.pathname.startsWith("/profile")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check admin routes
  if (request.nextUrl.pathname.startsWith("/system-admin")) {
    // Verify admin role from token
  }
}
```

**Backend (SecurityConfig.java):**

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers(HttpMethod.GET, "/api/movies/**").permitAll()
    .requestMatchers(HttpMethod.POST, "/api/movies/**").hasRole("ADMIN")
    // ...
);
```

## Testing

### Frontend API Tests

```typescript
import { createMovie, getMovies } from "@/libs/cinemaApi";
import { scheduleMovie } from "@/libs/showingsApi";
import { toISOString } from "@/utils/dateTimeUtil";

describe("Movie API Integration", () => {
  it("creates movie without obsolete fields", async () => {
    const movie = await createMovie({
      title: "Test Movie",
      genres: ["Action"],
      // No showtimes, released, upcoming
    });

    expect(movie).not.toHaveProperty("showtimes");
    expect(movie).not.toHaveProperty("released");
    expect(movie).not.toHaveProperty("upcoming");
  });

  it("schedules showtime with proper date format", async () => {
    const date = new Date("2024-01-15T19:30:00");
    await scheduleMovie(movie, date, "room1");

    // Backend should receive ISO string
    expect(mockAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        showtime: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
      })
    );
  });
});
```

### Backend Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
class MovieControllerTests {

    @Test
    void createMovie_withoutObsoleteFields() throws Exception {
        String movieJson = """
            {
                "title": "Test Movie",
                "genres": ["Action"]
            }
            """;

        mockMvc.perform(post("/api/movies")
                .contentType(MediaType.APPLICATION_JSON)
                .content(movieJson)
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.showtimes").doesNotExist())
            .andExpect(jsonPath("$.released").doesNotExist())
            .andExpect(jsonPath("$.upcoming").doesNotExist());
    }
}
```

## Migration Checklist

### Backend

- [x] Created `DateTimeUtil` class
- [x] Updated all models to use `Instant`
- [x] Removed obsolete Movie fields
- [x] Updated DTOs to match new structure
- [x] Refactored `SecurityConfig`
- [x] Updated controllers to use `DateTimeUtil`
- [x] Created migration utility
- [x] Documented changes

### Frontend

- [x] Created `dateTimeUtil.ts`
- [x] Updated `Movie` interface (removed obsolete fields)
- [x] Updated `Promotion` interface (string dates)
- [x] Updated `Showtime` interface (string date)
- [x] Updated `cinemaApi.ts` (removed obsolete fields)
- [x] Updated `showingsApi.ts` (proper date handling)
- [x] Verified no components use obsolete fields
- [x] Documented integration

### Testing

- [ ] Test movie CRUD operations
- [ ] Test showtime scheduling
- [ ] Test promotion creation/validation
- [ ] Test date display in different timezones
- [ ] Test authentication flow
- [ ] Test admin vs user permissions
- [ ] End-to-end booking flow

## Common Issues

### Issue: Dates display incorrectly

**Cause:** Frontend not using `dateTimeUtil` formatters  
**Fix:** Import and use `formatDate()` or `formatDateTime()`

### Issue: Backend rejects date format

**Cause:** Frontend sending wrong format  
**Fix:** Use `toISOString()` or `toISODate()` before sending

### Issue: Movie has no showtimes

**Cause:** Looking for `movie.showtimes` field  
**Fix:** Query `getShowtimesForMovie(movie)` instead

### Issue: Timezone confusion

**Cause:** Mixing local time and UTC  
**Fix:** Backend always uses UTC, frontend converts for display

### Issue: 403 Forbidden

**Cause:** Endpoint requires admin role  
**Fix:** Check `SecurityConfig` authorization rules and user role

## Summary

The frontend and backend now have:

- ✅ Consistent date/time handling (UTC + ISO-8601)
- ✅ Simplified Movie model (no embedded showtimes)
- ✅ Clear separation of concerns (movies vs showtimes)
- ✅ Type-safe date operations
- ✅ Proper authentication and authorization
- ✅ Comprehensive documentation

All changes maintain backward compatibility where possible, with clear migration paths for breaking changes.
