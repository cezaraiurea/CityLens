package com.citylens.authservice.service;

import com.citylens.authservice.dto.UserAdminResponse;
import com.citylens.authservice.entity.User;
import com.citylens.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${user-service.url}")
    private String userServiceUrl;

    public List<UserAdminResponse> getAllUsers() {
        List<UserAdminResponse> result = new ArrayList<>();
        for(User user : userRepository.findAll()) {
            result.add(UserAdminResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .createdAt(user.getCreatedAt())
                    .lastLogin(user.getLastLogin())
                    .build());
        }
        return result;
    }

    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User with id " + id + " not found"));
        if("ROLE_ADMIN".equals(user.getRole())) {
            throw new RuntimeException("You can't delete the admin");
        }
        userRepository.deleteById(id);

        try {
            restTemplate.delete(userServiceUrl + "/api/users/internal/" + id);
        } catch (Exception e) {
            System.out.println("Error deleting user: " + e.getMessage());
        }
    }
}
