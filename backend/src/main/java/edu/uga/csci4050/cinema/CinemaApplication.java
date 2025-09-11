package edu.uga.csci4050.cinema;

import edu.uga.csci4050.cinema.model.UserItem;
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

    @Autowired
    UserRepository userItemRepo;

    List<UserItem> userList = new ArrayList<>();

	public static void main(String[] args) {
		SpringApplication.run(CinemaApplication.class, args);
	}

    @Override
    public void run(String... args) {
        System.out.println("Showing all users:");

        showAllUserItems();

        System.out.println("Get User by Name:");

        getUserByName("Ned Stark");

        System.out.println("User Count: ");

        getUserCount();
    }

    public void showAllUserItems() {
        userList = userItemRepo.findAll();

        userList.forEach(item -> System.out.println(getUserDetails(item)));
    }

    public void getUserByName(String name) {
        System.out.println("Getting user by name: " + name);
        UserItem user = userItemRepo.findItemByName(name);
        System.out.println(getUserDetails(user));
    }

    public void getUserCount() {
        long count = userItemRepo.count();
        System.out.println("Number of users in collection: " + count);
    }

    public void deleteUser(String id) {
        userItemRepo.deleteById(id);
        System.out.println("User with id " + id + " deleted...");
    }

    public String getUserDetails(UserItem user) {
        System.out.println("Item Name: " + user.getName() +
             ", \nUser Email: " + user.getEmail() +
             ", \nUser Password " + user.getPassword());

        return "";
    }
}
