package edu.uga.csci4050.cinema.util;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Centralized utility class for handling all date and time operations.
 * Uses Instant for all database storage to ensure UTC consistency.
 * Provides conversion methods between Instant and user-friendly formats.
 */
public class DateTimeUtil {

    // Standard formatters
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter ISO_DATETIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    // Default timezone for display (can be configured per user if needed)
    private static final ZoneId DEFAULT_ZONE = ZoneId.of("America/New_York");

    /**
     * Get the current instant in UTC
     */
    public static Instant now() {
        return Instant.now();
    }

    /**
     * Get today's date in the default timezone
     */
    public static LocalDate today() {
        return LocalDate.now(DEFAULT_ZONE);
    }

    /**
     * Convert Instant to LocalDate in the default timezone
     */
    public static LocalDate toLocalDate(Instant instant) {
        if (instant == null)
            return null;
        return instant.atZone(DEFAULT_ZONE).toLocalDate();
    }

    /**
     * Convert Instant to LocalDateTime in the default timezone
     */
    public static LocalDateTime toLocalDateTime(Instant instant) {
        if (instant == null)
            return null;
        return instant.atZone(DEFAULT_ZONE).toLocalDateTime();
    }

    /**
     * Convert LocalDate to Instant at start of day in default timezone
     */
    public static Instant fromLocalDate(LocalDate date) {
        if (date == null)
            return null;
        return date.atStartOfDay(DEFAULT_ZONE).toInstant();
    }

    /**
     * Convert LocalDateTime to Instant in default timezone
     */
    public static Instant fromLocalDateTime(LocalDateTime dateTime) {
        if (dateTime == null)
            return null;
        return dateTime.atZone(DEFAULT_ZONE).toInstant();
    }

    /**
     * Format Instant as date string (yyyy-MM-dd)
     */
    public static String formatDate(Instant instant) {
        if (instant == null)
            return null;
        return toLocalDate(instant).format(DATE_FORMATTER);
    }

    /**
     * Format Instant as datetime string (yyyy-MM-dd HH:mm)
     */
    public static String formatDateTime(Instant instant) {
        if (instant == null)
            return null;
        return toLocalDateTime(instant).format(DATETIME_FORMATTER);
    }

    /**
     * Parse date string to Instant
     */
    public static Instant parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank())
            return null;
        try {
            LocalDate date = LocalDate.parse(dateStr, DATE_FORMATTER);
            return fromLocalDate(date);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Expected: yyyy-MM-dd", e);
        }
    }

    /**
     * Parse datetime string to Instant
     */
    public static Instant parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isBlank())
            return null;
        try {
            LocalDateTime dateTime = LocalDateTime.parse(dateTimeStr, DATETIME_FORMATTER);
            return fromLocalDateTime(dateTime);
        } catch (DateTimeParseException e) {
            // Try ISO format as fallback
            try {
                LocalDateTime dateTime = LocalDateTime.parse(dateTimeStr, ISO_DATETIME_FORMATTER);
                return fromLocalDateTime(dateTime);
            } catch (DateTimeParseException e2) {
                throw new IllegalArgumentException("Invalid datetime format. Expected: yyyy-MM-dd HH:mm or ISO format",
                        e);
            }
        }
    }

    /**
     * Add days to an Instant
     */
    public static Instant plusDays(Instant instant, long days) {
        if (instant == null)
            return null;
        return instant.plus(Duration.ofDays(days));
    }

    /**
     * Add hours to an Instant
     */
    public static Instant plusHours(Instant instant, long hours) {
        if (instant == null)
            return null;
        return instant.plus(Duration.ofHours(hours));
    }

    /**
     * Check if an Instant is in the past
     */
    public static boolean isInPast(Instant instant) {
        if (instant == null)
            return false;
        return instant.isBefore(now());
    }

    /**
     * Check if an Instant is in the future
     */
    public static boolean isInFuture(Instant instant) {
        if (instant == null)
            return false;
        return instant.isAfter(now());
    }

    /**
     * Check if a date (at start of day) is before today
     */
    public static boolean isDateBeforeToday(Instant instant) {
        if (instant == null)
            return false;
        LocalDate date = toLocalDate(instant);
        return date.isBefore(today());
    }

    /**
     * Check if a date (at start of day) is after today
     */
    public static boolean isDateAfterToday(Instant instant) {
        if (instant == null)
            return false;
        LocalDate date = toLocalDate(instant);
        return date.isAfter(today());
    }

    /**
     * Check if an instant falls on today
     */
    public static boolean isToday(Instant instant) {
        if (instant == null)
            return false;
        LocalDate date = toLocalDate(instant);
        return date.equals(today());
    }

    /**
     * Get Instant for a specific date and time
     */
    public static Instant of(int year, int month, int day, int hour, int minute) {
        LocalDateTime dateTime = LocalDateTime.of(year, month, day, hour, minute);
        return fromLocalDateTime(dateTime);
    }

    /**
     * Get Instant for a specific date at start of day
     */
    public static Instant ofDate(int year, int month, int day) {
        LocalDate date = LocalDate.of(year, month, day);
        return fromLocalDate(date);
    }
}
