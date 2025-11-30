package edu.uga.csci4050.cinema.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uga.csci4050.cinema.controller.dto.TicketInfoDtos.UpdateTicketRequest;
import edu.uga.csci4050.cinema.model.TicketInfo;
import edu.uga.csci4050.cinema.repository.TicketRepository;
import edu.uga.csci4050.cinema.util.HttpUtils;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {
    @Autowired
    TicketRepository ticketRepo;

    @GetMapping("/prices")
    public ResponseEntity<List<TicketInfo>> getTicketPrices() {
        List<TicketInfo> info = ticketRepo.findAll();

        return HttpUtils.buildResponseEntity(info, "No ticket prices in database!");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/prices/{id}")
    public ResponseEntity<Void> updateTicketPrice(@RequestBody @Valid UpdateTicketRequest body) {
        var ticket = ticketRepo.findByType(body.type).orElse(null);
        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }

        if (Double.compare(body.price, ticket.getPrice()) != 0) {
            ticket.setPrice(body.price);
            ticketRepo.save(ticket);
        }

        return ResponseEntity.ok().build();
    }
}
