package com.citylens.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @Email(message = "Email invalid!")
    @NotBlank(message = "Email-ul este obligatoriu!")
    private String email;

    @NotBlank(message = "Parola este obligatorie!")
    private String password;
}
