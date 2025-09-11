package edu.uga.csci4050.cinema.repository;

import edu.uga.csci4050.cinema.model.UserItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface UserRepository extends
        MongoRepository<UserItem, String> {

    @Query("{name:'?0'}")
    UserItem findItemByName(String name);

    public long count();
}
