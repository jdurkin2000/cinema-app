package edu.uga.csci4050.cinema.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uga.csci4050.cinema.model.Showroom;
import edu.uga.csci4050.cinema.repository.ShowroomRepository;
import edu.uga.csci4050.cinema.util.HttpUtils;

@RestController
@RequestMapping("api/showrooms")
public class ShowroomController {
    @Autowired
    ShowroomRepository showroomRepository;

    @GetMapping
    public ResponseEntity<List<Showroom>> getAllShowrooms() {
        return HttpUtils.buildResponseEntity(showroomRepository.findAll(), "No showrooms found");
    }

    @PostMapping
    public Showroom saveShowrooms(@RequestBody )
}
