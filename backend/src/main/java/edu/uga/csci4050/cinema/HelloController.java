package edu.uga.csci4050.cinema;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/api/hello")
    public String index() {
        return "Greetings from Spring Boot!";
    }

}