# Frontend Refactoring Guide

## Overview

The frontend has been refactored to match the backend's date/time handling improvements and model changes.

## Major Changes

### 1. Date/Time Handling

**New Utility Module**: `src/utils/dateTimeUtil.ts`

- Centralized date/time operations
- Consistent formatting across the app
- Proper handling of backend ISO-8601 strings
- Timezone-aware conversions

**Key Functions:**

```typescript
import {
  formatDate,
  formatDateTime,
  toISODate,
  toISOString,
  parseISODate,
  parseISODateTime,
  isInPast,
  isInFuture,
  isToday,
  addDays,
  addHours,
  ensureDate,
  dateReviver,
} from "@/utils/dateTimeUtil";
```

### 2. Model Updates

#### Movie Model

**Removed fields:**

- `showtimes: Date[]` - Now managed via Showtime/Showroom subsystem
- `released: Date` - No longer stored on movies
- `upcoming: boolean` - Determined dynamically from showtimes

**Before:**

```typescript
interface Movie {
  id: string;
  title: string;
  // ... other fields
  showtimes: Date[];
  released: Date;
  upcoming: boolean;
}
```

**After:**

```typescript
interface Movie {
  id: string;
  title: string;
  // ... other fields
  // showtimes, released, upcoming REMOVED
}
```

#### Promotion Model

**Changed date fields to strings:**

```typescript
interface Promotion {
  id: string;
  code: string;
  startDate: string; // Was: Date, now: ISO-8601 string
  endDate: string; // Was: Date, now: ISO-8601 string
  discountPercent: number;
}
```

#### Showtime Model

**Changed start field to string:**

```typescript
interface Showtime {
  movieId: string;
  start: string; // Was: Date, now: ISO-8601 string
  bookedSeats: string[];
  roomId: string;
}
```

### 3. API Changes

#### Movies API (`cinemaApi.ts`)

**CreateMoviePayload** - Removed obsolete fields:

```typescript
// BEFORE
type CreateMoviePayload = {
  // ... fields
  showtimes?: (string | Date)[];
  released?: string | Date;
  upcoming?: boolean;
};

// AFTER
type CreateMoviePayload = {
  // ... fields
  // showtimes, released, upcoming REMOVED
};
```

**No more `/currently-running` or `/upcoming` endpoints**

- Use `showingsApi.getCurrentlyShowingMovies()` instead
- Use `showingsApi.getUpcomingShowingMovies()` instead
- These now query the Showtime/Showroom subsystem

#### Showings API (`showingsApi.ts`)

**Updated to handle string dates from backend:**

```typescript
// All showtime operations now accept Date objects
// but convert to ISO strings when sending to backend

await scheduleMovie(movie, new Date(), showroomId);
// Internally converts date to ISO string for backend
```

## Migration Guide

### Displaying Dates

**Before:**

```typescript
// Direct date manipulation
const dateStr = movie.released.toLocaleDateString();
const timeStr = showtime.start.toLocaleTimeString();
```

**After:**

```typescript
import { formatDate, formatDateTime } from "@/utils/dateTimeUtil";

// Use centralized formatting
const dateStr = formatDate(promotion.startDate);
const timeStr = formatDateTime(showtime.start);
```

### Date Inputs

**Before:**

```typescript
// Manual ISO conversion
const dateStr = myDate.toISOString().split("T")[0];
```

**After:**

```typescript
import { toISODate, toDateInputString } from "@/utils/dateTimeUtil";

// For backend
const apiDate = toISODate(myDate);

// For HTML input
const inputValue = toDateInputString(myDate);
```

### Checking Movie Status

**Before:**

```typescript
// Using movie.upcoming field
const isUpcoming = movie.upcoming;
const isRunning = !movie.upcoming;
```

**After:**

