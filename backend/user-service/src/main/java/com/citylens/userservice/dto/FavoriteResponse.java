package com.citylens.userservice.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteResponse {
    private Long id;
    private LocalDateTime savedAt;
    private FavoriteLocationDetails location;
}
