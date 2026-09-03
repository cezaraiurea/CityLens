package com.citylens.userservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileUpdate {

    private String fullName;
    private String profilePic;
    private String bio;
    private String phoneNumber;
}
