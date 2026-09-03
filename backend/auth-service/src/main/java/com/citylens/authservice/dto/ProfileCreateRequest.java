package com.citylens.authservice.dto;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileCreateRequest {

    private UUID userId;
    private String email;
    private String fullName;
}
