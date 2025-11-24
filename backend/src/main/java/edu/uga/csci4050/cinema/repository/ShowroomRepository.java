package edu.uga.csci4050.cinema.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import edu.uga.csci4050.cinema.model.Showroom;

public interface ShowroomRepository extends MongoRepository<Showroom, String>{
}
