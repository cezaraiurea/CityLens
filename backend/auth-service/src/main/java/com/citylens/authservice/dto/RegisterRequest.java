package com.citylens.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @Email(message = "Email invalid!")
    @NotBlank(message = "Email-ul este obligatoriu!")
    private String email;

    @NotBlank(message = "Parola este obligatorie!")
    @Size(min = 6, message = "Parola trebuie sa contina minim 6 caractere!")
    private String password;

    @NotBlank(message = "Numele este obligatoriu!")
    private String fullName;

}
