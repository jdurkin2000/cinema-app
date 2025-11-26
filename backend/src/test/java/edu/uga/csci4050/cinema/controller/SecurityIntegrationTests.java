package edu.uga.csci4050.cinema.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.uga.csci4050.cinema.model.Showroom;
import edu.uga.csci4050.cinema.repository.ShowroomRepository;
import edu.uga.csci4050.cinema.type.Showtime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import static org.mockito.Mockito.mock;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MVC security slice tests verifying endpoint authorization without hitting
 * real DB or JWT.
 */
@WebMvcTest(controllers = { ShowroomController.class, BookingController.class }, excludeAutoConfiguration = {
        MongoAutoConfiguration.class, MongoDataAutoConfiguration.class })
@Import(edu.uga.csci4050.cinema.config.SecurityConfig.class)
@ActiveProfiles("test")
class SecurityIntegrationTests {

    // No DB beans required; repositories disabled via test profile

    @Autowired
    MockMvc mvc;

    @Autowired
    ShowroomRepository showroomRepository;

    @Autowired
    edu.uga.csci4050.cinema.security.JwtService jwtService;

    // No mongoTemplate needed when repositories are disabled

    ObjectMapper om = new ObjectMapper();

    @TestConfiguration
    static class TestBeansConfig {
        @Bean
        ShowroomRepository showroomRepository() {
            return mock(ShowroomRepository.class);
        }

        @Bean
        edu.uga.csci4050.cinema.security.JwtService jwtService() {
            return mock(edu.uga.csci4050.cinema.security.JwtService.class);
        }
    }

    @Test
    @DisplayName("GET /api/showrooms is public")
    void getShowrooms_isPublic() throws Exception {
        Showroom room = new Showroom();
        room.setId("r1");
        when(showroomRepository.findAll()).thenReturn(List.of(room));
        mvc.perform(get("/api/showrooms")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/showrooms requires ADMIN (USER forbidden)")
    @WithMockUser(username = "user@example.com", roles = { "USER" })
    void postShowrooms_forbiddenForUser() throws Exception {
        when(showroomRepository.save(any(Showroom.class))).thenAnswer(inv -> {
            Showroom in = inv.getArgument(0);
            in.setId("r1");
            return in;
        });
        mvc.perform(post("/api/showrooms")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/showrooms allowed for ADMIN")
    @WithMockUser(username = "admin@example.com", roles = { "ADMIN" })
    void postShowrooms_allowedForAdmin() throws Exception {
        when(showroomRepository.save(any(Showroom.class))).thenAnswer(inv -> {
            Showroom in = inv.getArgument(0);
            in.setId("r1");
            return in;
        });
        mvc.perform(post("/api/showrooms")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/bookings requires authentication (anonymous unauthorized)")
    void postBookings_requiresAuth() throws Exception {
        // Minimal valid request body; controller won't be reached due to auth, so body
        // shape doesn't matter
        var body = "{\"showtime\":{\"movieId\":\"m1\",\"start\":\"" + Instant.now().toString()
                + "\",\"roomId\":\"r1\"},\"seats\":[\"A1\"]}";
        mvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/bookings allowed for USER role")
    @WithMockUser(username = "user@example.com", roles = { "USER" })
    void postBookings_allowedForUser() throws Exception {
        // Prepare a showroom and a matching showtime for controller logic to succeed
        Showroom room = new Showroom();
        room.setId("r1");
        // no name field in Showroom
        var showtimes = new ArrayList<Showtime>();
        var st = new Showtime("m1", Instant.parse("2025-01-01T00:00:00Z"), new String[0], "r1");
        showtimes.add(st);
        room.setShowtimes(showtimes);
        when(showroomRepository.findById("r1")).thenReturn(java.util.Optional.of(room));
        when(showroomRepository.save(any(Showroom.class))).thenAnswer(inv -> inv.getArgument(0));

        var body = "{\"showtime\":{\"movieId\":\"m1\",\"start\":\"2025-01-01T00:00:00Z\",\"roomId\":\"r1\"},\"seats\":[\"A1\",\"A2\"]}";

        mvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk());
    }
}
