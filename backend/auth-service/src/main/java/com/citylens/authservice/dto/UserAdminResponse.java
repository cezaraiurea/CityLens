package com.citylens.authservice.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAdminResponse {

    private UUID id;
    private String email;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
