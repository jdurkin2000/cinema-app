package edu.uga.csci4050.cinema;

import edu.uga.csci4050.cinema.util.CryptoUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import javax.crypto.SecretKey;

import java.util.Base64;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CinemaApplicationTests {

    @Autowired
    private MockMvc mvc;

	@Test
	void contextLoads() throws Exception{
        mvc.perform(MockMvcRequestBuilders.get("/api/movies").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
	}

    @Test
    void getKey() throws Exception {
        SecretKey key = CryptoUtils.generateKey();
        String base64Key = Base64.getEncoder().encodeToString(key.getEncoded());
        System.out.println(base64Key);
    }
}
