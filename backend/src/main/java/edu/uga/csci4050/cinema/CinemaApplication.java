package edu.uga.csci4050.cinema;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CinemaApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(CinemaApplication.class, args);
    }

    @Override
    public void run(String... args) {
        System.out.println("\n======================================================================\n");
        System.out.println("SpringBoot has finished startup process and is ready to receive calls.");
        System.out.println("======================================================================\n");
    }
}
