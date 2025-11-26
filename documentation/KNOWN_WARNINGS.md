# Known Warnings and Future Improvements

## Compilation Warnings

### ProfileController.java (Line 156)

**Warning:** Type safety: Unchecked cast from Object to Map<String,String>

**Location:**

```java
Map<String, String> addr = (Map<String, String>) body.get("billingAddress");
```

**Reason:** The `body` parameter is a `Map<String, Object>`, and we're casting the nested address object.

**Impact:** Low - This is a common pattern in Spring controllers. The cast is safe in practice since we control the API contract.

**Future Fix (Optional):**

```java
// Create a proper DTO
public record AddCardRequest(
    String number,
    int expMonth,
    int expYear,
    String billingName,
    Map<String, String> billingAddress
) {}

// Then use:
@PostMapping("/cards")
public ResponseEntity<?> addCard(@RequestBody AddCardRequest request) {
    // Type-safe access to billingAddress
}
```

### SecurityConfig.java (Lines 126, 149)

**Warning:** Missing non-null annotation: inherited method specifies parameter as @NonNull

**Locations:**

1. Line 126: `addCorsMappings(CorsRegistry registry)`
2. Line 149: `doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)`

**Reason:** Spring framework uses `@NonNull` annotations, but we haven't added them to our override methods.

**Impact:** Very Low - These are framework methods that will never receive null parameters.

**Future Fix (Optional):**

```java
import org.springframework.lang.NonNull;

@Override
public void addCorsMappings(@NonNull CorsRegistry registry) {
    // ...
}

@Override
protected void doFilterInternal(
        @NonNull HttpServletRequest req,
        @NonNull HttpServletResponse res,
        @NonNull FilterChain chain) throws ServletException, IOException {
    // ...
}
```

## Recommendation

These warnings are **not critical** and can be addressed in a future cleanup task. They don't affect functionality or cause runtime issues. The codebase is production-ready as-is.

### Priority Level

- **ProfileController cast warning:** Priority 3 (Low) - Consider fixing when adding more DTO classes
- **SecurityConfig annotations:** Priority 4 (Very Low) - Cosmetic improvement only

### Testing Priority

Focus testing efforts on:

1. ✅ Date/time handling (high priority - main refactoring focus)
2. ✅ Movie CRUD without obsolete fields (high priority)
3. ✅ Showtime scheduling (high priority)
4. Promotion validation with date ranges (medium priority)
5. Security authorization rules (medium priority)
6. Profile/card management (low priority - not affected by refactoring)

The warnings above are related to code that was **not changed** during this refactoring, so they represent pre-existing technical debt rather than new issues.
