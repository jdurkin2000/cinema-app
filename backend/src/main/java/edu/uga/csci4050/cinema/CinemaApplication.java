package edu.uga.csci4050.cinema;

import com.ulisesbocchio.jasyptspringboot.annotation.EnableEncryptableProperties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories
@EnableEncryptableProperties
@PropertySource(name="EncryptedProperties", value = "classpath:application.properties")
public class CinemaApplication implements CommandLineRunner {

	public static void main(String[] args) {
		SpringApplication.run(CinemaApplication.class, args);
	}

    @Override
    public void run(String... args) {
        System.out.println("SpringBoot has finished startup process and is ready to receive calls.");
    }
}
