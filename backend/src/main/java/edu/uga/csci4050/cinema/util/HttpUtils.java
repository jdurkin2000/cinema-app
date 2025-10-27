package edu.uga.csci4050.cinema.util;

import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

public class HttpUtils {
    public static <T> ResponseEntity<List<T>> buildResponseEntity(List<T> list, String notFoundMsg)
            throws ResponseStatusException {
        if (list.isEmpty())
            return ResponseEntity.notFound().build();
            //throw new ResponseStatusException(HttpStatus.NOT_FOUND, notFoundMsg);
            

        return ResponseEntity.ok(list);
    }

    public static <T> ResponseEntity<T> buildResponseEntity(T item, String notFoundMsg) throws ResponseStatusException {
        if (item == null)
            return ResponseEntity.notFound().build();
            //throw new ResponseStatusException(HttpStatus.NOT_FOUND, notFoundMsg);

        return ResponseEntity.ok(item);
    }
}
