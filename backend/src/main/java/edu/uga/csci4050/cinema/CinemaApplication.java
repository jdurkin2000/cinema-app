package edu.uga.csci4050.cinema;

import edu.uga.csci4050.cinema.model.User;
import edu.uga.csci4050.cinema.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
@EnableMongoRepositories
public class CinemaApplication implements CommandLineRunner {

	public static void main(String[] args) {
		SpringApplication.run(CinemaApplication.class, args);
	}

    @Override
    public void run(String... args) {

    }
}
