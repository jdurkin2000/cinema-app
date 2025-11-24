package edu.uga.csci4050.cinema.repository;

import edu.uga.csci4050.cinema.model.Promotion;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PromotionRepository extends MongoRepository<Promotion, String> {
    boolean existsByCodeIgnoreCase(String code);

    public Promotion findByCode(String code);
}
