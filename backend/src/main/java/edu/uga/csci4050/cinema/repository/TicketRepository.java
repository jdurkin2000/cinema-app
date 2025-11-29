package edu.uga.csci4050.cinema.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import edu.uga.csci4050.cinema.model.TicketInfo;
import edu.uga.csci4050.cinema.type.TicketType;

public interface TicketRepository extends MongoRepository<TicketInfo, String>{
    Optional<TicketInfo> findByType(TicketType type);
}
