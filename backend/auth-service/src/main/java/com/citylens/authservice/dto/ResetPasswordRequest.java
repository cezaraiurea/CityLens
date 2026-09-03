package com.citylens.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResetPasswordRequest {

    @NotBlank(message = "Token is mandatory!")
    private String token;

    @NotBlank(message = "Password is mandatory!")
    @Size(min = 6, message = "The password must contain at least 6 characters!")
    private String newPassword;
}
