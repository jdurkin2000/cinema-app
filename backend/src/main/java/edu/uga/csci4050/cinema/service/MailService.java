package edu.uga.csci4050.cinema.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;

@Service
public class MailService {
    private final JavaMailSender sender;
    private final String from;
    private final String baseUrl;

    public MailService(JavaMailSender sender,
            @Value("${app.mail.from}") String from,
            @Value("${app.frontend.baseUrl:http://localhost:3000}") String baseUrl) {
        this.sender = sender;
        this.from = from;
        // normalize: remove any trailing slashes
        this.baseUrl = stripTrailingSlashes(baseUrl);
    }

    public void send(String to, String subject, String body) throws MailException {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(body);
        sender.send(msg);
    }

    public String frontendUrl() {
        return baseUrl;
    }

    public String frontendUrl(HttpServletRequest request) {
        if (request != null) {
            String origin = request.getHeader("Origin");
            if (origin != null && !origin.isBlank()) {
                return normalizeOrigin(origin);
            }
            String referer = request.getHeader("Referer");
            if (referer != null && !referer.isBlank()) {
                try {
                    URI u = URI.create(referer);
                    return buildOrigin(u);
                } catch (IllegalArgumentException ignored) {
                }
            }
        }
        return baseUrl;
    }

    private static String normalizeOrigin(String origin) {
        try {
            URI u = URI.create(origin);
            return buildOrigin(u);
        } catch (IllegalArgumentException e) {
            return stripTrailingSlashes(origin);
        }
    }

    private static String buildOrigin(URI u) {
        String scheme = u.getScheme() == null ? "http" : u.getScheme();
        String host = u.getHost();
        int port = u.getPort();
        StringBuilder sb = new StringBuilder();
        sb.append(scheme).append("://").append(host);
        if (port != -1)
            sb.append(":").append(port);
        return sb.toString();
    }

    private static String stripTrailingSlashes(String s) {
        if (s == null)
            return null;
        int i = s.length();
        while (i > 0 && s.charAt(i - 1) == '/')
            i--;
        return s.substring(0, i);
    }
}
