package edu.uga.csci4050.cinema.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {
    private final JavaMailSender sender;
    private final String from;
    private final String baseUrl;
    public MailService(JavaMailSender sender,
                       @Value("${app.mail.from}") String from,
                       @Value("${app.frontend.baseUrl}") String baseUrl) {
        this.sender = sender; this.from = from; this.baseUrl=baseUrl;
    }
    public void send(String to, String subject, String body){
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from); msg.setTo(to); msg.setSubject(subject); msg.setText(body);
        sender.send(msg);
    }
    public String frontendUrl(){ return baseUrl; }
}
