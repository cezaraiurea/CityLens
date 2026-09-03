package com.citylens.authservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendResetEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Reset password for CityLens account");
        message.setText("You requested a password reset for your CityLens account. \n\n" +
                "Click the link below to set a new password:\n" +
                resetLink + "\n\n" +
                "This link is valid for 15 minutes. If you didn't request this, please ignore the email.");
        mailSender.send(message);
    }
}
