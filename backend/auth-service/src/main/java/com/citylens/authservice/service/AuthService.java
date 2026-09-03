package com.citylens.authservice.service;

import com.citylens.authservice.dto.AuthResponse;
import com.citylens.authservice.dto.LoginRequest;
import com.citylens.authservice.dto.ProfileCreateRequest;
import com.citylens.authservice.dto.RegisterRequest;
import com.citylens.authservice.entity.User;
import com.citylens.authservice.repository.UserRepository;
import com.citylens.authservice.security.JwtService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final RestTemplate restTemplate;

    @Value("${user-service.url}")
    private String userServiceUrl;

    @Value("${frontend.url}")
    private String frontendUrl;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("This email is already used!");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("ROLE_USER")
                .lastLogin(LocalDateTime.now())
                .build();

        userRepository.save(user);

        try {
            ProfileCreateRequest profileRequest = ProfileCreateRequest.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(request.getFullName())
                    .build();

            restTemplate.postForObject(userServiceUrl + "/api/users/internal/create",
                    profileRequest,
                    Void.class);

        }
        catch (Exception e) {
            System.out.println(e.getMessage());
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole());

        return new AuthResponse(token, user.getRole());

    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
        } else {
            throw new RuntimeException("User not found!");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password!");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return new AuthResponse(token, user.getRole());

    }

    public void forgotPassword(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return;
        }

        User user = userOptional.get();
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendResetEmail(user.getEmail(), resetLink);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if(user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token is expired!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
}
