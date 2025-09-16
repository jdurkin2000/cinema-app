package edu.uga.csci4050.cinema.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uga.csci4050.cinema.repository.UserRepository;

@RestController
public class HelloController {

    @Autowired
    UserRepository userItemRepo;

    @GetMapping("/api/hello")
    public String index() {
        return "Greetings from Spring Boot!";
    }

    @GetMapping("/api/users/findall")
    public String getAllUsers() {
        return userItemRepo.findAll().toString();
    }

}