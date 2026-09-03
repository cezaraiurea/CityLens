package com.citylens.userservice.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {

    private UUID userId;
    private String email;
    private String fullName;
    private String profilePic;
    private String bio;
    private String phoneNumber;
    private LocalDateTime createdAt;
}