```typescript
import {
  getCurrentlyShowingMovies,
  getUpcomingShowingMovies,
} from "@/libs/showingsApi";

// Query showtime system
const nowShowing = await getCurrentlyShowingMovies();
const upcoming = await getUpcomingShowingMovies();

// Or check specific movie
const showtimes = await getShowtimesForMovie(movie);
const hasShowtimes = showtimes.length > 0;
```

### Creating Movies

**Before:**

```typescript
await createMovie({
  title: "Movie Title",
  // ... other fields
  showtimes: [new Date(), new Date()],
  released: new Date(),
  upcoming: true,
});
```

**After:**

```typescript
// Step 1: Create movie (without showtimes)
const movie = await createMovie({
  title: "Movie Title",
  // ... other fields
  // No showtimes, released, or upcoming
});

// Step 2: Schedule showtimes separately
await scheduleMovie(movie, new Date(), showroomId);
```

### Working with Promotions

**Before:**

```typescript
// Dates were Date objects
const promo = await getPromotion(id);
if (promo.endDate < new Date()) {
  console.log("Expired");
}
```

**After:**

```typescript
import { isInPast } from "@/utils/dateTimeUtil";

// Dates are ISO strings
const promo = await getPromotion(id);
if (isInPast(promo.endDate)) {
  console.log("Expired");
}

// Or convert to Date if needed
const endDate = new Date(promo.endDate);
```

### Form Handling

**Date Input Example:**

```typescript
import {
  toDateInputString,
  fromDateInputString,
  toISODate,
} from "@/utils/dateTimeUtil";

function PromotionForm() {
  const [startDate, setStartDate] = useState(toDateInputString(new Date()));

  const handleSubmit = async () => {
    // Convert to ISO date string for backend
    await createPromotion({
      code: "PROMO",
      startDate: toISODate(fromDateInputString(startDate)),
      endDate: toISODate(fromDateInputString(endDate)),
      discountPercent: 10,
    });
  };

  return (
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />
  );
}
```

**DateTime Input Example:**

```typescript
import {
  toDateTimeLocalString,
  fromDateTimeLocalString,
  toISOString,
} from "@/utils/dateTimeUtil";

function ShowtimeScheduler() {
  const [showtime, setShowtime] = useState(toDateTimeLocalString(new Date()));

  const handleSchedule = async () => {
    const date = fromDateTimeLocalString(showtime);
    await scheduleMovie(movie, date, showroomId);
  };

  return (
    <input
      type="datetime-local"
      value={showtime}
      onChange={(e) => setShowtime(e.target.value)}
    />
  );
}
```

## Common Patterns

### Display Showtime List

```typescript
import { formatDateTime } from "@/utils/dateTimeUtil";

function ShowtimeList({ movie }: { movie: Movie }) {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  useEffect(() => {
    getShowtimesForMovie(movie).then(setShowtimes);
  }, [movie]);

  return (
    <ul>
      {showtimes.map((st) => (
        <li key={st.start}>{formatDateTime(st.start)}</li>
      ))}
    </ul>
  );
}
```

### Filter Future Showtimes

```typescript
import { isInFuture } from "@/utils/dateTimeUtil";

const futureShowtimes = showtimes.filter((st) => isInFuture(st.start));
```

### Group Showtimes by Date

```typescript
import { formatDate, isSameDay } from "@/utils/dateTimeUtil";

function groupShowtimesByDate(showtimes: Showtime[]) {
  const grouped = new Map<string, Showtime[]>();

  showtimes.forEach((st) => {
    const dateKey = formatDate(st.start);
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(st);
  });

  return grouped;
}
```

### Check Promotion Validity

```typescript
import { isInPast, isInFuture } from "@/utils/dateTimeUtil";

function isPromotionValid(promo: Promotion): boolean {
  const now = new Date();
  return !isInPast(promo.endDate) && !isInFuture(promo.startDate);
}
```

## Testing

### Test Date Utilities

