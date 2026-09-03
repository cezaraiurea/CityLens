package com.citylens.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForgotPasswordRequest {

    @Email(message = "Invalid email!")
    @NotBlank(message = "Email is mandatory!")
    private String email;
}
