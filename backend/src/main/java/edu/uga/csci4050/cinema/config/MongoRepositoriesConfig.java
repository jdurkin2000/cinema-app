package edu.uga.csci4050.cinema.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@Profile("!test")
@EnableMongoRepositories(basePackages = "edu.uga.csci4050.cinema.repository")
public class MongoRepositoriesConfig {
}
