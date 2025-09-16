package edu.uga.csci4050.cinema.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

public class HttpUtils {
    public static <T> ResponseEntity<List<T>> buildResponseEntity(List<T> list, String notFoundMsg)
            throws ResponseStatusException {
        if (list.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, notFoundMsg);

        return ResponseEntity.ok(list);
    }

    public static <T> ResponseEntity<T> buildResponseEntity(T item, String notFoundMsg) throws ResponseStatusException {
        if (item == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, notFoundMsg);

        return ResponseEntity.ok(item);
    }

    // public static <T> ResponseEntity<T> buildResponseEntity(Optional<T> opt, String notFoundMsg)
    //         throws ResponseStatusException {
    //     return opt.map(item -> buildResponseEntity(item, notFoundMsg));
    // }
}