```typescript
import { formatDate, toISODate, addDays } from "@/utils/dateTimeUtil";

describe("dateTimeUtil", () => {
  it("formats dates correctly", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    expect(formatDate(date)).toMatch(/1\/15\/2024/);
  });

  it("converts to ISO date", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    expect(toISODate(date)).toBe("2024-01-15");
  });

  it("adds days correctly", () => {
    const date = new Date("2024-01-15");
    const future = addDays(date, 7);
    expect(toISODate(future)).toBe("2024-01-22");
  });
});
```

### Mock API Responses

```typescript
// Mock movie without obsolete fields
const mockMovie: Movie = {
  id: "1",
  title: "Test Movie",
  genres: ["Action"],
  cast: ["Actor"],
  director: "Director",
  producer: "Producer",
  synopsis: "Synopsis",
  reviews: [],
  poster: "/poster.jpg",
  trailer: "/trailer.mp4",
  rating: "PG-13",
  // No showtimes, released, or upcoming
};

// Mock showtime with ISO string
const mockShowtime: Showtime = {
  movieId: "1",
  start: "2024-01-15T19:30:00Z", // ISO string
  bookedSeats: [],
  roomId: "room1",
};

// Mock promotion with ISO strings
const mockPromotion: Promotion = {
  id: "1",
  code: "SAVE10",
  startDate: "2024-01-01T00:00:00Z", // ISO string
  endDate: "2024-12-31T23:59:59Z", // ISO string
  discountPercent: 10,
};
```

## Troubleshooting

### Issue: Dates display as ISO strings

**Problem:**

```typescript
// Shows: "2024-01-15T19:30:00Z" instead of "1/15/2024, 7:30 PM"
<p>{showtime.start}</p>
```

**Solution:**

```typescript
import { formatDateTime } from "@/utils/dateTimeUtil";

<p>{formatDateTime(showtime.start)}</p>;
```

### Issue: Cannot compare dates

**Problem:**

```typescript
// Error: start is a string, not a Date
if (showtime.start > new Date()) {
}
```

**Solution:**

```typescript
import { isInFuture } from "@/utils/dateTimeUtil";

if (isInFuture(showtime.start)) {
}
```

### Issue: Date input not working

**Problem:**

```typescript
// HTML date input needs specific format
<input type="date" value={promotion.startDate} /> // ISO string doesn't work
```

**Solution:**

```typescript
import { toDateInputString } from "@/utils/dateTimeUtil";

<input
  type="date"
  value={toDateInputString(promotion.startDate)}
  onChange={(e) => {
    // e.target.value is already in yyyy-MM-dd format
    setStartDate(e.target.value);
  }}
/>;
```

## Best Practices

1. **Always import from `@/utils/dateTimeUtil`** for date operations
2. **Keep dates as strings in state** when they come from API
3. **Convert to Date only when needed** for comparisons or manipulation
4. **Use formatters for display** instead of direct string manipulation
5. **Send ISO strings to backend** using `toISOString()` or `toISODate()`
6. **Test with different timezones** to ensure consistency
7. **Use type-safe utilities** instead of manual string parsing
8. **Document expected formats** in component props and interfaces

## Summary

- ✅ Movie model simplified (no more showtimes/released/upcoming)
- ✅ All dates from backend are ISO-8601 strings
- ✅ Centralized date utilities in `@/utils/dateTimeUtil`
- ✅ Consistent formatting across the app
- ✅ Proper timezone handling
- ✅ Type-safe date operations
- ✅ Better separation of concerns (movies vs showtimes)

## Breaking Changes

⚠️ **Components using `movie.showtimes`, `movie.released`, or `movie.upcoming` will break**

- Update to use showingsApi instead
- Query showtimes separately via `getShowtimesForMovie()`

⚠️ **Date fields are now strings**

- Promotion: `startDate` and `endDate`
- Showtime: `start`
- Use dateTimeUtil functions for manipulation

⚠️ **API changes**

- `/api/movies/currently-running` - REMOVED
- `/api/movies/upcoming` - REMOVED
- Use showingsApi functions instead
